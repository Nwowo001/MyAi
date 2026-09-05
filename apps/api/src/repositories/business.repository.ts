/**
 * @fileoverview Business repository data access layer.
 *
 * Provides methods for creating, reading, updating, and querying Business entities
 * and BusinessMember permissions.
 */

import type { Business, BusinessMember, CreateBusinessInput, UpdateBusinessInput } from '@autoagent/shared';

// In-memory data store for Phase 2 (to be replaced by Prisma ORM in Phase 3)
const businessesStore = new Map<string, Business>();
const membersStore = new Map<string, BusinessMember>();

export class BusinessRepository {
  /**
   * Create a new business and assign the creator as OWNER.
   */
  async create(ownerId: string, input: CreateBusinessInput): Promise<{ business: Business; member: BusinessMember }> {
    const businessId = `biz_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const business: Business = {
      id: businessId,
      name: input.name,
      description: input.description ?? null,
      industry: input.industry ?? null,
      phone: input.phone ?? null,
      email: input.email ?? null,
      website: input.website ?? null,
      address: input.address ?? null,
      timezone: input.timezone ?? 'Africa/Lagos',
      currency: (input.currency ?? 'NGN').toUpperCase(),
      logoUrl: null,
      ownerId,
      createdAt: now,
      updatedAt: now,
    };

    businessesStore.set(businessId, business);

    const memberId = `bm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const member: BusinessMember = {
      id: memberId,
      businessId,
      userId: ownerId,
      role: 'OWNER',
      permissions: ['*'],
      createdAt: now,
      user: {
        id: ownerId,
        name: 'Business Owner',
        email: input.email ?? 'owner@autoagent.dev',
        avatarUrl: null,
      },
    };

    membersStore.set(memberId, member);

    return { business, member };
  }

  /**
   * Find a business by ID.
   */
  async findById(businessId: string): Promise<Business | null> {
    return businessesStore.get(businessId) ?? null;
  }

  /**
   * Find all businesses a user is a member of.
   */
  async findUserBusinesses(userId: string): Promise<Business[]> {
    const userMemberships = Array.from(membersStore.values()).filter((m) => m.userId === userId);
    const businessIds = userMemberships.map((m) => m.businessId);
    return Array.from(businessesStore.values()).filter((b) => businessIds.includes(b.id));
  }

  /**
   * Check if a user is a member of a given business.
   */
  async findMember(businessId: string, userId: string): Promise<BusinessMember | null> {
    const member = Array.from(membersStore.values()).find(
      (m) => m.businessId === businessId && m.userId === userId,
    );
    return member ?? null;
  }

  /**
   * List all members of a business.
   */
  async listMembers(businessId: string): Promise<BusinessMember[]> {
    return Array.from(membersStore.values()).filter((m) => m.businessId === businessId);
  }

  /**
   * Update a business profile.
   */
  async update(businessId: string, input: UpdateBusinessInput): Promise<Business | null> {
    const existing = businessesStore.get(businessId);
    if (!existing) return null;

    const updated: Business = {
      ...existing,
      ...input,
      currency: input.currency ? input.currency.toUpperCase() : existing.currency,
      updatedAt: new Date().toISOString(),
    };

    businessesStore.set(businessId, updated);
    return updated;
  }

  /**
   * Add a new member to a business.
   */
  async addMember(businessId: string, userId: string, role: string, email: string): Promise<BusinessMember> {
    const memberId = `bm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const member: BusinessMember = {
      id: memberId,
      businessId,
      userId,
      role,
      permissions: role === 'ADMIN' ? ['read', 'write', 'manage_team'] : ['read', 'write'],
      createdAt: now,
      user: {
        id: userId,
        name: email.split('@')[0] ?? 'Team Member',
        email,
        avatarUrl: null,
      },
    };

    membersStore.set(memberId, member);
    return member;
  }

  /**
   * Update a member's role.
   */
  async updateMemberRole(memberId: string, newRole: string): Promise<BusinessMember | null> {
    const member = membersStore.get(memberId);
    if (!member) return null;

    const updated: BusinessMember = {
      ...member,
      role: newRole,
    };

    membersStore.set(memberId, updated);
    return updated;
  }

  /**
   * Remove a member from a business.
   */
  async removeMember(memberId: string): Promise<boolean> {
    return membersStore.delete(memberId);
  }
}

export const businessRepository = new BusinessRepository();
