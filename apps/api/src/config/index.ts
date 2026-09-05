/**
 * @fileoverview Environment configuration for the AutoAgent API server.
 *
 * This module loads and validates all required environment variables at startup.
 * The application will fail fast with a clear error if any required variable is missing.
 *
 * SECURITY: This module is server-side only. Never import from the frontend.
 */

import 'dotenv/config';
import { z } from 'zod';

/**
 * Environment variable schema.
 * All required variables are validated at startup; optional ones have defaults.
 */
const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // Server
  API_PORT: z.coerce.number().int().positive().default(4000),

  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  DIRECT_URL: z.string().url('DIRECT_URL must be a valid URL').optional(),

  // Supabase — backend only
  SUPABASE_URL: z.string().url().default('https://your-project-ref.supabase.co'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),
  SUPABASE_JWT_SECRET: z.string().min(1, 'SUPABASE_JWT_SECRET is required'),

  // AI Provider
  AI_PROVIDER: z.enum(['openai', 'anthropic', 'google']).default('openai'),
  AI_MODEL: z.string().default('gpt-4o'),
  AI_API_KEY: z.string().min(1, 'AI_API_KEY is required'),
  AI_MAX_TOKENS: z.coerce.number().int().positive().default(1024),
  AI_TEMPERATURE: z.coerce.number().min(0).max(2).default(0.7),

  // Meta / WhatsApp Platform (YOUR app credentials — shared across all tenants)
  META_APP_ID: z.string().min(1, 'META_APP_ID is required for WhatsApp Embedded Signup'),
  META_APP_SECRET: z.string().min(1, 'META_APP_SECRET is required'),
  // A single verify token YOU control, used to validate Meta's webhook calls to your server
  META_WEBHOOK_VERIFY_TOKEN: z.string().default('autoagent_webhook_verify'),
  META_API_VERSION: z.string().default('v21.0'),

  // Paystack
  PAYSTACK_SECRET_KEY: z.string().optional(),
  PAYSTACK_WEBHOOK_SECRET: z.string().optional(),

  // Encryption
  ENCRYPTION_KEY: z.string().length(64, 'ENCRYPTION_KEY must be exactly 64 hex characters'),

  // CORS
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
});

/**
 * Parse and validate environment variables.
 * Throws a descriptive error on failure — this is intentional "fail fast" behaviour.
 */
function parseEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    throw new Error(
      `\n[AutoAgent] Invalid environment configuration:\n${formatted}\n\nCheck your .env file and update missing variables.`,
    );
  }

  return result.data;
}

/** Validated environment variables. Import this instead of process.env directly. */
export const env = parseEnv();

/** Parsed CORS origins array from the CORS_ORIGINS environment variable. */
export const corsOrigins = env.CORS_ORIGINS.split(',').map((o) => o.trim());

/** Whether the application is running in production mode. */
export const isProduction = env.NODE_ENV === 'production';

/** Whether the application is running in development mode. */
export const isDevelopment = env.NODE_ENV === 'development';
