/**
 * @fileoverview Business repository data access layer.
 *
 * Provides methods for creating, reading, updating, and querying Business entities
 * and BusinessMember permissions, backed by Prisma ORM + PostgreSQL.
 */

import prisma from '../config/db.js';
import type { Business, BusinessMember, CreateBusinessInput, UpdateBusinessInput } from '@autoagent/shared';

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Map a Prisma Business record to the shared Business domain type.
 */
function mapBusiness(record: {
  id: string;
  name: string;
  description: string | null;
  industry: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  timezone: string;
  currency: string;
  logoUrl: string | null;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}): Business {
  return {
    id: record.id,
    name: record.name,
    description: record.description,
    industry: record.industry,
    phone: record.phone,
    email: record.email,
    website: record.website,
    address: record.address,
    timezone: record.timezone,
    currency: record.currency,
    logoUrl: record.logoUrl,
    ownerId: record.ownerId,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

/**
 * Map a Prisma BusinessMember (with included user) to the shared BusinessMember domain type.
 */
function mapMember(record: {
  id: string;
  businessId: string;
  userId: string;
  role: string;
  permissions: string[];
  createdAt: Date;
  user: {
    id: string;
    fullName: string | null;
    email: string;
    avatarUrl: string | null;
  };
}): BusinessMember {
  return {
    id: record.id,
    businessId: record.businessId,
    userId: record.userId,
    role: record.role,
    permissions: record.permissions,
    createdAt: record.createdAt.toISOString(),
    user: {
      id: record.user.id,
      name: record.user.fullName ?? record.user.email.split('@')[0] ?? 'Team Member',
      email: record.user.email,
      avatarUrl: record.user.avatarUrl,
    },
  };
}

// ── Repository ────────────────────────────────────────────────────────────────

export class BusinessRepository {
  /**
   * Create a new business and assign the creator as OWNER.
   * Also upserts the user record so the FK constraint is satisfied.
   */
  async create(
    ownerId: string,
    ownerEmail: string,
    input: CreateBusinessInput,
  ): Promise<{ business: Business; member: BusinessMember }> {
    // Ensure the user row exists (Supabase auth user may not have a Prisma User row yet)
    await prisma.user.upsert({
      where: { id: ownerId },
      update: {},
      create: {
        id: ownerId,
        email: ownerEmail,
      },
    });

    const result = await prisma.business.create({
      data: {
        name: input.name,
        description: input.description ?? null,
        industry: input.industry ?? null,
        phone: input.phone ?? null,
        email: input.email ?? null,
        website: input.website ?? null,
        address: input.address ?? null,
        timezone: input.timezone ?? 'Africa/Lagos',
        currency: (input.currency ?? 'NGN').toUpperCase(),
        ownerId,
        members: {
          create: {
            userId: ownerId,
            role: 'OWNER',
            permissions: ['*'],
          },
        },
      },
      include: {
        members: {
          where: { userId: ownerId },
          include: { user: true },
        },
      },
    });

    const business = mapBusiness(result);
    const member = mapMember(result.members[0]!);

    return { business, member };
  }

  /**
   * Find a business by ID.
   */
  async findById(businessId: string): Promise<Business | null> {
    const record = await prisma.business.findUnique({ where: { id: businessId } });
    return record ? mapBusiness(record) : null;
  }

  /**
   * Find all businesses a user is a member of.
   */
  async findUserBusinesses(userId: string): Promise<Business[]> {
    const memberships = await prisma.businessMember.findMany({
      where: { userId },
      include: { business: true },
    });
    return memberships.map((m) => mapBusiness(m.business));
  }

  /**
   * Check if a user is a member of a given business.
   */
  async findMember(businessId: string, userId: string): Promise<BusinessMember | null> {
    const record = await prisma.businessMember.findUnique({
      where: { businessId_userId: { businessId, userId } },
      include: { user: true },
    });
    return record ? mapMember(record) : null;
  }

  /**
   * List all members of a business.
   */
  async listMembers(businessId: string): Promise<BusinessMember[]> {
    const records = await prisma.businessMember.findMany({
      where: { businessId },
      include: { user: true },
    });
    return records.map(mapMember);
  }

  /**
   * Update a business profile.
   */
  async update(businessId: string, input: UpdateBusinessInput): Promise<Business | null> {
    try {
      const record = await prisma.business.update({
        where: { id: businessId },
        data: {
          ...(input.name !== undefined && { name: input.name }),
          ...(input.description !== undefined && { description: input.description }),
          ...(input.industry !== undefined && { industry: input.industry }),
          ...(input.phone !== undefined && { phone: input.phone }),
          ...(input.email !== undefined && { email: input.email }),
          ...(input.website !== undefined && { website: input.website }),
          ...(input.address !== undefined && { address: input.address }),
          ...(input.timezone !== undefined && { timezone: input.timezone }),
          ...(input.currency !== undefined && { currency: input.currency.toUpperCase() }),
        },
      });
      return mapBusiness(record);
    } catch {
      return null;
    }
  }

  /**
   * Add a new member to a business.
   * The user must already exist in the users table (created during Supabase auth).
   */
  async addMember(businessId: string, userId: string, role: string, email: string): Promise<BusinessMember> {
    // Upsert user to satisfy FK constraint
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId, email },
    });

    const defaultPermissions = role === 'ADMIN' ? ['read', 'write', 'manage_team'] : ['read', 'write'];

    const record = await prisma.businessMember.create({
      data: {
        businessId,
        userId,
        role: role as 'OWNER' | 'ADMIN' | 'AGENT',
        permissions: defaultPermissions,
      },
      include: { user: true },
    });

    return mapMember(record);
  }

  /**
   * Update a member's role.
   */
  async updateMemberRole(memberId: string, newRole: string): Promise<BusinessMember | null> {
    try {
      const record = await prisma.businessMember.update({
        where: { id: memberId },
        data: { role: newRole as 'OWNER' | 'ADMIN' | 'AGENT' },
        include: { user: true },
      });
      return mapMember(record);
    } catch {
      return null;
    }
  }

  /**
   * Remove a member from a business.
   */
  async removeMember(memberId: string): Promise<boolean> {
    try {
      await prisma.businessMember.delete({ where: { id: memberId } });
      return true;
    } catch {
      return false;
    }
  }
}

export const businessRepository = new BusinessRepository();
