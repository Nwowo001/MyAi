/**
 * @fileoverview Business API client.
 *
 * Wraps fetch calls to the AutoAgent API for Business management.
 * Uses the authenticated Supabase session token from the browser client.
 */

import { createClient } from '@/lib/supabase/client';
import type { Business, UpdateBusinessInput } from '@autoagent/shared';

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

/**
 * Fetch all businesses the current authenticated user belongs to.
 */
export async function fetchUserBusinesses(): Promise<Business[]> {
  const res = await fetch(`${API_BASE}/businesses`, {
    headers: await getAuthHeaders(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? 'Failed to fetch businesses');
  }

  const json = await res.json();
  return json.data as Business[];
}

/**
 * Update a business's profile settings (name, currency, timezone, etc.).
 */
export async function updateBusiness(
  businessId: string,
  input: UpdateBusinessInput,
): Promise<Business> {
  const res = await fetch(`${API_BASE}/businesses/${businessId}`, {
    method: 'PATCH',
    headers: await getAuthHeaders(),
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? 'Failed to update business settings');
  }

  const json = await res.json();
  return json.data as Business;
}
