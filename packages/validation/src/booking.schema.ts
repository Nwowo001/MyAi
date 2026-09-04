/**
 * @fileoverview Booking validation schemas.
 */

import { z } from 'zod';

export const CreateBookingSchema = z.object({
  customerId: z.string().uuid(),
  offeringId: z.string().uuid(),
  assignedUserId: z.string().uuid().optional(),
  startTime: z.string().datetime({ message: 'Invalid datetime format (use ISO 8601)' }),
  endTime: z.string().datetime().optional(),
  notes: z.string().max(2000).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const UpdateBookingSchema = z.object({
  assignedUserId: z.string().uuid().optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  notes: z.string().max(2000).optional(),
  status: z
    .enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED'])
    .optional(),
});

export type CreateBookingInput = z.infer<typeof CreateBookingSchema>;
export type UpdateBookingInput = z.infer<typeof UpdateBookingSchema>;
