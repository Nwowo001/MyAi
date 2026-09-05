/**
 * @fileoverview Customer management service layer.
 */

import { customerRepository } from '../repositories/customer.repository.js';
import type {
  Customer,
  LeadStatus,
  CreateCustomerInput,
  UpdateCustomerInput,
} from '@autoagent/shared';

export class CustomerService {
  async createCustomer(businessId: string, input: CreateCustomerInput): Promise<Customer> {
    return customerRepository.create(businessId, input);
  }

  async getCustomer(businessId: string, customerId: string): Promise<Customer | null> {
    return customerRepository.findById(businessId, customerId);
  }

  async listCustomers(
    businessId: string,
    filters?: {
      search?: string;
      leadStatus?: LeadStatus;
    },
  ): Promise<Customer[]> {
    return customerRepository.findMany(businessId, filters);
  }

  async updateCustomer(
    businessId: string,
    customerId: string,
    input: UpdateCustomerInput,
  ): Promise<Customer | null> {
    return customerRepository.update(businessId, customerId, input);
  }

  async deleteCustomer(businessId: string, customerId: string): Promise<boolean> {
    return customerRepository.delete(businessId, customerId);
  }
}

export const customerService = new CustomerService();
