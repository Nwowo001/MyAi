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
import type { RegisteredTool } from './types.js';
import { searchOfferingsTool } from './searchOfferings.tool.js';
import { requestHumanAgentTool } from './requestHumanAgent.tool.js';

export * from './types.js';

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

aiToolRegistry.register(searchOfferingsTool);
aiToolRegistry.register(requestHumanAgentTool);
