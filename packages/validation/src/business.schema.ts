/**
 * @fileoverview Zod validation schemas for Business management.
 */

import { z } from 'zod';

export const CreateBusinessSchema = z.object({
  name: z.string().min(2, 'Business name must be at least 2 characters').max(100),
  description: z.string().max(500).optional(),
  industry: z.string().max(100).optional(),
  phone: z.string().max(30).optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  address: z.string().max(200).optional(),
  timezone: z.string().default('Africa/Lagos'),
  /** ISO 4217 code e.g. NGN, USD, GBP, EUR */
  currency: z.string().length(3, 'Currency must be a 3-letter ISO code').default('NGN'),
});

export const UpdateBusinessSchema = CreateBusinessSchema.partial();

export const InviteMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['ADMIN', 'AGENT']),
});

export const UpdateMemberRoleSchema = z.object({
  role: z.enum(['OWNER', 'ADMIN', 'AGENT']),
});

export type CreateBusinessSchemaType = z.infer<typeof CreateBusinessSchema>;
export type UpdateBusinessSchemaType = z.infer<typeof UpdateBusinessSchema>;
export type InviteMemberSchemaType = z.infer<typeof InviteMemberSchema>;
export type UpdateMemberRoleSchemaType = z.infer<typeof UpdateMemberRoleSchema>;
