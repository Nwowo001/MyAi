/**
 * @fileoverview Order validation schemas.
 */

import { z } from 'zod';

export const OrderItemSchema = z.object({
  offeringId: z.string().uuid(),
  quantity: z.number().int().positive('Quantity must be at least 1'),
});

export const CreateOrderSchema = z.object({
  customerId: z.string().uuid(),
  items: z.array(OrderItemSchema).min(1, 'Order must have at least one item'),
  notes: z.string().max(2000).optional(),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type OrderItemInput = z.infer<typeof OrderItemSchema>;
