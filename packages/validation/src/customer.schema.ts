/**
 * @fileoverview Customer validation schemas.
 */

import { z } from 'zod';

export const CreateCustomerSchema = z.object({
  name: z.string().min(1).max(200).trim().optional(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional(),
  email: z.string().email('Invalid email address').optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const UpdateCustomerSchema = CreateCustomerSchema.partial();

export type CreateCustomerInput = z.infer<typeof CreateCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof UpdateCustomerSchema>;
