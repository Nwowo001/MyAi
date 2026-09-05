/**
 * @fileoverview Customer and lead domain types.
 */

import type { LeadStatus } from '../enums/leadStatus.enum';

export type { LeadStatus };

/**
 * A customer who has interacted with a business through AutoAgent.
 */
export interface Customer {
  id: string;
  businessId: string;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  latestLead?: Lead | null;
  leads?: Lead[];
}

export interface CreateCustomerInput {
  name: string;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
  tags?: string[];
  leadStatus?: LeadStatus;
  budget?: number | null;
}

export type UpdateCustomerInput = Partial<CreateCustomerInput>;

/**
 * A sales lead associated with a customer.
 */
export interface Lead {
  id: string;
  businessId: string;
  customerId: string;
  status: LeadStatus;
  source: string | null;
  score: number;
  budget: number | null;
  summary: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
}
