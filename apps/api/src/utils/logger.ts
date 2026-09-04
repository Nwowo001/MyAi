/**
 * @fileoverview Structured logger for the AutoAgent API.
 *
 * Uses pino for high-performance structured JSON logging.
 * In development, logs are pretty-printed. In production, raw JSON is output
 * for ingestion by log aggregation services (e.g. Datadog, CloudWatch).
 *
 * SECURITY: Never log secrets, tokens, passwords, or full payment details.
 *
 * Usage:
 * ```ts
 * import { logger } from '@/utils/logger';
 * logger.info({ businessId, conversationId }, 'AI response generated');
 * logger.error({ err, businessId }, 'Tool execution failed');
 * ```
 */

import pino from 'pino';
import { env, isDevelopment } from '../config/index.js';

/**
 * Standard log context fields for audit and debugging.
 * Add these to log calls when the information is available.
 */
export interface LogContext {
  businessId?: string;
  userId?: string;
  conversationId?: string;
  customerId?: string;
  requestId?: string;
  [key: string]: unknown;
}

export const logger = pino({
  level: isDevelopment ? 'debug' : 'info',
  ...(isDevelopment
    ? {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:HH:MM:ss',
            ignore: 'pid,hostname',
          },
        },
      }
    : {}),
  // Redact sensitive fields from all log output
  redact: {
    paths: [
      'accessToken',
      'refreshToken',
      'password',
      'secret',
      'apiKey',
      'authorization',
      'ENCRYPTION_KEY',
      'PAYSTACK_SECRET_KEY',
      'WHATSAPP_ACCESS_TOKEN',
      'AI_API_KEY',
    ],
    censor: '[REDACTED]',
  },
  base: {
    env: env.NODE_ENV,
    service: 'autoagent-api',
  },
});

/**
 * Create a child logger with pre-bound context fields.
 * Use this to avoid repeating businessId, conversationId, etc. on every log call.
 *
 * @example
 * const log = createChildLogger({ businessId: '123', conversationId: '456' });
 * log.info('Processing message');
 */
export function createChildLogger(context: LogContext) {
  return logger.child(context);
}
