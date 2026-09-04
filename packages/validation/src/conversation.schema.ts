/**
 * @fileoverview Conversation and message validation schemas.
 */

import { z } from 'zod';
import { MessageType } from '@autoagent/shared';

export const SendMessageSchema = z.object({
  conversationId: z.string().uuid('Invalid conversation ID'),
  content: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(4096, 'Message too long'),
  messageType: z.nativeEnum(MessageType).default(MessageType.TEXT),
});

export const ConversationControlSchema = z.object({
  action: z.enum(['TAKE_OVER', 'RESUME_AI', 'RESOLVE', 'REOPEN']),
  reason: z.string().max(500).optional(),
});

export const ListConversationsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(100).default(20),
  status: z.string().optional(),
  search: z.string().optional(),
});

export type SendMessageInput = z.infer<typeof SendMessageSchema>;
export type ConversationControlInput = z.infer<typeof ConversationControlSchema>;
