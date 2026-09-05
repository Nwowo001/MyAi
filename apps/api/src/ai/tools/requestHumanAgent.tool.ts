/**
 * @fileoverview AI Tool: Request Human Agent Handover.
 */

import type { RegisteredTool } from './types.js';
import { ToolName } from './types.js';
import { conversationRepository } from '../../repositories/conversation.repository.js';

export const requestHumanAgentTool: RegisteredTool = {
  definition: {
    name: ToolName.REQUEST_HUMAN_AGENT,
    description:
      'Escalate the conversation to a human sales or support agent when the customer requests a human or has a complex issue.',
    parameters: {
      type: 'object',
      properties: {
        reason: {
          type: 'string',
          description: 'Reason for escalating to human agent',
        },
      },
      required: ['reason'],
    },
  },
  execute: async (args, context) => {
    try {
      const reason = typeof args['reason'] === 'string' ? args['reason'] : 'Customer requested human agent';

      // Set conversation status to HANDOVER_PENDING (uses ConversationStatus enum)
      await conversationRepository.setHandover(context.conversationId, true, reason);

      return {
        success: true,
        data: {
          handoverEnabled: true,
          reason,
          message: 'Human agent notification sent. AI auto-reply paused for this thread.',
        },
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to trigger human handover';
      return {
        success: false,
        error: {
          code: 'HANDOVER_FAILED',
          message,
        },
      };
    }
  },
};
