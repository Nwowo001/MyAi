/**
 * @fileoverview Conversations API client.
 * Wraps fetch calls to the AutoAgent API for conversations and messages.
 */

import { createClient } from '@/lib/supabase/client';

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

export type ConversationStatus = 'AI_ACTIVE' | 'HANDOVER_PENDING' | 'HUMAN_TAKEN_OVER' | 'RESOLVED';
export type SenderType = 'CUSTOMER' | 'AI_AGENT' | 'HUMAN_AGENT' | 'SYSTEM';

export interface Conversation {
  id: string;
  businessId: string;
  customerId: string;
  channel: string;
  status: ConversationStatus;
  assignedAgentId: string | null;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
  };
  lastMessage?: {
    id: string;
    senderType: string;
    content: string;
    createdAt: string;
  } | null;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderType: SenderType;
  content: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export async function fetchConversations(businessId: string): Promise<Conversation[]> {
  const res = await fetch(`${API_BASE}/businesses/${businessId}/conversations`, {
    headers: await getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch conversations');
  const json = await res.json();
  return json.data as Conversation[];
}

export async function fetchMessages(businessId: string, conversationId: string): Promise<ChatMessage[]> {
  const res = await fetch(
    `${API_BASE}/businesses/${businessId}/conversations/${conversationId}/messages`,
    { headers: await getAuthHeaders() },
  );
  if (!res.ok) throw new Error('Failed to fetch messages');
  const json = await res.json();
  return json.data as ChatMessage[];
}

export async function sendReply(
  businessId: string,
  conversationId: string,
  content: string,
): Promise<ChatMessage> {
  const res = await fetch(
    `${API_BASE}/businesses/${businessId}/conversations/${conversationId}/reply`,
    {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ content }),
    },
  );
  if (!res.ok) throw new Error('Failed to send reply');
  const json = await res.json();
  return json.data as ChatMessage;
}

export async function updateHandover(
  businessId: string,
  conversationId: string,
  humanHandover: boolean,
  reason?: string,
): Promise<void> {
  const res = await fetch(
    `${API_BASE}/businesses/${businessId}/conversations/${conversationId}/handover`,
    {
      method: 'PATCH',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ humanHandover, reason }),
    },
  );
  if (!res.ok) throw new Error('Failed to update handover');
}

export async function resolveConversation(businessId: string, conversationId: string): Promise<void> {
  const res = await fetch(
    `${API_BASE}/businesses/${businessId}/conversations/${conversationId}/resolve`,
    {
      method: 'PATCH',
      headers: await getAuthHeaders(),
    },
  );
  if (!res.ok) throw new Error('Failed to resolve conversation');
}
