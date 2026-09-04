/**
 * @fileoverview Offering validation schemas.
 */

import { z } from 'zod';
import { OfferingType } from '@autoagent/shared';

export const CreateOfferingSchema = z.object({
  type: z.nativeEnum(OfferingType),
  name: z
    .string()
    .min(2, 'Offering name must be at least 2 characters')
    .max(200, 'Offering name must be at most 200 characters')
    .trim(),
  description: z.string().max(2000).trim().optional(),
  price: z.number().nonnegative('Price must be 0 or greater').optional(),
  duration: z
    .number()
    .int()
    .positive('Duration must be a positive number of minutes')
    .optional(),
  availability: z.record(z.unknown()).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const UpdateOfferingSchema = CreateOfferingSchema.partial().extend({
  active: z.boolean().optional(),
});

export type CreateOfferingInput = z.infer<typeof CreateOfferingSchema>;
export type UpdateOfferingInput = z.infer<typeof UpdateOfferingSchema>;
