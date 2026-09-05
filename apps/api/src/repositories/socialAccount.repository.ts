/**
 * @fileoverview SocialAccount repository.
 *
 * Manages per-business social media integrations stored in the `social_accounts` table.
 * WhatsApp access tokens are stored encrypted using AES-256-GCM.
 *
 * Each business can connect one WhatsApp Business Account (WABA) per platform entry.
 * The `metadata` JSON field stores:
 *   - phoneNumberId: the WhatsApp Cloud API phone number ID
 *   - wabaId: the WhatsApp Business Account ID
 *   - displayPhoneNumber: the human-readable phone number
 */

import { prisma } from '../config/db.js';
import { encrypt, decrypt } from '../utils/crypto.js';
import { logger } from '../utils/logger.js';

export interface WhatsAppAccount {
  id: string;
  businessId: string;
  /** Decrypted access token — NEVER expose this to the frontend */
  accessToken: string;
  phoneNumberId: string;
  wabaId: string;
  displayPhoneNumber: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaveWhatsAppInput {
  accessToken: string;
  phoneNumberId: string;
  wabaId: string;
  displayPhoneNumber: string;
}

export class SocialAccountRepository {
  /**
   * Save (upsert) a business's WhatsApp connection.
   * Encrypts the access token before storing.
   */
  async saveWhatsApp(businessId: string, input: SaveWhatsAppInput): Promise<WhatsAppAccount> {
    const encryptedAccessToken = encrypt(input.accessToken);

    const record = await prisma.socialAccount.upsert({
      where: {
        businessId_platform_accountId: {
          businessId,
          platform: 'WHATSAPP',
          accountId: input.wabaId,
        },
      },
      update: {
        encryptedAccessToken,
        status: 'CONNECTED',
        metadata: {
          phoneNumberId: input.phoneNumberId,
          wabaId: input.wabaId,
          displayPhoneNumber: input.displayPhoneNumber,
        },
        updatedAt: new Date(),
      },
      create: {
        businessId,
        platform: 'WHATSAPP',
        accountId: input.wabaId,
        encryptedAccessToken,
        status: 'CONNECTED',
        metadata: {
          phoneNumberId: input.phoneNumberId,
          wabaId: input.wabaId,
          displayPhoneNumber: input.displayPhoneNumber,
        },
      },
    });

    return this.mapRecord(record, input.accessToken);
  }

  /**
   * Look up a business's WhatsApp account by the phone number ID.
   * Used by the webhook handler to route inbound messages.
   * Returns null if no business has connected this phone number.
   */
  async findByPhoneNumberId(phoneNumberId: string): Promise<WhatsAppAccount | null> {
    // Search all connected WA accounts for a matching phoneNumberId in metadata
    const records = await prisma.socialAccount.findMany({
      where: { platform: 'WHATSAPP', status: 'CONNECTED' },
    });

    for (const record of records) {
      const meta = record.metadata as Record<string, string>;
      if (meta?.phoneNumberId === phoneNumberId) {
        if (!record.encryptedAccessToken) continue;
        try {
          const accessToken = decrypt(record.encryptedAccessToken);
          return this.mapRecord(record, accessToken);
        } catch (err) {
          logger.error({ err, recordId: record.id }, 'Failed to decrypt WA token');
        }
      }
    }

    return null;
  }

  /**
   * Get the WhatsApp account for a business.
   * Returns null if not connected.
   */
  async findByBusiness(businessId: string): Promise<WhatsAppAccount | null> {
    const record = await prisma.socialAccount.findFirst({
      where: { businessId, platform: 'WHATSAPP', status: 'CONNECTED' },
    });

    if (!record || !record.encryptedAccessToken) return null;

    try {
      const accessToken = decrypt(record.encryptedAccessToken);
      return this.mapRecord(record, accessToken);
    } catch (err) {
      logger.error({ err, businessId }, 'Failed to decrypt WA token for business');
      return null;
    }
  }

  /**
   * Get safe public info (no token) for a business's WhatsApp connection.
   * Safe to send to the frontend.
   */
  async getPublicStatus(businessId: string): Promise<{
    connected: boolean;
    displayPhoneNumber?: string | undefined;
    wabaId?: string | undefined;
    status?: string | undefined;
  }> {
    const record = await prisma.socialAccount.findFirst({
      where: { businessId, platform: 'WHATSAPP' },
    });

    if (!record) return { connected: false };

    const meta = record.metadata as Record<string, string> | null;
    return {
      connected: record.status === 'CONNECTED',
      displayPhoneNumber: meta?.displayPhoneNumber,
      wabaId: meta?.wabaId,
      status: record.status,
    };
  }

  /**
   * Disconnect (soft-delete) a business's WhatsApp account.
   */
  async disconnect(businessId: string): Promise<void> {
    await prisma.socialAccount.updateMany({
      where: { businessId, platform: 'WHATSAPP' },
      data: { status: 'DISCONNECTED', encryptedAccessToken: null },
    });
  }

  private mapRecord(record: {
    id: string;
    businessId: string;
    status: string;
    metadata: unknown;
    createdAt: Date;
    updatedAt: Date;
  }, accessToken: string): WhatsAppAccount {
    const meta = record.metadata as Record<string, string>;
    return {
      id: record.id,
      businessId: record.businessId,
      accessToken,
      phoneNumberId: meta?.phoneNumberId ?? '',
      wabaId: meta?.wabaId ?? '',
      displayPhoneNumber: meta?.displayPhoneNumber ?? '',
      status: record.status,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
  }
}

export const socialAccountRepository = new SocialAccountRepository();
