/**
 * @fileoverview Customer validation schemas.
 */

import { z } from 'zod';
import { LeadStatus } from '@autoagent/shared';

export const LeadStatusSchema = z.nativeEnum(LeadStatus);

export const CreateCustomerSchema = z.object({
  name: z
    .string()
    .min(1, 'Customer name is required')
    .max(200, 'Name must be at most 200 characters')
    .trim(),
  phone: z
    .string()
    .max(50)
    .optional()
    .nullable(),
  email: z.string().email('Invalid email address').optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  tags: z.array(z.string().max(50)).optional(),
  leadStatus: LeadStatusSchema.optional(),
  budget: z.number().min(0).optional().nullable(),
});

export const UpdateCustomerSchema = CreateCustomerSchema.partial();

export type CreateCustomerInput = z.infer<typeof CreateCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof UpdateCustomerSchema>;
