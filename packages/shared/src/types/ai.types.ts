/**
 * @fileoverview AI provider abstraction types.
 *
 * These types form the contract between the AI orchestration layer and
 * any AI provider adapter (OpenAI, Anthropic, Google, etc.).
 *
 * DESIGN PRINCIPLE:
 * The AI orchestrator (orchestrator.ts) depends ONLY on these interfaces.
 * It never imports from a specific provider SDK directly. This ensures the
 * AI provider can be swapped without touching orchestration logic.
 */

/**
 * The role of a message in the conversation history sent to the LLM.
 */
export type AIMessageRole = 'system' | 'user' | 'assistant' | 'tool';

/**
 * A single message in the AI conversation context.
 */
export interface AIMessage {
  role: AIMessageRole;
  /** Text content. Null when role is 'assistant' and it returned a tool call. */
  content: string | null;
  /**
   * Present when role is 'tool'. Must match the `id` of the tool call
   * that was requested by the assistant.
   */
  toolCallId?: string;
  /** Present when role is 'assistant' and it requested tool execution. */
  toolCalls?: AIToolCall[];
  /** Optional name for disambiguation in multi-agent contexts. */
  name?: string;
}

/**
 * A tool call requested by the AI model.
 */
export interface AIToolCall {
  /** Unique ID for this invocation (used to match tool responses). */
  id: string;
  /** Must match a registered tool name. */
  name: string;
  /** Parsed arguments — the tool is responsible for validating these. */
  arguments: Record<string, unknown>;
}

/**
 * Definition of an AI-callable tool, following the JSON Schema convention
 * used by OpenAI function calling and equivalent APIs.
 */
export interface AIToolDefinition {
  /** Must match the key in the tool registry. */
  name: string;
  /** Clear description for the model — explains when and how to use the tool. */
  description: string;
  /** JSON Schema object describing the tool's parameters. */
  parameters: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
    additionalProperties?: boolean;
  };
}

/** Why the model stopped generating. */
export type AIFinishReason = 'stop' | 'tool_calls' | 'length' | 'content_filter' | 'error';

/** Token usage statistics from the provider. */
export interface AIUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

/**
 * Request sent to the AI provider for a completion.
 */
export interface AICompletionRequest {
  /** Full conversation history including the system prompt as the first message. */
  messages: AIMessage[];
  /** Tools available for this turn. Pass empty array to disable tool use. */
  tools?: AIToolDefinition[];
  /** Override the default max tokens for this request. */
  maxTokens?: number;
  /** Override the default temperature for this request. */
  temperature?: number;
  /** Business context — used for audit logging only, not sent to the LLM. */
  businessId?: string;
}

/**
 * Response from the AI provider after a completion.
 */
export interface AICompletionResponse {
  /** Text response. Null when the model chose to call a tool instead. */
  content: string | null;
  /** Tool calls requested by the model. Empty array if no tools were called. */
  toolCalls: AIToolCall[];
  finishReason: AIFinishReason;
  usage?: AIUsage;
}

/**
 * Structured error thrown by provider adapters.
 * Use this instead of raw Error so callers can handle provider errors specifically.
 */
export interface AIProviderErrorInfo {
  provider: string;
  code: string;
  message: string;
  retryable: boolean;
}
