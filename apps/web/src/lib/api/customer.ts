/**
 * @fileoverview Customer API client hook.
 *
 * Wraps fetch calls to the AutoAgent API for Customer & Lead CRUD.
 * Uses the authenticated Supabase session token from the browser client.
 */

import { createClient } from '@/lib/supabase/client';
import type { Customer, LeadStatus, CreateCustomerInput, UpdateCustomerInput } from '@autoagent/shared';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  return headers;
}

export async function fetchCustomers(
  businessId: string,
  options?: { search?: string; leadStatus?: LeadStatus },
): Promise<Customer[]> {
  const params = new URLSearchParams();
  if (options?.search) params.set('search', options.search);
  if (options?.leadStatus) params.set('leadStatus', options.leadStatus);

  const res = await fetch(
    `${API_BASE}/businesses/${businessId}/customers?${params}`,
    { headers: await getAuthHeaders() },
  );
  if (!res.ok) throw new Error('Failed to fetch customers');
  const json = await res.json();
  return json.data as Customer[];
}

export async function createCustomer(
  businessId: string,
  input: CreateCustomerInput,
): Promise<Customer> {
  const res = await fetch(`${API_BASE}/businesses/${businessId}/customers`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? 'Failed to create customer');
  }
  const json = await res.json();
  return json.data as Customer;
}

export async function updateCustomer(
  businessId: string,
  customerId: string,
  input: UpdateCustomerInput,
): Promise<Customer> {
  const res = await fetch(
    `${API_BASE}/businesses/${businessId}/customers/${customerId}`,
    {
      method: 'PATCH',
      headers: await getAuthHeaders(),
      body: JSON.stringify(input),
    },
  );
  if (!res.ok) throw new Error('Failed to update customer');
  const json = await res.json();
  return json.data as Customer;
}

export async function deleteCustomer(
  businessId: string,
  customerId: string,
): Promise<void> {
  const res = await fetch(
    `${API_BASE}/businesses/${businessId}/customers/${customerId}`,
    {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    },
  );
  if (!res.ok) throw new Error('Failed to delete customer');
}
