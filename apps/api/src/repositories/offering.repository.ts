/**
 * @fileoverview Offering (Product & Service) repository.
 *
 * All queries are scoped to a `businessId` for strict multi-tenant isolation.
 */

import prisma from '../config/db.js';
import type { Offering, CreateOfferingInput, UpdateOfferingInput } from '@autoagent/shared';

// ── Helpers ───────────────────────────────────────────────────────────────────

function mapOffering(record: {
  id: string;
  businessId: string;
  name: string;
  description: string | null;
  type: string;
  price: { toString(): string };
  currency: string;
  durationMinutes: number | null;
  sku: string | null;
  stockQuantity: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): Offering {
  return {
    id: record.id,
    businessId: record.businessId,
    name: record.name,
    description: record.description,
    type: record.type as 'PRODUCT' | 'SERVICE',
    price: parseFloat(record.price.toString()),
    currency: record.currency,
    durationMinutes: record.durationMinutes,
    sku: record.sku,
    stockQuantity: record.stockQuantity,
    isActive: record.isActive,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

// ── Repository ────────────────────────────────────────────────────────────────

export class OfferingRepository {
  /**
   * Create a new offering (product or service) for a business.
   */
  async create(businessId: string, input: CreateOfferingInput): Promise<Offering> {
    const record = await prisma.offering.create({
      data: {
        businessId,
        name: input.name,
        description: input.description ?? null,
        type: input.type,
        price: input.price,
        currency: input.currency ?? 'NGN',
        durationMinutes: input.durationMinutes ?? null,
        sku: input.sku ?? null,
        stockQuantity: input.stockQuantity ?? null,
        isActive: input.isActive ?? true,
      },
    });
    return mapOffering(record);
  }

  /**
   * Find all offerings for a business, optionally filtered by type or active status.
   */
  async findAll(
    businessId: string,
    options?: { type?: 'PRODUCT' | 'SERVICE'; isActive?: boolean },
  ): Promise<Offering[]> {
    const records = await prisma.offering.findMany({
      where: {
        businessId,
        ...(options?.type !== undefined && { type: options.type }),
        ...(options?.isActive !== undefined && { isActive: options.isActive }),
      },
      orderBy: { createdAt: 'desc' },
    });
    return records.map(mapOffering);
  }

  /**
   * Find a single offering by ID, scoped to the business.
   */
  async findById(businessId: string, offeringId: string): Promise<Offering | null> {
    const record = await prisma.offering.findFirst({
      where: { id: offeringId, businessId },
    });
    return record ? mapOffering(record) : null;
  }

  /**
   * Update an offering.
   */
  async update(businessId: string, offeringId: string, input: UpdateOfferingInput): Promise<Offering | null> {
    try {
      const record = await prisma.offering.update({
        where: { id: offeringId },
        data: {
          ...(input.name !== undefined && { name: input.name }),
          ...(input.description !== undefined && { description: input.description }),
          ...(input.price !== undefined && { price: input.price }),
          ...(input.currency !== undefined && { currency: input.currency }),
          ...(input.durationMinutes !== undefined && { durationMinutes: input.durationMinutes }),
          ...(input.sku !== undefined && { sku: input.sku }),
          ...(input.stockQuantity !== undefined && { stockQuantity: input.stockQuantity }),
          ...(input.isActive !== undefined && { isActive: input.isActive }),
        },
      });
      // Verify it belongs to the business
      if (record.businessId !== businessId) return null;
      return mapOffering(record);
    } catch {
      return null;
    }
  }

  /**
   * Soft-delete: set isActive = false.
   */
  async deactivate(businessId: string, offeringId: string): Promise<boolean> {
    try {
      await prisma.offering.updateMany({
        where: { id: offeringId, businessId },
        data: { isActive: false },
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Hard-delete an offering permanently.
   */
  async delete(businessId: string, offeringId: string): Promise<boolean> {
    try {
      const deleted = await prisma.offering.deleteMany({
        where: { id: offeringId, businessId },
      });
      return deleted.count > 0;
    } catch {
      return false;
    }
  }
}

export const offeringRepository = new OfferingRepository();
