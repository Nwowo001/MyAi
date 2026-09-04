/**
 * @fileoverview OpenAI provider adapter.
 *
 * Implements the AIProvider interface using the OpenAI SDK.
 * This is the only file in the codebase that imports from 'openai'.
 *
 * Configuration is read from environment variables (via config/index.ts).
 * The model name is configurable — you can change from gpt-4o to any
 * OpenAI model by updating the AI_MODEL environment variable.
 *
 * Tool calling:
 * Uses OpenAI's function calling API. Tool definitions in AutoAgent's
 * AIToolDefinition format are mapped to OpenAI's function format on each request.
 *
 * Error handling:
 * OpenAI SDK errors are caught and converted to AIProviderError instances
 * so the orchestrator can handle them uniformly regardless of provider.
 */

import OpenAI from 'openai';
import type { AIProvider } from './provider.interface.js';
import { AIProviderError } from './provider.interface.js';
import type {
  AICompletionRequest,
  AICompletionResponse,
  AIMessage,
  AIToolCall,
  AIToolDefinition,
} from '@autoagent/shared';
import { env } from '../../config/index.js';
import { logger } from '../../utils/logger.js';

export class OpenAIProvider implements AIProvider {
  readonly providerName = 'openai';
  readonly modelName: string;

  private readonly client: OpenAI;

  constructor() {
    this.client = new OpenAI({ apiKey: env.AI_API_KEY });
    this.modelName = env.AI_MODEL;
  }

  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    const startTime = Date.now();

    try {
      const response = await this.client.chat.completions.create({
        model: this.modelName,
        messages: this.mapMessages(request.messages),
        tools: request.tools?.length
          ? request.tools.map((tool: AIToolDefinition) => ({
              type: 'function' as const,
              function: {
                name: tool.name,
                description: tool.description,
                parameters: tool.parameters as Record<string, unknown>,
              },
            }))
          : undefined,
        max_tokens: request.maxTokens ?? env.AI_MAX_TOKENS,
        temperature: request.temperature ?? env.AI_TEMPERATURE,
      });

      const choice = response.choices[0];
      if (!choice) {
        throw new AIProviderError({
          provider: this.providerName,
          code: 'NO_CHOICE',
          message: 'OpenAI returned no completion choices',
          retryable: true,
        });
      }

      const toolCalls: AIToolCall[] = (choice.message.tool_calls ?? []).map((tc) => ({
        id: tc.id,
        name: tc.function.name,
        arguments: this.parseToolArguments(tc.function.arguments),
      }));

      logger.debug(
        {
          businessId: request.businessId,
          model: this.modelName,
          finishReason: choice.finish_reason,
          promptTokens: response.usage?.prompt_tokens,
          completionTokens: response.usage?.completion_tokens,
          latencyMs: Date.now() - startTime,
          toolCallCount: toolCalls.length,
        },
        'OpenAI completion received',
      );

      return {
        content: choice.message.content,
        toolCalls,
        finishReason: this.mapFinishReason(choice.finish_reason),
        usage: response.usage
          ? {
              promptTokens: response.usage.prompt_tokens,
              completionTokens: response.usage.completion_tokens,
              totalTokens: response.usage.total_tokens,
            }
          : undefined,
      };
    } catch (err) {
      if (err instanceof AIProviderError) throw err;

      if (err instanceof OpenAI.APIError) {
        const retryable = err.status === 429 || (err.status ?? 0) >= 500;
        throw new AIProviderError({
          provider: this.providerName,
          code: `OPENAI_${err.status ?? 'UNKNOWN'}`,
          message: err.message,
          retryable,
        });
      }

      throw new AIProviderError({
        provider: this.providerName,
        code: 'OPENAI_UNEXPECTED',
        message: err instanceof Error ? err.message : 'Unknown OpenAI error',
        retryable: false,
      });
    }
  }

  /**
   * Map AutoAgent's AIMessage format to OpenAI's ChatCompletionMessageParam format.
   */
  private mapMessages(
    messages: AIMessage[],
  ): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
    return messages.map((msg): OpenAI.Chat.Completions.ChatCompletionMessageParam => {
      switch (msg.role) {
        case 'system':
          return { role: 'system', content: msg.content ?? '' };

        case 'user':
          return { role: 'user', content: msg.content ?? '' };

        case 'assistant':
          if (msg.toolCalls?.length) {
            return {
              role: 'assistant',
              content: msg.content ?? null,
              tool_calls: msg.toolCalls.map((tc: AIToolCall) => ({
                id: tc.id,
                type: 'function' as const,
                function: {
                  name: tc.name,
                  arguments: JSON.stringify(tc.arguments),
                },
              })),
            };
          }
          return { role: 'assistant', content: msg.content ?? '' };

        case 'tool':
          return {
            role: 'tool',
            content: msg.content ?? '',
            tool_call_id: msg.toolCallId ?? '',
          };

        default:
          return { role: 'user', content: msg.content ?? '' };
      }
    });
  }

  /**
   * Safely parse tool arguments JSON string.
   * Returns empty object if parsing fails.
   */
  private parseToolArguments(args: string): Record<string, unknown> {
    try {
      return JSON.parse(args) as Record<string, unknown>;
    } catch {
      logger.warn({ args }, 'Failed to parse tool arguments from OpenAI');
      return {};
    }
  }

  /**
   * Map OpenAI finish reasons to AutoAgent's AIFinishReason type.
   */
  private mapFinishReason(
    reason: string | null,
  ): AICompletionResponse['finishReason'] {
    switch (reason) {
      case 'stop':
        return 'stop';
      case 'tool_calls':
        return 'tool_calls';
      case 'length':
        return 'length';
      case 'content_filter':
        return 'content_filter';
      default:
        return 'stop';
    }
  }
}
