/**
 * @fileoverview AI Tool Types and Enumerations.
 *
 * Separated from registry.ts to prevent circular module evaluation in ESM.
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
