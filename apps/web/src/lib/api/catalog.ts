/**
 * @fileoverview Catalog API client hook.
 *
 * Wraps fetch calls to the AutoAgent API for Offering CRUD.
 * Uses the authenticated Supabase session token from the browser client.
 */

import { createClient } from '@/lib/supabase/client';
import type { Offering, CreateOfferingInput, UpdateOfferingInput } from '@autoagent/shared';

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

export async function fetchOfferings(
  businessId: string,
  options?: { type?: 'PRODUCT' | 'SERVICE'; isActive?: boolean },
): Promise<Offering[]> {
  const params = new URLSearchParams();
  if (options?.type) params.set('type', options.type);
  if (options?.isActive !== undefined) params.set('isActive', String(options.isActive));

  const res = await fetch(
    `${API_BASE}/businesses/${businessId}/offerings?${params}`,
    { headers: await getAuthHeaders() },
  );
  if (!res.ok) throw new Error('Failed to fetch offerings');
  const json = await res.json();
  return json.data as Offering[];
}

export async function createOffering(
  businessId: string,
  input: CreateOfferingInput,
): Promise<Offering> {
  const res = await fetch(`${API_BASE}/businesses/${businessId}/offerings`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? 'Failed to create offering');
  }
  const json = await res.json();
  return json.data as Offering;
}

export async function updateOffering(
  businessId: string,
  offeringId: string,
  input: UpdateOfferingInput,
): Promise<Offering> {
  const res = await fetch(
    `${API_BASE}/businesses/${businessId}/offerings/${offeringId}`,
    {
      method: 'PATCH',
      headers: await getAuthHeaders(),
      body: JSON.stringify(input),
    },
  );
  if (!res.ok) throw new Error('Failed to update offering');
  const json = await res.json();
  return json.data as Offering;
}

export async function deleteOffering(
  businessId: string,
  offeringId: string,
): Promise<void> {
  const res = await fetch(
    `${API_BASE}/businesses/${businessId}/offerings/${offeringId}`,
    {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    },
  );
  if (!res.ok) throw new Error('Failed to delete offering');
}

export async function toggleOfferingActive(
  businessId: string,
  offeringId: string,
  isActive: boolean,
): Promise<Offering> {
  return updateOffering(businessId, offeringId, { isActive });
}
