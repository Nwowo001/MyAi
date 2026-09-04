/**
 * @fileoverview ChannelAdapter interface.
 *
 * Every messaging channel (WhatsApp, Instagram, Facebook, etc.) must implement
 * this interface to integrate with AutoAgent.
 *
 * The adapter is responsible for:
 * 1. Parsing raw webhook payloads into NormalizedInboundMessages.
 * 2. Sending NormalizedOutboundMessages through the channel's API.
 * 3. Verifying webhook signatures from the platform.
 *
 * The conversation engine and AI orchestrator ONLY interact with this interface —
 * they never call WhatsApp or Instagram APIs directly. This makes adding
 * new channels a matter of implementing this interface, nothing more.
 *
 * Implemented adapters:
 * - WhatsAppAdapter (apps/api/src/integrations/whatsapp/adapter.ts) — Phase 11
 *
 * Planned adapters:
 * - InstagramAdapter — future
 * - FacebookAdapter — future
 * - WebsiteChatAdapter — future
 *
 * Usage (in dispatcher.ts):
 * ```ts
 * const adapter = adapterRegistry.get(channel);
 * const message = adapter.parseInbound(webhookPayload);
 * await adapter.send(outboundMessage);
 * ```
 */

import type {
  NormalizedInboundMessage,
  NormalizedOutboundMessage,
  SendMessageResult,
} from './normalizedMessage.js';
import type { Channel } from '@autoagent/shared';

/**
 * Contract that every channel adapter must implement.
 */
export interface ChannelAdapter {
  /**
   * The channel this adapter handles.
   * Used by the dispatcher to route messages to the correct adapter.
   */
  readonly channel: Channel;

  /**
   * Parse a raw webhook payload from the platform into a NormalizedInboundMessage.
   *
   * @param payload - The raw request body from the webhook
   * @returns Array of normalized messages (a single webhook may contain multiple)
   * @throws {ChannelAdapterError} if the payload is malformed or invalid
   */
  parseInboundWebhook(payload: Record<string, unknown>): NormalizedInboundMessage[];

  /**
   * Verify the webhook request signature from the platform.
   * Prevents processing forged webhook payloads.
   *
   * @param payload - Raw request body as a Buffer (before JSON parsing)
   * @param signature - The signature header value from the request
   * @returns true if the signature is valid, false otherwise
   */
  verifyWebhookSignature(payload: Buffer, signature: string): boolean;

  /**
   * Send a message to a customer through this channel.
   *
   * @param message - The normalized outbound message to send
   * @returns The result of the send operation
   */
  send(message: NormalizedOutboundMessage): Promise<SendMessageResult>;

  /**
   * Handle a GET request to the webhook URL (used for verification challenges).
   * Not all channels require this (WhatsApp does; Instagram does not).
   *
   * @param queryParams - The query parameters from the GET request
   * @returns The challenge string to return, or null if not applicable
   */
  handleVerificationChallenge?(queryParams: Record<string, string>): string | null;
}

/**
 * Error thrown by channel adapters.
 */
export class ChannelAdapterError extends Error {
  constructor(
    public readonly channel: Channel,
    public readonly code: string,
    message: string,
    public readonly retryable: boolean = false,
    cause?: unknown,
  ) {
    super(message, { cause });
    this.name = 'ChannelAdapterError';
  }
}

/**
 * Registry of active channel adapters.
 * Adapters are registered here and retrieved by the message dispatcher.
 */
export class ChannelAdapterRegistry {
  private readonly adapters = new Map<Channel, ChannelAdapter>();

  /**
   * Register a channel adapter.
   * @throws {Error} if an adapter for the channel is already registered
   */
  register(adapter: ChannelAdapter): void {
    if (this.adapters.has(adapter.channel)) {
      throw new Error(`Adapter for channel ${adapter.channel} is already registered`);
    }
    this.adapters.set(adapter.channel, adapter);
  }

  /**
   * Retrieve the adapter for a given channel.
   * @throws {ChannelAdapterError} if no adapter is registered for the channel
   */
  get(channel: Channel): ChannelAdapter {
    const adapter = this.adapters.get(channel);
    if (!adapter) {
      throw new ChannelAdapterError(
        channel,
        'ADAPTER_NOT_FOUND',
        `No adapter registered for channel: ${channel}`,
      );
    }
    return adapter;
  }

  /** Check if an adapter is registered for a given channel. */
  has(channel: Channel): boolean {
    return this.adapters.has(channel);
  }

  /** List all registered channels. */
  registeredChannels(): Channel[] {
    return Array.from(this.adapters.keys());
  }
}

/** Singleton adapter registry instance. */
export const channelAdapterRegistry = new ChannelAdapterRegistry();
