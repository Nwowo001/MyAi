/**
 * @fileoverview AI Tool: Search Offerings (Products & Services).
 */

import type { RegisteredTool } from './types.js';
import { ToolName } from './types.js';
import { offeringRepository } from '../../repositories/offering.repository.js';
import type { Offering } from '@autoagent/shared';

export const searchOfferingsTool: RegisteredTool = {
  definition: {
    name: ToolName.SEARCH_OFFERINGS,
    description:
      'Search the business catalog for products or services by name, type, or query. Returns offering details, prices, and availability.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search keyword (e.g., haircut, consultation, handbag, design)',
        },
        type: {
          type: 'string',
          enum: ['PRODUCT', 'SERVICE'],
          description: 'Optional filter by offering type',
        },
      },
    },
  },
  execute: async (args, context) => {
    try {
      const typeFilter =
        args['type'] === 'PRODUCT' || args['type'] === 'SERVICE'
          ? (args['type'] as 'PRODUCT' | 'SERVICE')
          : undefined;

      const offerings = await offeringRepository.findAll(context.businessId, {
        ...(typeFilter !== undefined ? { type: typeFilter } : {}),
        isActive: true,
      });

      const q = typeof args['query'] === 'string' ? args['query'].toLowerCase() : '';
      const matched: Offering[] = q
        ? offerings.filter(
            (o: Offering) =>
              o.name.toLowerCase().includes(q) ||
              (o.description && o.description.toLowerCase().includes(q)),
          )
        : offerings;

      return {
        success: true,
        data: {
          count: matched.length,
          offerings: matched.map((o: Offering) => ({
            id: o.id,
            name: o.name,
            type: o.type,
            price: o.price,
            currency: o.currency,
            description: o.description,
            imageUrl: o.imageUrl,
            specifications: o.specifications,
            durationMinutes: o.durationMinutes,
            stockQuantity: o.stockQuantity,
          })),
        },
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to search offerings';
      return {
        success: false,
        error: {
          code: 'SEARCH_FAILED',
          message,
        },
      };
    }
  },
};
