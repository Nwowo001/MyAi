/**
 * @fileoverview Conversation and message domain types.
 *
 * Conversations are the central entity in AutoAgent. They track the
 * full interaction lifecycle between a customer and the business.
 */
import type { ConversationStatus, ConversationController } from '../enums/conversationStatus.enum';
import type { SenderType, MessageType } from '../enums/senderType.enum';
import type { Channel } from '../enums/channel.enum';
import type { Customer } from './customer.types';
/**
 * A conversation between a customer and a business.
 *
 * The `status` and `controller` fields drive the UI controls:
 * - When controller === 'AI': show "Take Over" button
 * - When controller === 'HUMAN': show "Resume AI" and "Resolve" buttons
 * - When status === 'RESOLVED': show "Reopen" button
 */
export interface Conversation {
    id: string;
    businessId: string;
    customerId: string;
    channel: Channel;
    status: ConversationStatus;
    controller: ConversationController;
    assignedUserId: string | null;
    escalationReason: string | null;
    lastMessageAt: string | null;
    resolvedAt: string | null;
    createdAt: string;
    updatedAt: string;
    /** Populated when fetching conversation with customer details */
    customer?: Customer;
    /** Most recent message preview (populated in list views) */
    lastMessage?: Pick<Message, 'content' | 'senderType' | 'createdAt'>;
    /** Count of unread messages */
    unreadCount?: number;
}
/**
 * A single message within a conversation.
 */
export interface Message {
    id: string;
    conversationId: string;
    senderType: SenderType;
    /** userId for HUMAN, null for AI/CUSTOMER/SYSTEM */
    senderId: string | null;
    content: string;
    messageType: MessageType;
    /** ID of the message in the external channel (e.g. WhatsApp message ID) */
    externalMessageId: string | null;
    metadata: Record<string, unknown>;
    createdAt: string;
}
/**
 * Payload for sending a message from the dashboard (human agent).
 */
export interface SendMessageInput {
    conversationId: string;
    content: string;
    messageType?: MessageType;
}
/**
 * Payload for transitioning conversation control.
 */
export interface ConversationControlInput {
    action: 'TAKE_OVER' | 'RESUME_AI' | 'RESOLVE' | 'REOPEN';
    reason?: string;
}
/**
 * Escalation event recorded when the AI requests human assistance.
 */
export interface EscalationEvent {
    conversationId: string;
    reason: string;
    triggeredBy: 'AI' | 'CUSTOMER' | 'SYSTEM';
    createdAt: string;
}
//# sourceMappingURL=conversation.types.d.ts.map