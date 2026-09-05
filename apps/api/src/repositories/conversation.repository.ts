/**
 * @fileoverview Conversation & Message repository using Prisma ORM.
 * Scoped by businessId. Aligned with ConversationStatus and SenderType enums.
 */

import { prisma } from '../config/db.js';

export type ConversationStatus = 'AI_ACTIVE' | 'HANDOVER_PENDING' | 'HUMAN_TAKEN_OVER' | 'RESOLVED';
export type SenderType = 'CUSTOMER' | 'AI_AGENT' | 'HUMAN_AGENT' | 'SYSTEM';

export interface ConversationWithDetails {
  id: string;
  businessId: string;
  customerId: string;
  channel: string;
  status: ConversationStatus;
  assignedAgentId: string | null;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
  };
  lastMessage?: {
    id: string;
    senderType: string;
    content: string;
    createdAt: string;
  } | null;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderType: SenderType;
  content: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

function mapConversation(c: any): ConversationWithDetails {
  const lastMsg = c.messages?.length > 0 ? c.messages[0] : null;
  return {
    id: c.id,
    businessId: c.businessId,
    customerId: c.customerId,
    channel: c.channel,
    status: c.status as ConversationStatus,
    assignedAgentId: c.assignedAgentId ?? null,
    lastMessageAt: c.lastMessageAt.toISOString(),
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    customer: c.customer,
    lastMessage: lastMsg
      ? {
          id: lastMsg.id,
          senderType: lastMsg.senderType,
          content: lastMsg.content,
          createdAt: lastMsg.createdAt.toISOString(),
        }
      : null,
  };
}

const CONVERSATION_INCLUDE = {
  customer: {
    select: { id: true, name: true, phone: true, email: true },
  },
  messages: {
    orderBy: { createdAt: 'desc' as const },
    take: 1,
  },
} as const;

export class ConversationRepository {
  async findMany(businessId: string): Promise<ConversationWithDetails[]> {
    const conversations = await prisma.conversation.findMany({
      where: { businessId },
      orderBy: { lastMessageAt: 'desc' },
      include: CONVERSATION_INCLUDE,
    });
    return conversations.map(mapConversation);
  }

  async findById(businessId: string, conversationId: string): Promise<ConversationWithDetails | null> {
    const c = await prisma.conversation.findFirst({
      where: { id: conversationId, businessId },
      include: CONVERSATION_INCLUDE,
    });
    return c ? mapConversation(c) : null;
  }

  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    const msgs = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });

    return msgs.map((m) => ({
      id: m.id,
      conversationId: m.conversationId,
      senderType: m.senderType as SenderType,
      content: m.content,
      metadata: (m.metadata as Record<string, unknown>) ?? {},
      createdAt: m.createdAt.toISOString(),
    }));
  }

  async createMessage(
    conversationId: string,
    senderType: SenderType,
    content: string,
    metadata: Record<string, unknown> = {},
  ): Promise<ChatMessage> {
    const msg = await prisma.message.create({
      data: {
        conversationId,
        senderType,
        content,
        metadata: metadata as any,
      },
    });

    // Touch lastMessageAt + updatedAt
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date(), updatedAt: new Date() },
    });

    return {
      id: msg.id,
      conversationId: msg.conversationId,
      senderType: msg.senderType as SenderType,
      content: msg.content,
      metadata: (msg.metadata as Record<string, unknown>) ?? {},
      createdAt: msg.createdAt.toISOString(),
    };
  }

  async createOrGetConversation(businessId: string, customerId: string): Promise<ConversationWithDetails> {
    let conversation = await prisma.conversation.findFirst({
      where: { businessId, customerId },
      include: CONVERSATION_INCLUDE,
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          businessId,
          customerId,
          channel: 'WHATSAPP',
          status: 'AI_ACTIVE',
        },
        include: CONVERSATION_INCLUDE,
      });
    }

    return mapConversation(conversation);
  }

  async setHandover(conversationId: string, humanHandover: boolean, reason?: string): Promise<void> {
    const newStatus: ConversationStatus = humanHandover ? 'HANDOVER_PENDING' : 'AI_ACTIVE';
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { status: newStatus },
    });

    // Log the handover reason as a system message if provided
    if (reason && humanHandover) {
      await this.createMessage(conversationId, 'SYSTEM', `Handover requested: ${reason}`);
    }
  }

  async updateStatus(conversationId: string, status: ConversationStatus): Promise<void> {
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { status },
    });
  }
}

export const conversationRepository = new ConversationRepository();
