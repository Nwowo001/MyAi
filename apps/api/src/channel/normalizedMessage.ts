/**
 * @fileoverview Channel-agnostic normalized message type.
 *
 * When a message arrives from any channel (WhatsApp, Instagram, etc.),
 * the channel adapter converts it to this NormalizedMessage before passing
 * it to the conversation engine. This ensures the core AI system never
 * contains channel-specific logic.
 *
 * Flow:
 *   WhatsApp Webhook → WhatsAppAdapter → NormalizedMessage → ConversationEngine
 *   Instagram Webhook → InstagramAdapter → NormalizedMessage → ConversationEngine
 */

import type { Channel } from '@autoagent/shared';
import type { MessageType } from '@autoagent/shared';

/**
 * A channel-agnostic representation of an inbound customer message.
 */
export interface NormalizedInboundMessage {
  /** The channel this message arrived from */
  channel: Channel;

  /** The customer's identifier on the platform (e.g. WhatsApp phone number) */
  channelCustomerId: string;

  /** The business's channel identifier (e.g. WhatsApp phone number ID) */
  channelBusinessId: string;

  /** The message content */
  content: string;

  /** The type of content */
  messageType: MessageType;

  /** The raw message ID from the external platform (for deduplication) */
  externalMessageId: string;

  /** When the message was sent (from the external platform) */
  timestamp: Date;

  /** Optional: media URL if the message contains media */
  mediaUrl?: string;

  /** Optional: media MIME type */
  mediaMimeType?: string;

  /** Raw payload from the channel for audit purposes */
  rawPayload: Record<string, unknown>;
}

/**
 * A channel-agnostic representation of an outbound message to send to a customer.
 */
export interface NormalizedOutboundMessage {
  /** The channel to send through */
  channel: Channel;

  /** The customer's identifier on the platform */
  channelCustomerId: string;

  /** The business's channel identifier */
  channelBusinessId: string;

  /** The message content */
  content: string;

  /** The type of content */
  messageType: MessageType;

  /** Optional: media URL if sending media */
  mediaUrl?: string;

  /** Optional: reply to a specific message ID */
  replyToExternalMessageId?: string;
}

/**
 * Result of sending a message through a channel.
 */
export interface SendMessageResult {
  /** Whether the send succeeded */
  success: boolean;

  /** The external message ID assigned by the platform (for tracking) */
  externalMessageId?: string;

  /** Error details if send failed */
  error?: {
    code: string;
    message: string;
  };
}
