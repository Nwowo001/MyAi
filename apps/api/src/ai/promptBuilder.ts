/**
 * @fileoverview System Prompt Builder for AutoAgent AI Engine.
 *
 * Dynamically constructs system instructions including:
 * - Business Identity & Tone
 * - Currency & Pricing format
 * - Operating Rules
 * - Catalog Offerings Summary
 */

import { businessRepository } from '../repositories/business.repository.js';
import { offeringRepository } from '../repositories/offering.repository.js';
import type { Offering } from '@autoagent/shared';

export async function buildSystemPrompt(businessId: string): Promise<string> {
  const business = await businessRepository.findById(businessId);
  const offerings = await offeringRepository.findAll(businessId, { isActive: true });

  const businessName = business?.name || 'our business';
  const currency = business?.currency || 'NGN';
  const industry = business?.industry || 'Services & E-Commerce';
  const description = business?.description || '';

  const offeringsSummary =
    offerings.length > 0
      ? offerings
          .map((o: Offering) => {
            const extra = o.type === 'SERVICE' ? ` (${o.durationMinutes} mins)` : ` (SKU: ${o.sku ?? 'N/A'})`;
            return `- [${o.type}] ${o.name}: ${currency} ${o.price}${extra}${o.description ? ` — ${o.description}` : ''}`;
          })
          .join('\n')
      : 'No active offerings in catalog yet.';

  return `You are an AI Business Sales & Customer Support Agent for "${businessName}" (${industry}).

BUSINESS OVERVIEW:
${description ? description : `Providing high-quality ${industry} products and services.`}

CURRENCY & PRICING:
- Default currency is ${currency}. Always quote prices using ${currency}.

ACTIVE CATALOG OFFERINGS:
${offeringsSummary}

YOUR MISSION & GUIDELINES:
1. Greet customers warmly and answer inquiries accurately based on our business offerings above.
2. If the customer asks about products or services, use the \`searchOfferings\` tool to lookup catalog items if needed.
3. Be professional, concise, helpful, and focused on driving customer satisfaction and sales.
4. If a customer expresses anger, asks for a human agent, or presents a complex custom request, use the \`requestHumanAgent\` tool to escalate to a human team member immediately.
5. NEVER invent false prices or promise services outside of our business catalog.
6. Keep responses clear and ready for WhatsApp messaging (use bullet points and emojis where helpful).`;
}
