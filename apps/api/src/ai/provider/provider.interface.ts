/**
 * @fileoverview AI Provider interface.
 *
 * CRITICAL ARCHITECTURE DOCUMENT:
 *
 * The AI orchestrator (orchestrator.ts) depends ONLY on this interface.
 * It NEVER imports OpenAI, Anthropic, or Google SDKs directly.
 *
 * To add a new AI provider:
 * 1. Create a new file in this directory: `yourprovider.provider.ts`
 * 2. Implement the AIProvider interface
 * 3. Export it from factory.ts
 * 4. Add 'yourprovider' to the AI_PROVIDER enum in config
 *
 * The rest of the application requires zero changes.
 *
 * This design is intentional. AI providers change rapidly:
 * - Pricing changes frequently
 * - New models are released regularly
 * - Quality differences emerge over time
 * - Fallback providers protect against outages
 *
 * Keeping the provider behind an interface means you can switch from
 * GPT-4o to Claude 3.5 to Gemini 2.0 by changing one environment variable.
 */

import type {
  AICompletionRequest,
  AICompletionResponse,
  AIProviderErrorInfo,
} from '@autoagent/shared';

/**
 * Contract that every AI provider adapter must implement.
 *
 * @example
 * class OpenAIProvider implements AIProvider {
 *   readonly providerName = 'openai';
 *   readonly modelName = 'gpt-4o';
 *
 *   async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
 *     // OpenAI-specific implementation
 *   }
 * }
 */
export interface AIProvider {
  /**
   * Send a completion request to the AI provider and return the response.
   *
   * Implementation requirements:
   * - MUST normalize the provider's response to AICompletionResponse shape.
   * - MUST throw AIProviderError on failure (not the provider's native error).
   * - MUST handle tool call responses correctly.
   * - SHOULD implement retry logic for transient failures.
   *
   * @param request - The completion request
   * @throws {AIProviderError} on provider failure
   */
  complete(request: AICompletionRequest): Promise<AICompletionResponse>;

  /**
   * Human-readable provider name.
   * Used for logging, audit trails, and error messages.
   * Examples: 'openai', 'anthropic', 'google'
   */
  readonly providerName: string;

  /**
   * The specific model being used.
   * Used for logging, cost tracking, and debugging.
   * Examples: 'gpt-4o', 'claude-3-5-sonnet-20241022', 'gemini-1.5-pro'
   */
  readonly modelName: string;
}

/**
 * Structured error thrown by AI provider adapters.
 * Catch this in the orchestrator to handle AI failures gracefully.
 */
export class AIProviderError extends Error {
  constructor(public readonly info: AIProviderErrorInfo) {
    super(info.message);
    this.name = 'AIProviderError';
  }

  /** Whether it is safe to retry this request. */
  get retryable(): boolean {
    return this.info.retryable;
  }
}
