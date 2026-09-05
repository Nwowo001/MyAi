/**
 * @fileoverview AI Conversation Orchestrator.
 *
 * This is the brain of AutoAgent. For every inbound customer message it:
 *
 * 1. Loads conversation history from the database.
 * 2. Builds a business-aware system prompt.
 * 3. Sends the conversation to the configured LLM provider.
 * 4. Intercepts any tool calls requested by the AI.
 * 5. Executes each tool within a strict ToolExecutionContext (tenant-isolated).
 * 6. Feeds tool results back to the LLM for the final response.
 * 7. Persists every new message (customer, AI, tool) to the database.
 * 8. Returns the AI's natural language response.
 *
 * SAFETY CONTRACT:
 * - The AI never executes tools directly — the orchestrator mediates all tool calls.
 * - Every tool execution is scoped to the businessId of the conversation.
 * - If the AI requests an unknown tool, it is rejected with an error result.
 * - Human handover is detected and propagated to the conversation state.
 */

import { getAIProvider } from './provider/factory.js';
import { aiToolRegistry, type ToolExecutionContext } from './tools/registry.js';
import { buildSystemPrompt } from './promptBuilder.js';
import { conversationRepository } from '../repositories/conversation.repository.js';
import { logger } from '../utils/logger.js';
import type { AIMessage } from '@autoagent/shared';

const MAX_TOOL_ROUNDS = 5; // Prevent infinite tool-call loops

export interface OrchestratorResult {
  /** The AI's final natural language reply to send to the customer */
  reply: string;
  /** True if the AI requested a human agent handover */
  humanHandover: boolean;
  /** Reason for handover if humanHandover is true */
  handoverReason?: string;
}

/**
 * Process an inbound customer message through the full AI pipeline.
 *
 * @param businessId  - The business tenant this conversation belongs to
 * @param customerId  - The customer who sent the message
 * @param inboundText - The raw message text from the customer
 * @returns The AI's reply and any handover flags
 */
export async function processMessage(
  businessId: string,
  customerId: string,
  inboundText: string,
): Promise<OrchestratorResult> {
  // ── 1. Ensure conversation exists ─────────────────────────────────────────
  const conversation = await conversationRepository.createOrGetConversation(businessId, customerId);
  const conversationId = conversation.id;

  // ── 2. Persist the inbound customer message ────────────────────────────────
  await conversationRepository.createMessage(conversationId, 'CUSTOMER', inboundText);

  // ── 3. Load full conversation history ─────────────────────────────────────
  const rawHistory = await conversationRepository.getMessages(conversationId);

  // ── 4. Build system prompt with business context ───────────────────────────
  let systemPrompt: string;
  try {
    systemPrompt = await buildSystemPrompt(businessId);
  } catch (err) {
    logger.error({ err, businessId }, 'Failed to build system prompt');
    systemPrompt = 'You are a professional customer support AI agent.';
  }

  // ── 5. Build the message history for the LLM ─────────────────────────────
  // The first message is always the system prompt
  const messages: AIMessage[] = [
    { role: 'system', content: systemPrompt },
    ...rawHistory.map((m): AIMessage => {
      switch (m.senderType) {
        case 'CUSTOMER':
          return { role: 'user', content: m.content };
        case 'AI_AGENT':
        case 'HUMAN_AGENT':
          return { role: 'assistant', content: m.content };
        default:
          return { role: 'user', content: m.content };
      }
    }),
  ];

  // ── 6. Get tool definitions for this request ───────────────────────────────
  const tools = aiToolRegistry.getAllDefinitions();
  const provider = getAIProvider();

  // Tool execution context (tenant-scoped)
  const toolContext: ToolExecutionContext = {
    businessId,
    conversationId,
    customerId,
    executedBy: 'AI_ORCHESTRATOR',
  };

  let humanHandover = false;
  let handoverReason: string | undefined;
  let finalReply = '';

  // ── 7. Agentic loop — iterate until stop or max rounds ────────────────────
  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const response = await provider.complete({
      businessId,
      messages,
      tools,
      maxTokens: 800,
      temperature: 0.7,
    });

    const { content, toolCalls, finishReason } = response;

    // If no tool calls → final answer
    if (!toolCalls || toolCalls.length === 0 || finishReason === 'stop') {
      finalReply = content ?? '';
      break;
    }

    // Add the assistant's tool-call turn to message history
    messages.push({
      role: 'assistant',
      content: content ?? null,
      toolCalls,
    });

    // ── 8. Execute each tool call ────────────────────────────────────────────
    for (const toolCall of toolCalls) {
      const toolName = toolCall.name;

      let toolResultContent: string;

      if (!aiToolRegistry.has(toolName)) {
        // Unknown tool — return a safe error
        logger.warn({ toolName, businessId }, 'AI requested unknown tool');
        toolResultContent = JSON.stringify({
          success: false,
          error: { code: 'UNKNOWN_TOOL', message: `Tool "${toolName}" is not available.` },
        });
      } else {
        const tool = aiToolRegistry.get(toolName);
        try {
          const result = await tool.execute(toolCall.arguments, toolContext);
          toolResultContent = JSON.stringify(result);

          // Detect human handover from requestHumanAgent tool
          if (toolName === 'requestHumanAgent' && result.success) {
            humanHandover = true;
            handoverReason =
              (result.data['reason'] as string) ?? 'AI requested human agent';
          }
        } catch (err) {
          logger.error({ err, toolName, businessId }, 'Tool execution threw unexpectedly');
          toolResultContent = JSON.stringify({
            success: false,
            error: { code: 'TOOL_ERROR', message: 'Tool execution failed' },
          });
        }
      }

      // Add tool result message
      messages.push({
        role: 'tool',
        toolCallId: toolCall.id,
        content: toolResultContent,
      });
    }

    // If it was tool_calls finish reason, continue loop for final reply
    if (finishReason !== 'tool_calls') {
      finalReply = content ?? '';
      break;
    }
  }

  // ── 9. Fallback if loop exhausted without a reply ─────────────────────────
  if (!finalReply) {
    finalReply =
      "I'm sorry, I wasn't able to process your request fully. Please try again or contact our support team.";
  }

  // ── 10. Persist AI reply ──────────────────────────────────────────────────
  await conversationRepository.createMessage(conversationId, 'AI_AGENT', finalReply);

  // ── 11. Apply human handover if requested ─────────────────────────────────
  if (humanHandover) {
    await conversationRepository.setHandover(conversationId, true, handoverReason);
    logger.info({ conversationId, businessId, handoverReason }, 'Human handover triggered');
  }

  logger.info(
    {
      conversationId,
      businessId,
      customerId,
      round: MAX_TOOL_ROUNDS,
      humanHandover,
      replyLength: finalReply.length,
    },
    'AI conversation turn complete',
  );

  return {
    reply: finalReply,
    humanHandover,
    ...(handoverReason !== undefined ? { handoverReason } : {}),
  };
}
