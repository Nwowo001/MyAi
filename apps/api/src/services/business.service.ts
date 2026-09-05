/**
 * @fileoverview Business service layer.
 *
 * Implements business logic for managing tenant profiles, team members, and permissions.
 */

import { businessRepository } from '../repositories/business.repository.js';
import type { Business, BusinessMember, CreateBusinessInput, UpdateBusinessInput } from '@autoagent/shared';

export class BusinessService {
  /**
   * Create a new tenant business profile for a user.
   */
  async createBusiness(
    userId: string,
    ownerEmail: string,
    input: CreateBusinessInput,
  ): Promise<{ business: Business; member: BusinessMember }> {
    return businessRepository.create(userId, ownerEmail, input);
  }

  /**
   * List all businesses accessible by a specific user.
   */
  async getUserBusinesses(userId: string): Promise<Business[]> {
    return businessRepository.findUserBusinesses(userId);
  }

  /**
   * Fetch a single business by ID.
   */
  async getBusinessById(businessId: string): Promise<Business | null> {
    return businessRepository.findById(businessId);
  }

  /**
   * Update a business profile.
   */
  async updateBusiness(businessId: string, input: UpdateBusinessInput): Promise<Business | null> {
    return businessRepository.update(businessId, input);
  }

  /**
   * List members of a business.
   */
  async getBusinessMembers(businessId: string): Promise<BusinessMember[]> {
    return businessRepository.listMembers(businessId);
  }

  /**
   * Invite a new member to a business.
   */
  async inviteMember(businessId: string, email: string, role: string): Promise<BusinessMember> {
    const mockUserId = `usr_invited_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    return businessRepository.addMember(businessId, mockUserId, role, email);
  }

  /**
   * Update member role.
   */
  async updateMemberRole(memberId: string, role: string): Promise<BusinessMember | null> {
    return businessRepository.updateMemberRole(memberId, role);
  }

  /**
   * Remove a member from a business.
   */
  async removeMember(memberId: string): Promise<boolean> {
    return businessRepository.removeMember(memberId);
  }

  /**
   * Check user membership.
   */
  async verifyUserMembership(businessId: string, userId: string): Promise<BusinessMember | null> {
    return businessRepository.findMember(businessId, userId);
  }
}

export const businessService = new BusinessService();
