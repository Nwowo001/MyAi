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
export {};
//# sourceMappingURL=ai.types.js.map