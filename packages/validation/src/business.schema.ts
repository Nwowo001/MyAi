/**
 * @fileoverview Business validation schemas.
 *
 * Used for:
 * - Validating API request bodies on the backend (Express middleware)
 * - Validating form inputs on the frontend (React Hook Form + Zod resolver)
 */

import { z } from 'zod';

/** Valid ISO 4217 currency codes supported by AutoAgent. */
const SUPPORTED_CURRENCIES = [
  'NGN', 'USD', 'GBP', 'EUR', 'GHS', 'KES', 'ZAR', 'CAD', 'AUD',
] as const;

/** Zod enum for supported currencies */
export const CurrencyCodeSchema = z.enum(SUPPORTED_CURRENCIES);

/**
 * Schema for creating a new business.
 * Used during onboarding (Step 2–4).
 */
export const CreateBusinessSchema = z.object({
  name: z
    .string()
    .min(2, 'Business name must be at least 2 characters')
    .max(100, 'Business name must be at most 100 characters')
    .trim(),
  description: z
    .string()
    .max(1000, 'Description must be at most 1000 characters')
    .trim()
    .optional(),
  industry: z.string().max(100).trim().optional(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional(),
  email: z.string().email('Invalid email address').optional(),
  website: z.string().url('Invalid website URL').optional(),
  address: z.string().max(500).trim().optional(),
  timezone: z.string().default('Africa/Lagos'),
  currency: CurrencyCodeSchema.default('NGN'),
});

/** Schema for updating an existing business. All fields optional. */
export const UpdateBusinessSchema = CreateBusinessSchema.partial();

export type CreateBusinessInput = z.infer<typeof CreateBusinessSchema>;
export type UpdateBusinessInput = z.infer<typeof UpdateBusinessSchema>;
