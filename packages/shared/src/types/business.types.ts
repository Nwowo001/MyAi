/**
 * @fileoverview Business domain types.
 *
 * These types represent the Business entity and related structures
 * as they appear in API responses. They do NOT include sensitive fields
 * (tokens, secrets) which are backend-only.
 */

/**
 * A business registered on AutoAgent.
 *
 * Note: `currency` uses ISO 4217 codes (e.g. 'NGN', 'USD', 'GBP').
 * The UI must format monetary values using this code, not a hardcoded symbol.
 */
export interface Business {
  id: string;
  name: string;
  description: string | null;
  industry: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  timezone: string;
  /** ISO 4217 currency code. Default: 'NGN' */
  currency: string;
  logoUrl: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

/** Data required to create a new business. */
export interface CreateBusinessInput {
  name: string;
  description?: string;
  industry?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  timezone?: string;
  /** ISO 4217 code. Defaults to 'NGN' on the backend if not provided. */
  currency?: string;
}

/** Data for updating an existing business. All fields optional. */
export type UpdateBusinessInput = Partial<CreateBusinessInput>;

/**
 * A member of a business (the owner or a staff member).
 */
export interface BusinessMember {
  id: string;
  businessId: string;
  userId: string;
  role: string;
  permissions: string[];
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
}

/**
 * Connected social/messaging account (e.g. WhatsApp Business).
 * Tokens are NEVER included in this type — backend only.
 */
export interface SocialAccount {
  id: string;
  businessId: string;
  platform: string;
  accountId: string;
  status: SocialAccountStatus;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export type SocialAccountStatus = 'CONNECTED' | 'DISCONNECTED' | 'ERROR' | 'PENDING';
