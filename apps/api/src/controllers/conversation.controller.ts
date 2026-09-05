/**
 * @fileoverview Conversation management controller.
 *
 * REST endpoints for the Conversations Inbox:
 * GET    /:businessId/conversations              — List all conversations
 * GET    /:businessId/conversations/:id          — Get single conversation
 * GET    /:businessId/conversations/:id/messages — Get all messages in thread
 * POST   /:businessId/conversations/:id/reply    — Agent manual reply
 * PATCH  /:businessId/conversations/:id/handover — Toggle human handover
 * PATCH  /:businessId/conversations/:id/resolve  — Mark conversation resolved
 */

import type { Request, Response } from 'express';
import { conversationRepository } from '../repositories/conversation.repository.js';
import { logger } from '../utils/logger.js';

// ── List conversations ────────────────────────────────────────────────────

export async function listConversations(req: Request, res: Response): Promise<void> {
  try {
    const { businessId } = req.params as { businessId: string };
    const conversations = await conversationRepository.findMany(businessId);
    res.json({ data: conversations, count: conversations.length });
  } catch (err) {
    logger.error({ err }, 'listConversations failed');
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
}

// ── Get single conversation ───────────────────────────────────────────────

export async function getConversation(req: Request, res: Response): Promise<void> {
  try {
    const { businessId, conversationId } = req.params as {
      businessId: string;
      conversationId: string;
    };
    const conversation = await conversationRepository.findById(businessId, conversationId);
    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }
    res.json({ data: conversation });
  } catch (err) {
    logger.error({ err }, 'getConversation failed');
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
}

// ── Get messages ─────────────────────────────────────────────────────────

export async function getMessages(req: Request, res: Response): Promise<void> {
  try {
    const { businessId, conversationId } = req.params as {
      businessId: string;
      conversationId: string;
    };

    // Verify conversation belongs to business
    const conversation = await conversationRepository.findById(businessId, conversationId);
    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    const messages = await conversationRepository.getMessages(conversationId);
    res.json({ data: messages, count: messages.length });
  } catch (err) {
    logger.error({ err }, 'getMessages failed');
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
}

// ── Manual agent reply ────────────────────────────────────────────────────

export async function replyToConversation(req: Request, res: Response): Promise<void> {
  try {
    const { businessId, conversationId } = req.params as {
      businessId: string;
      conversationId: string;
    };
    const { content } = req.body as { content: string };

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      res.status(400).json({ error: 'content is required' });
      return;
    }

    // Verify conversation belongs to business
    const conversation = await conversationRepository.findById(businessId, conversationId);
    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    const message = await conversationRepository.createMessage(
      conversationId,
      'HUMAN_AGENT',
      content.trim(),
    );

    res.status(201).json({ data: message });
  } catch (err) {
    logger.error({ err }, 'replyToConversation failed');
    res.status(500).json({ error: 'Failed to send reply' });
  }
}

// ── Toggle handover ───────────────────────────────────────────────────────

export async function updateHandover(req: Request, res: Response): Promise<void> {
  try {
    const { businessId, conversationId } = req.params as {
      businessId: string;
      conversationId: string;
    };
    const { humanHandover, reason } = req.body as { humanHandover: boolean; reason?: string };

    if (typeof humanHandover !== 'boolean') {
      res.status(400).json({ error: 'humanHandover (boolean) is required' });
      return;
    }

    const conversation = await conversationRepository.findById(businessId, conversationId);
    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    await conversationRepository.setHandover(conversationId, humanHandover, reason);
    res.json({ success: true, humanHandover, reason });
  } catch (err) {
    logger.error({ err }, 'updateHandover failed');
    res.status(500).json({ error: 'Failed to update handover status' });
  }
}

// ── Resolve conversation ──────────────────────────────────────────────────

export async function resolveConversation(req: Request, res: Response): Promise<void> {
  try {
    const { businessId, conversationId } = req.params as {
      businessId: string;
      conversationId: string;
    };

    const conversation = await conversationRepository.findById(businessId, conversationId);
    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    await conversationRepository.updateStatus(conversationId, 'RESOLVED');
    await conversationRepository.createMessage(
      conversationId,
      'SYSTEM',
      'Conversation marked as resolved by agent.',
    );

    res.json({ success: true, message: 'Conversation resolved' });
  } catch (err) {
    logger.error({ err }, 'resolveConversation failed');
    res.status(500).json({ error: 'Failed to resolve conversation' });
  }
}
