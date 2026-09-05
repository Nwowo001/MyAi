/**
 * @fileoverview WhatsApp Webhook Controller — Multi-tenant.
 *
 * Routes inbound WhatsApp messages to the correct business by looking up
 * the phoneNumberId in the SocialAccount table. Each business has their
 * own encrypted access token stored in the DB.
 *
 * Two endpoints:
 * 1. GET  /webhooks/whatsapp  — Meta webhook verification
 * 2. POST /webhooks/whatsapp  — Inbound message events (all businesses)
 *
 * Security:
 * - GET verification uses META_WEBHOOK_VERIFY_TOKEN (platform-level secret)
 * - X-Hub-Signature-256 HMAC verification with META_APP_SECRET
 */

import type { Request, Response } from 'express';
import { createHmac } from 'crypto';
import { customerRepository } from '../repositories/customer.repository.js';
import { socialAccountRepository } from '../repositories/socialAccount.repository.js';
import { processMessage } from '../ai/orchestrator.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/index.js';

// ── Meta webhook payload types ─────────────────────────────────────────────

interface WhatsAppTextMessage {
  from: string;
  id: string;
  timestamp: string;
  type: 'text';
  text: { body: string };
}

interface WhatsAppValue {
  messaging_product: string;
  metadata: { display_phone_number: string; phone_number_id: string };
  contacts?: Array<{ profile: { name: string }; wa_id: string }>;
  messages?: WhatsAppTextMessage[];
  statuses?: unknown[];
}

interface WhatsAppChange {
  value: WhatsAppValue;
  field: string;
}

interface WhatsAppEntry {
  id: string;
  changes: WhatsAppChange[];
}

interface WhatsAppWebhookPayload {
  object: string;
  entry: WhatsAppEntry[];
}

// ── Webhook verification (GET) ─────────────────────────────────────────────

export async function verifyWhatsAppWebhook(req: Request, res: Response): Promise<void> {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === env.META_WEBHOOK_VERIFY_TOKEN) {
    logger.info('WhatsApp webhook verified successfully');
    res.status(200).send(challenge);
    return;
  }

  logger.warn({ mode, token }, 'WhatsApp webhook verification failed');
  res.status(403).json({ error: 'Forbidden' });
}

// ── Inbound message handler (POST) ────────────────────────────────────────

export async function handleWhatsAppWebhook(req: Request, res: Response): Promise<void> {
  // Verify HMAC signature (production security)
  const signature = req.headers['x-hub-signature-256'] as string | undefined;
  if (signature) {
    const rawBody = JSON.stringify(req.body);
    const expectedSig =
      'sha256=' + createHmac('sha256', env.META_APP_SECRET).update(rawBody).digest('hex');
    if (signature !== expectedSig) {
      logger.warn('WhatsApp webhook HMAC verification failed');
      res.status(403).json({ error: 'Invalid signature' });
      return;
    }
  }

  // Respond immediately — Meta expects < 20s response
  res.status(200).json({ status: 'ok' });

  const payload = req.body as WhatsAppWebhookPayload;

  if (payload.object !== 'whatsapp_business_account') return;

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      if (change.field !== 'messages') continue;

      const value = change.value;
      const messages = value.messages ?? [];

      for (const message of messages) {
        if (message.type !== 'text') continue;

        const phoneNumber = message.from;
        const messageText = message.text.body;
        const senderName = value.contacts?.[0]?.profile?.name ?? 'Customer';
        const phoneNumberId = value.metadata.phone_number_id;

        logger.info({ phoneNumber, phoneNumberId }, 'Received WhatsApp message');

        void processWhatsAppMessage({
          phoneNumber,
          messageText,
          senderName,
          phoneNumberId,
        }).catch((err) => {
          logger.error({ err, phoneNumber }, 'Failed to process WhatsApp message');
        });
      }
    }
  }
}

// ── Internal processor ─────────────────────────────────────────────────────

interface ProcessParams {
  phoneNumber: string;
  messageText: string;
  senderName: string;
  phoneNumberId: string;
}

async function processWhatsAppMessage({
  phoneNumber,
  messageText,
  senderName,
  phoneNumberId,
}: ProcessParams): Promise<void> {
  // ── Tenant routing: find business by phoneNumberId ─────────────────────
  const waAccount = await socialAccountRepository.findByPhoneNumberId(phoneNumberId);

  if (!waAccount) {
    logger.warn(
      { phoneNumberId },
      'No business found for this WhatsApp phoneNumberId — message dropped',
    );
    return;
  }

  const { businessId, accessToken } = waAccount;

  // ── Find or auto-create customer ──────────────────────────────────────
  let customer = await customerRepository.findByPhone(businessId, phoneNumber);
  if (!customer) {
    customer = await customerRepository.create(businessId, {
      name: senderName,
      phone: phoneNumber,
    });
    logger.info({ customerId: customer.id, phoneNumber, businessId }, 'Auto-created customer from WhatsApp');
  }

  // ── Run AI orchestrator ───────────────────────────────────────────────
  const result = await processMessage(businessId, customer.id, messageText);

  // ── Send reply using THIS business's access token ─────────────────────
  if (result.reply) {
    await sendWhatsAppReply(phoneNumberId, phoneNumber, result.reply, accessToken);
  }
}

// ── WhatsApp Cloud API: send reply (per-business token) ───────────────────

export async function sendWhatsAppReply(
  phoneNumberId: string,
  to: string,
  text: string,
  accessToken: string,
): Promise<void> {
  const url = `https://graph.facebook.com/${env.META_API_VERSION}/${phoneNumberId}/messages`;

  const body = {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body: text },
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errBody = await response.text();
      logger.error({ status: response.status, errBody, to }, 'WhatsApp API send failed');
    } else {
      logger.info({ to, phoneNumberId, messageLength: text.length }, 'WhatsApp reply sent');
    }
  } catch (err) {
    logger.error({ err, to }, 'Failed to call WhatsApp Cloud API');
  }
}
