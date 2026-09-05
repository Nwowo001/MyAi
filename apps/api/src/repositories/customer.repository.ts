/**
 * @fileoverview Customer & Lead repository using Prisma ORM.
 * All operations are strictly multi-tenant scoped by businessId.
 */

import { prisma } from '../config/db.js';
import type {
  Customer,
  LeadStatus,
  CreateCustomerInput,
  UpdateCustomerInput,
} from '@autoagent/shared';

function mapPrismaCustomer(raw: any): Customer {
  const latestLeadRaw = raw.leads && raw.leads.length > 0 ? raw.leads[0] : null;

  return {
    id: raw.id,
    businessId: raw.businessId,
    name: raw.name,
    phone: raw.phone ?? null,
    email: raw.email ?? null,
    notes: raw.notes ?? null,
    tags: raw.tags ?? [],
    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString(),
    latestLead: latestLeadRaw
      ? {
          id: latestLeadRaw.id,
          businessId: latestLeadRaw.businessId,
          customerId: latestLeadRaw.customerId,
          status: latestLeadRaw.status as LeadStatus,
          source: latestLeadRaw.source ?? null,
          score: latestLeadRaw.score ?? 0,
          budget: latestLeadRaw.budget ? Number(latestLeadRaw.budget) : null,
          summary: latestLeadRaw.summary ?? null,
          createdAt: latestLeadRaw.createdAt.toISOString(),
          updatedAt: latestLeadRaw.updatedAt.toISOString(),
        }
      : null,
  };
}

export class CustomerRepository {
  async create(businessId: string, input: CreateCustomerInput): Promise<Customer> {
    const createData: any = {
      businessId,
      name: input.name,
      phone: input.phone ?? null,
      email: input.email ?? null,
      notes: input.notes ?? null,
      tags: input.tags ?? [],
    };

    if (input.leadStatus) {
      createData.leads = {
        create: {
          businessId,
          status: input.leadStatus,
          budget: input.budget ?? null,
          source: 'MANUAL',
        },
      };
    }

    const customer = await prisma.customer.create({
      data: createData,
      include: {
        leads: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return mapPrismaCustomer(customer);
  }

  async findById(businessId: string, customerId: string): Promise<Customer | null> {
    const customer = await prisma.customer.findFirst({
      where: { id: customerId, businessId },
      include: {
        leads: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return customer ? mapPrismaCustomer(customer) : null;
  }

  async findMany(
    businessId: string,
    filters?: {
      search?: string;
      leadStatus?: LeadStatus;
    },
  ): Promise<Customer[]> {
    const where: any = { businessId };

    if (filters?.search) {
      const q = filters.search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (filters?.leadStatus) {
      where.leads = {
        some: {
          status: filters.leadStatus,
        },
      };
    }

    const customers = await prisma.customer.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        leads: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return customers.map(mapPrismaCustomer);
  }

  async update(
    businessId: string,
    customerId: string,
    input: UpdateCustomerInput,
  ): Promise<Customer | null> {
    const existing = await prisma.customer.findFirst({
      where: { id: customerId, businessId },
    });
    if (!existing) return null;

    const data: any = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.phone !== undefined) data.phone = input.phone;
    if (input.email !== undefined) data.email = input.email;
    if (input.notes !== undefined) data.notes = input.notes;
    if (input.tags !== undefined) data.tags = input.tags;

    const updated = await prisma.customer.update({
      where: { id: customerId },
      data,
      include: {
        leads: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (input.leadStatus) {
      const latestLead = await prisma.lead.findFirst({
        where: { customerId, businessId },
        orderBy: { createdAt: 'desc' },
      });

      if (latestLead) {
        await prisma.lead.update({
          where: { id: latestLead.id },
          data: {
            status: input.leadStatus,
            budget: input.budget !== undefined ? input.budget : latestLead.budget,
          },
        });
      } else {
        await prisma.lead.create({
          data: {
            businessId,
            customerId,
            status: input.leadStatus,
            budget: input.budget ?? null,
            source: 'MANUAL',
          },
        });
      }
    }

    // Refetch to include updated lead
    const finalCustomer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        leads: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return finalCustomer ? mapPrismaCustomer(finalCustomer) : mapPrismaCustomer(updated);
  }

  async delete(businessId: string, customerId: string): Promise<boolean> {
    const existing = await prisma.customer.findFirst({
      where: { id: customerId, businessId },
    });
    if (!existing) return false;

    await prisma.customer.delete({
      where: { id: customerId },
    });
    return true;
  }

  async findByPhone(businessId: string, phone: string): Promise<Customer | null> {
    const customer = await prisma.customer.findFirst({
      where: { businessId, phone },
      include: {
        leads: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
    return customer ? mapPrismaCustomer(customer) : null;
  }
}

export const customerRepository = new CustomerRepository();

