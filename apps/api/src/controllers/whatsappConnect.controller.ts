/**
 * @fileoverview WhatsApp Connect Controller.
 *
 * Handles the Meta Embedded Signup OAuth flow for per-business WhatsApp connections.
 *
 * Flow:
 * 1. Frontend opens Meta Embedded Signup popup (JavaScript SDK)
 * 2. User grants access — Meta returns a short-lived code
 * 3. Frontend posts the code to POST /businesses/:id/whatsapp/connect
 * 4. Backend exchanges code → long-lived access token via Meta Graph API
 * 5. Backend fetches the phone number ID and WABA ID
 * 6. Encrypts the token and stores in SocialAccount table
 * 7. Returns public connection status to the frontend
 *
 * Endpoints:
 * POST   /businesses/:businessId/whatsapp/connect     — Complete OAuth
 * GET    /businesses/:businessId/whatsapp/status       — Get connection status
 * DELETE /businesses/:businessId/whatsapp/disconnect   — Remove connection
 */

import type { Request, Response } from 'express';
import { socialAccountRepository } from '../repositories/socialAccount.repository.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/index.js';

// ── POST /businesses/:businessId/whatsapp/connect ──────────────────────────

export async function connectWhatsApp(req: Request, res: Response): Promise<void> {
  const { businessId } = req.params as { businessId: string };
  const { code, accessToken: directToken, phoneNumberId: directPhoneId, wabaId: directWabaId, displayPhoneNumber: directPhone } = req.body as {
    code?: string;
    accessToken?: string;
    phoneNumberId?: string;
    wabaId?: string;
    displayPhoneNumber?: string;
  };

  // ── Mode A: Direct Manual Setup ─────────────────────────────────────────
  if (directToken && directPhoneId) {
    try {
      // Validate credentials against Meta Graph API
      const metaRes = await fetch(
        `https://graph.facebook.com/${env.META_API_VERSION}/${directPhoneId}?` +
          new URLSearchParams({
            access_token: directToken,
            fields: 'display_phone_number,verified_name',
          }),
      );

      let verifiedPhone = directPhone ?? directPhoneId;
      if (metaRes.ok) {
        const metaData = (await metaRes.json()) as { display_phone_number?: string };
        if (metaData.display_phone_number) {
          verifiedPhone = metaData.display_phone_number;
        }
      } else {
        const errData = await metaRes.json().catch(() => ({}));
        logger.warn({ errData, businessId }, 'Meta validation warning for manual credentials');
      }

      await socialAccountRepository.saveWhatsApp(businessId, {
        accessToken: directToken,
        phoneNumberId: directPhoneId,
        wabaId: directWabaId ?? '',
        displayPhoneNumber: verifiedPhone,
      });

      logger.info(
        { businessId, phoneNumberId: directPhoneId, displayPhoneNumber: verifiedPhone },
        'WhatsApp connected via direct credentials',
      );

      res.json({
        success: true,
        connection: {
          connected: true,
          displayPhoneNumber: verifiedPhone,
          wabaId: directWabaId ?? '',
          phoneNumberId: directPhoneId,
        },
      });
      return;
    } catch (err) {
      logger.error({ err, businessId }, 'Direct WhatsApp connect failed');
      res.status(500).json({ error: 'Failed to connect WhatsApp account with provided credentials' });
      return;
    }
  }

  // ── Mode B: Meta Embedded Signup OAuth Exchange ─────────────────────────
  if (!code || typeof code !== 'string') {
    res.status(400).json({ error: 'Either code (from Embedded Signup) or accessToken + phoneNumberId are required' });
    return;
  }

  try {
    // ── Step 1: Exchange short-lived code for long-lived access token ────
    const tokenRes = await fetch(
      `https://graph.facebook.com/${env.META_API_VERSION}/oauth/access_token?` +
        new URLSearchParams({
          client_id: env.META_APP_ID,
          client_secret: env.META_APP_SECRET,
          code,
        }),
    );

    if (!tokenRes.ok) {
      const err = await tokenRes.json();
      logger.error({ err, businessId }, 'Failed to exchange Meta OAuth code');
      res.status(502).json({ error: 'Failed to exchange WhatsApp access code with Meta' });
      return;
    }

    const tokenData = (await tokenRes.json()) as { access_token: string };
    const shortToken = tokenData.access_token;

    // ── Step 2: Exchange for a long-lived token ─────────────────────────
    const longTokenRes = await fetch(
      `https://graph.facebook.com/${env.META_API_VERSION}/oauth/access_token?` +
        new URLSearchParams({
          grant_type: 'fb_exchange_token',
          client_id: env.META_APP_ID,
          client_secret: env.META_APP_SECRET,
          fb_exchange_token: shortToken,
        }),
    );

    let accessToken = shortToken;
    if (longTokenRes.ok) {
      const longData = (await longTokenRes.json()) as { access_token: string };
      accessToken = longData.access_token;
    }

    // ── Step 3: Fetch WABA and phone number details ─────────────────────
    // Get WhatsApp Business Accounts linked to this token
    const wabaRes = await fetch(
      `https://graph.facebook.com/${env.META_API_VERSION}/me/businesses?` +
        new URLSearchParams({ access_token: accessToken, fields: 'whatsapp_business_accounts' }),
    );

    let wabaId = '';
    let phoneNumberId = '';
    let displayPhoneNumber = '';

    if (wabaRes.ok) {
      const wabaData = (await wabaRes.json()) as {
        data?: Array<{
          whatsapp_business_accounts?: {
            data?: Array<{ id: string }>;
          };
        }>;
      };

      wabaId = wabaData.data?.[0]?.whatsapp_business_accounts?.data?.[0]?.id ?? '';

      // Fetch phone numbers for this WABA
      if (wabaId) {
        const phoneRes = await fetch(
          `https://graph.facebook.com/${env.META_API_VERSION}/${wabaId}/phone_numbers?` +
            new URLSearchParams({ access_token: accessToken }),
        );

        if (phoneRes.ok) {
          const phoneData = (await phoneRes.json()) as {
            data?: Array<{ id: string; display_phone_number: string }>;
          };
          const firstPhone = phoneData.data?.[0];
          if (firstPhone) {
            phoneNumberId = firstPhone.id;
            displayPhoneNumber = firstPhone.display_phone_number;
          }
        }
      }
    }

    // ── Step 4: Store encrypted token in database ───────────────────────
    await socialAccountRepository.saveWhatsApp(businessId, {
      accessToken,
      phoneNumberId,
      wabaId,
      displayPhoneNumber,
    });

    logger.info(
      { businessId, phoneNumberId, wabaId, displayPhoneNumber },
      'WhatsApp account connected successfully',
    );

    res.json({
      success: true,
      connection: {
        connected: true,
        displayPhoneNumber,
        wabaId,
        phoneNumberId,
      },
    });
  } catch (err) {
    logger.error({ err, businessId }, 'connectWhatsApp failed');
    res.status(500).json({ error: 'Failed to connect WhatsApp account' });
  }
}

// ── GET /businesses/:businessId/whatsapp/status ────────────────────────────

export async function getWhatsAppStatus(req: Request, res: Response): Promise<void> {
  const { businessId } = req.params as { businessId: string };
  try {
    const status = await socialAccountRepository.getPublicStatus(businessId);
    res.json({ data: status });
  } catch (err) {
    logger.error({ err, businessId }, 'getWhatsAppStatus failed');
    res.status(500).json({ error: 'Failed to fetch WhatsApp connection status' });
  }
}

// ── DELETE /businesses/:businessId/whatsapp/disconnect ─────────────────────

export async function disconnectWhatsApp(req: Request, res: Response): Promise<void> {
  const { businessId } = req.params as { businessId: string };
  try {
    await socialAccountRepository.disconnect(businessId);
    logger.info({ businessId }, 'WhatsApp account disconnected');
    res.json({ success: true, message: 'WhatsApp account disconnected' });
  } catch (err) {
    logger.error({ err, businessId }, 'disconnectWhatsApp failed');
    res.status(500).json({ error: 'Failed to disconnect WhatsApp account' });
  }
}
