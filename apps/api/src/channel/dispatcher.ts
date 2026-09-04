/**
 * @fileoverview Message dispatcher.
 *
 * Receives normalized inbound messages from channel adapters and routes them
 * to the conversation engine. Also routes outbound messages from the engine
 * back through the appropriate channel adapter.
 *
 * This is the single connection point between the channel layer and the
 * conversation/AI layer.
 *
 * Phase 1: Stub with documented interface.
 * Phase 8 (Conversation Engine) + Phase 11 (WhatsApp) will flesh this out.
 */

import type { NormalizedInboundMessage, NormalizedOutboundMessage } from './normalizedMessage.js';
import { channelAdapterRegistry } from './adapter.interface.js';
import { logger } from '../utils/logger.js';

/**
 * Dispatch an inbound message from a channel to the conversation engine.
 *
 * @param message - The normalized inbound message
 */
export async function dispatchInbound(message: NormalizedInboundMessage): Promise<void> {
  logger.info(
    {
      channel: message.channel,
      channelCustomerId: message.channelCustomerId,
      messageType: message.messageType,
      externalMessageId: message.externalMessageId,
    },
    'Dispatching inbound message',
  );

  // TODO (Phase 8): Route to conversation engine
  // const result = await conversationEngine.processInbound(message);
}

/**
 * Send an outbound message through the appropriate channel adapter.
 *
 * @param message - The normalized outbound message to send
 */
export async function dispatchOutbound(message: NormalizedOutboundMessage): Promise<void> {
  const adapter = channelAdapterRegistry.get(message.channel);

  logger.info(
    {
      channel: message.channel,
      channelCustomerId: message.channelCustomerId,
      messageType: message.messageType,
    },
    'Dispatching outbound message',
  );

  const result = await adapter.send(message);

  if (!result.success) {
    logger.error(
      { channel: message.channel, error: result.error },
      'Failed to send outbound message',
    );
    // TODO (Phase 8): Handle send failures — retry, notify, escalate
  }
}
