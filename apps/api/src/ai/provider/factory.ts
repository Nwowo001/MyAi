/**
 * @fileoverview AI provider factory.
 *
 * Creates and returns the configured AI provider instance.
 * The provider is determined by the AI_PROVIDER environment variable.
 *
 * To add a new provider:
 * 1. Implement the AIProvider interface in a new file.
 * 2. Import it here and add it to the switch statement.
 * 3. Update the AI_PROVIDER enum in config/index.ts.
 * 4. Set AI_PROVIDER=yourprovider in your environment.
 *
 * The provider is created once at startup and shared across the application.
 * It is safe to reuse because provider adapters are stateless.
 */

import type { AIProvider } from './provider.interface.js';
import { OpenAIProvider } from './openai.provider.js';
import { env } from '../../config/index.js';
import { logger } from '../../utils/logger.js';

/**
 * Create an AI provider instance based on the configured AI_PROVIDER.
 *
 * @throws {Error} if the configured provider is not supported
 */
export function createAIProvider(): AIProvider {
  const { AI_PROVIDER, AI_MODEL } = env;

  logger.info({ provider: AI_PROVIDER, model: AI_MODEL }, 'Initializing AI provider');

  switch (AI_PROVIDER) {
    case 'openai':
      return new OpenAIProvider();

    case 'anthropic':
      // TODO: Implement when Anthropic support is needed
      // import { AnthropicProvider } from './anthropic.provider.js';
      // return new AnthropicProvider();
      throw new Error(
        'Anthropic provider is not yet implemented. Set AI_PROVIDER=openai or implement AnthropicProvider.',
      );

    case 'google':
      // TODO: Implement when Google Gemini support is needed
      // import { GoogleProvider } from './google.provider.js';
      // return new GoogleProvider();
      throw new Error(
        'Google provider is not yet implemented. Set AI_PROVIDER=openai or implement GoogleProvider.',
      );

    default:
      throw new Error(
        `Unknown AI provider: "${AI_PROVIDER}". Supported providers: openai, anthropic, google`,
      );
  }
}

/**
 * Singleton AI provider instance.
 * Created once at module import time so the factory runs at startup.
 */
let _aiProvider: AIProvider | null = null;

/**
 * Get the singleton AI provider instance.
 * Lazily initialized on first call.
 */
export function getAIProvider(): AIProvider {
  if (!_aiProvider) {
    _aiProvider = createAIProvider();
  }
  return _aiProvider;
}
