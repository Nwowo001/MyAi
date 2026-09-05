/**
 * @fileoverview Offering (Product & Service) service layer.
 *
 * Implements business logic for managing a business's catalog of products and services.
 */

import { offeringRepository } from '../repositories/offering.repository.js';
import type { Offering, CreateOfferingInput, UpdateOfferingInput } from '@autoagent/shared';

export class OfferingService {
  /**
   * Create a new offering for a business.
   */
  async createOffering(businessId: string, input: CreateOfferingInput): Promise<Offering> {
    return offeringRepository.create(businessId, input);
  }

  /**
   * List all offerings for a business.
   */
  async listOfferings(
    businessId: string,
    options?: { type?: 'PRODUCT' | 'SERVICE'; isActive?: boolean },
  ): Promise<Offering[]> {
    return offeringRepository.findAll(businessId, options);
  }

  /**
   * Get a single offering by ID.
   */
  async getOffering(businessId: string, offeringId: string): Promise<Offering | null> {
    return offeringRepository.findById(businessId, offeringId);
  }

  /**
   * Update an offering.
   */
  async updateOffering(
    businessId: string,
    offeringId: string,
    input: UpdateOfferingInput,
  ): Promise<Offering | null> {
    return offeringRepository.update(businessId, offeringId, input);
  }

  /**
   * Soft-delete: deactivate an offering without removing it from history.
   */
  async deactivateOffering(businessId: string, offeringId: string): Promise<boolean> {
    return offeringRepository.deactivate(businessId, offeringId);
  }

  /**
   * Permanently delete an offering.
   */
  async deleteOffering(businessId: string, offeringId: string): Promise<boolean> {
    return offeringRepository.delete(businessId, offeringId);
  }
}

export const offeringService = new OfferingService();
