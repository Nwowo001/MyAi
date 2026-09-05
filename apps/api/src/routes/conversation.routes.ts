/**
 * @fileoverview Conversation inbox routes.
 * Nested under /businesses/:businessId
 */

import { Router } from 'express';
import {
  listConversations,
  getConversation,
  getMessages,
  replyToConversation,
  updateHandover,
  resolveConversation,
} from '../controllers/conversation.controller.js';

const router = Router({ mergeParams: true });

router.get('/', listConversations);
router.get('/:conversationId', getConversation);
router.get('/:conversationId/messages', getMessages);
router.post('/:conversationId/reply', replyToConversation);
router.patch('/:conversationId/handover', updateHandover);
router.patch('/:conversationId/resolve', resolveConversation);

export { router as conversationRouter };
