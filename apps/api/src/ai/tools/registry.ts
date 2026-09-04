/**
 * @fileoverview AI Tool Registry.
 *
 * Tools are controlled backend functions that the AI can call during a conversation.
 * They are the mechanism through which the AI takes real business actions.
 *
 * CRITICAL SAFETY RULE:
 * The AI NEVER executes tools directly. Instead:
 * 1. The AI requests a tool call with arguments.
 * 2. The orchestrator intercepts the request.
 * 3. The orchestrator validates arguments against the tool's schema.
 * 4. The orchestrator verifies the business owns the referenced resources.
 * 5. The orchestrator executes the tool function.
 * 6. The result is returned to the AI as a tool response message.
 * 7. The AI generates a natural language response BASED ON the result.
 *
 * The AI NEVER claims an action succeeded without a SUCCESS result from the tool.
 *
 * Phase 1: Registry structure and tool type definitions.
 * Phase 9 (AI Orchestration): Full tool implementations.
 */

import type { AIToolDefinition } from '@autoagent/shared';

/**
 * Context passed to every tool execution.
 * Tools must use this context for authorization and tenant isolation.
 */
export interface ToolExecutionContext {
  /** The business this tool is executing for (tenant isolation) */
  businessId: string;
  /** The conversation this tool is executing in */
  conversationId: string;
  /** The customer this conversation is with */
  customerId: string;
  /** The authenticated user (AI orchestrator's service identity) */
  executedBy: 'AI_ORCHESTRATOR';
}

/**
 * Possible outcomes from a tool execution.
 */
export type ToolResult =
  | { success: true; data: Record<string, unknown> }
  | { success: false; error: { code: string; message: string } };

/**
 * A registered AI tool with its definition and execution function.
 */
export interface RegisteredTool {
  /** The OpenAI-compatible tool definition sent to the LLM */
  definition: AIToolDefinition;
  /**
   * The actual function to execute when the AI calls this tool.
   * MUST validate arguments and verify business ownership before executing.
   */
  execute: (
    args: Record<string, unknown>,
    context: ToolExecutionContext,
  ) => Promise<ToolResult>;
}

/**
 * Tool names enum — all available AI tools.
 * Using an enum prevents typos when referencing tool names.
 */
export enum ToolName {
  SEARCH_OFFERINGS = 'searchOfferings',
  GET_OFFERING_DETAILS = 'getOfferingDetails',
  CHECK_INVENTORY = 'checkInventory',
  CHECK_SERVICE_AVAILABILITY = 'checkServiceAvailability',
  CALCULATE_QUOTE = 'calculateQuote',
  CREATE_LEAD = 'createLead',
  CREATE_BOOKING = 'createBooking',
  CREATE_ORDER = 'createOrder',
  GENERATE_PAYMENT_LINK = 'generatePaymentLink',
  CHECK_PAYMENT_STATUS = 'checkPaymentStatus',
  CHECK_ORDER_STATUS = 'checkOrderStatus',
  REQUEST_HUMAN_AGENT = 'requestHumanAgent',
}

/**
 * The AI Tool Registry.
 * Tools are registered here and retrieved by the orchestrator for each conversation.
 */
export class AIToolRegistry {
  private readonly tools = new Map<string, RegisteredTool>();

  /**
   * Register a tool.
   * @throws {Error} if a tool with the same name is already registered
   */
  register(tool: RegisteredTool): void {
    const name = tool.definition.name;
    if (this.tools.has(name)) {
      throw new Error(`Tool "${name}" is already registered`);
    }
    this.tools.set(name, tool);
  }

  /**
   * Get a registered tool by name.
   * @throws {Error} if the tool is not found
   */
  get(name: string): RegisteredTool {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool "${name}" is not registered`);
    }
    return tool;
  }

  /** Check if a tool is registered. */
  has(name: string): boolean {
    return this.tools.has(name);
  }

  /** Get all registered tool definitions (sent to the LLM). */
  getAllDefinitions(): AIToolDefinition[] {
    return Array.from(this.tools.values()).map((t) => t.definition);
  }

  /** List all registered tool names. */
  registeredNames(): string[] {
    return Array.from(this.tools.keys());
  }
}

/** Singleton tool registry instance. */
export const aiToolRegistry = new AIToolRegistry();

// TODO (Phase 9): Import and register all tools:
//
// import { searchOfferingsTool } from './searchOfferings.tool.js';
// import { checkServiceAvailabilityTool } from './checkAvailability.tool.js';
// import { createBookingTool } from './createBooking.tool.js';
// import { generatePaymentLinkTool } from './generatePaymentLink.tool.js';
// import { requestHumanAgentTool } from './requestHumanAgent.tool.js';
// ... etc.
//
// aiToolRegistry.register(searchOfferingsTool);
// aiToolRegistry.register(checkServiceAvailabilityTool);
// ... etc.
