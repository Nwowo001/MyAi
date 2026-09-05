/**
 * @fileoverview Offering validation schemas.
 */

import { z } from 'zod';

export const CreateOfferingSchema = z.object({
  type: z.enum(['PRODUCT', 'SERVICE']),
  name: z
    .string()
    .min(2, 'Offering name must be at least 2 characters')
    .max(200, 'Offering name must be at most 200 characters')
    .trim(),
  description: z.string().max(2000).trim().optional().nullable(),
  price: z.number().min(0, 'Price must be 0 or greater'),
  currency: z.string().max(10).optional(),
  durationMinutes: z
    .number()
    .int()
    .positive('Duration must be a positive number of minutes')
    .optional()
    .nullable(),
  sku: z.string().max(100).optional().nullable(),
  stockQuantity: z
    .number()
    .int()
    .min(0, 'Stock quantity cannot be negative')
    .optional()
    .nullable(),
  isActive: z.boolean().optional(),
});

export const UpdateOfferingSchema = CreateOfferingSchema.partial().omit({
  type: true,
});

export type CreateOfferingInput = z.infer<typeof CreateOfferingSchema>;
export type UpdateOfferingInput = z.infer<typeof UpdateOfferingSchema>;

