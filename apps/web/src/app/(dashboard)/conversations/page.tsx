'use client';

/**
 * Conversations Inbox — Phase 6
 *
 * A two-panel live chat inbox:
 * Left:  List of all conversations sorted by last message time
 * Right: Full chat thread + manual reply box + handover / resolve controls
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useBusinessStore } from '@/stores/useBusinessStore';
import {
  fetchConversations,
  fetchMessages,
  sendReply,
  updateHandover,
  resolveConversation,
  type Conversation,
  type ChatMessage,
} from '@/lib/api/conversation';

// ── Status badge config ────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  AI_ACTIVE: 'AI Active',
  HANDOVER_PENDING: 'Handover Pending',
  HUMAN_TAKEN_OVER: 'Human Active',
  RESOLVED: 'Resolved',
};

const STATUS_COLORS: Record<string, string> = {
  AI_ACTIVE: '#10b981',
  HANDOVER_PENDING: '#f59e0b',
  HUMAN_TAKEN_OVER: '#6366f1',
  RESOLVED: '#6b7280',
};

const SENDER_LABELS: Record<string, string> = {
  CUSTOMER: 'Customer',
  AI_AGENT: 'AutoAgent AI',
  HUMAN_AGENT: 'Agent',
  SYSTEM: 'System',
};

// ── Relative time ──────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ── Main Page ───────────────────────────────────────────────────────────────

export default function ConversationsPage() {
  const { activeBusiness } = useBusinessStore();
  const businessId = activeBusiness?.id ?? '';

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('ALL');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const selectedConv = conversations.find((c) => c.id === selectedId) ?? null;

  // ── Load conversations ─────────────────────────────────────────────────

  const loadConversations = useCallback(async () => {
    if (!businessId) return;
    try {
      const data = await fetchConversations(businessId);
      setConversations(data);
    } catch {
      // silently refresh
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    if (!businessId) return;
    setLoading(true);
    void loadConversations();

    // Poll every 8 seconds for new messages
    pollRef.current = setInterval(() => {
      void loadConversations();
    }, 8000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [businessId, loadConversations]);

  // ── Load messages when conversation selected ───────────────────────────

  const loadMessages = useCallback(
    async (convId: string) => {
      if (!businessId) return;
      setMsgLoading(true);
      try {
        const data = await fetchMessages(businessId, convId);
        setMessages(data);
      } catch {
        setMessages([]);
      } finally {
        setMsgLoading(false);
      }
    },
    [businessId],
  );

  useEffect(() => {
    if (!selectedId) return;
    void loadMessages(selectedId);
  }, [selectedId, loadMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Send reply ─────────────────────────────────────────────────────────

  const handleSend = async () => {
    if (!selectedId || !replyText.trim() || sending || !businessId) return;
    setSending(true);
    try {
      const msg = await sendReply(businessId, selectedId, replyText.trim());
      setMessages((prev) => [...prev, msg]);
      setReplyText('');
      void loadConversations();
    } catch {
      setError('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  // ── Handover ───────────────────────────────────────────────────────────

  const handleHandover = async (enable: boolean) => {
    if (!selectedId || !businessId) return;
    try {
      await updateHandover(businessId, selectedId, enable, enable ? 'Human agent requested via dashboard' : undefined);
      await loadConversations();
      await loadMessages(selectedId);
    } catch {
      setError('Failed to update handover');
    }
  };

  // ── Resolve ────────────────────────────────────────────────────────────

  const handleResolve = async () => {
    if (!selectedId || !businessId) return;
    try {
      await resolveConversation(businessId, selectedId);
      await loadConversations();
      await loadMessages(selectedId);
    } catch {
      setError('Failed to resolve conversation');
    }
  };

  // ── Filtered conversations ─────────────────────────────────────────────

  const filtered = conversations.filter((c) => {
    const matchFilter = filter === 'ALL' || c.status === filter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      c.customer.name.toLowerCase().includes(q) ||
      c.customer.phone?.toLowerCase().includes(q) ||
      c.lastMessage?.content.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  // ── Render ─────────────────────────────────────────────────────────────

  if (!businessId) {
    return (
      <div style={styles.emptyState}>
        <p style={{ color: '#94a3b8' }}>No business selected.</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Conversations</h1>
          <p style={styles.pageSubtitle}>WhatsApp inbox · AI-handled & human handover</p>
        </div>
        <div style={styles.statsBadge}>
          <span style={styles.statsDot} />
          {conversations.filter((c) => c.status === 'AI_ACTIVE').length} AI Active
        </div>
      </div>

      <div style={styles.layout}>
        {/* ── Left panel: conversation list ─────────────────────────── */}
        <div style={styles.leftPanel}>
          {/* Search + filter */}
          <div style={styles.searchRow}>
            <input
              type="text"
              placeholder="Search conversations…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          <div style={styles.filterRow}>
            {['ALL', 'AI_ACTIVE', 'HANDOVER_PENDING', 'HUMAN_TAKEN_OVER', 'RESOLVED'].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                style={{
                  ...styles.filterBtn,
                  ...(filter === s ? styles.filterBtnActive : {}),
                }}
              >
                {s === 'ALL' ? 'All' : STATUS_LABELS[s]}
              </button>
            ))}
          </div>

          {/* List */}
          <div style={styles.convList}>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <ConvSkeleton key={i} />)
            ) : filtered.length === 0 ? (
              <div style={styles.emptyList}>
                <div style={{ fontSize: 36 }}>💬</div>
                <p style={{ color: '#94a3b8', marginTop: 8, fontSize: 14 }}>No conversations yet</p>
              </div>
            ) : (
              filtered.map((conv) => (
                <ConvItem
                  key={conv.id}
                  conv={conv}
                  selected={conv.id === selectedId}
                  onClick={() => setSelectedId(conv.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* ── Right panel: chat thread ──────────────────────────────── */}
        <div style={styles.rightPanel}>
          {!selectedConv ? (
            <div style={styles.emptyThread}>
              <div style={{ fontSize: 56 }}>💬</div>
              <h3 style={{ color: '#e2e8f0', marginTop: 16 }}>Select a conversation</h3>
              <p style={{ color: '#64748b', marginTop: 8 }}>
                Choose a conversation from the left to view the full thread.
              </p>
            </div>
          ) : (
            <>
              {/* Thread header */}
              <div style={styles.threadHeader}>
                <div style={styles.threadAvatar}>
                  {selectedConv.customer.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={styles.threadName}>{selectedConv.customer.name}</div>
                  <div style={styles.threadMeta}>
                    {selectedConv.customer.phone && <span>📱 {selectedConv.customer.phone}</span>}
                    <span
                      style={{
                        ...styles.statusBadge,
                        background: STATUS_COLORS[selectedConv.status] + '22',
                        color: STATUS_COLORS[selectedConv.status],
                        borderColor: STATUS_COLORS[selectedConv.status] + '44',
                      }}
                    >
                      {STATUS_LABELS[selectedConv.status]}
                    </span>
                  </div>
                </div>
                {/* Actions */}
                <div style={styles.threadActions}>
                  {selectedConv.status !== 'RESOLVED' && (
                    <>
                      {selectedConv.status === 'AI_ACTIVE' && (
                        <button
                          onClick={() => handleHandover(true)}
                          style={styles.actionBtnWarning}
                          title="Take over from AI"
                        >
                          🙋 Take Over
                        </button>
                      )}
                      {(selectedConv.status === 'HANDOVER_PENDING' ||
                        selectedConv.status === 'HUMAN_TAKEN_OVER') && (
                        <button
                          onClick={() => handleHandover(false)}
                          style={styles.actionBtnGhost}
                          title="Return to AI"
                        >
                          🤖 Return to AI
                        </button>
                      )}
                      <button
                        onClick={handleResolve}
                        style={styles.actionBtnSuccess}
                        title="Mark as resolved"
                      >
                        ✅ Resolve
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div style={styles.messagesArea}>
                {msgLoading ? (
                  <div style={styles.msgLoading}>Loading messages…</div>
                ) : messages.length === 0 ? (
                  <div style={styles.msgLoading}>No messages yet</div>
                ) : (
                  messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply box */}
              {selectedConv.status !== 'RESOLVED' && (
                <div style={styles.replyBox}>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        void handleSend();
                      }
                    }}
                    placeholder="Type a reply… (Enter to send, Shift+Enter for newline)"
                    style={styles.replyInput}
                    rows={3}
                  />
                  <button
                    onClick={() => void handleSend()}
                    disabled={!replyText.trim() || sending}
                    style={{
                      ...styles.sendBtn,
                      opacity: !replyText.trim() || sending ? 0.5 : 1,
                    }}
                  >
                    {sending ? '…' : '➤ Send'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Error toast */}
      {error && (
        <div style={styles.errorToast}>
          {error}
          <button onClick={() => setError(null)} style={styles.toastClose}>✕</button>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function ConvItem({ conv, selected, onClick }: { conv: Conversation; selected: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ ...styles.convItem, ...(selected ? styles.convItemSelected : {}) }}>
      <div style={styles.convAvatar}>
        {conv.customer.name.charAt(0).toUpperCase()}
        <span
          style={{
            ...styles.convDot,
            background: STATUS_COLORS[conv.status],
          }}
        />
      </div>
      <div style={styles.convInfo}>
        <div style={styles.convNameRow}>
          <span style={styles.convName}>{conv.customer.name}</span>
          <span style={styles.convTime}>
            {conv.lastMessage ? timeAgo(conv.lastMessage.createdAt) : timeAgo(conv.createdAt)}
          </span>
        </div>
        <div style={styles.convPreview}>
          {conv.lastMessage?.content ?? 'No messages yet'}
        </div>
      </div>
    </button>
  );
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isCustomer = msg.senderType === 'CUSTOMER';
  const isSystem = msg.senderType === 'SYSTEM';

  if (isSystem) {
    return (
      <div style={styles.systemMsg}>
        <span>{msg.content}</span>
        <span style={styles.msgTime}>{formatTime(msg.createdAt)}</span>
      </div>
    );
  }

  return (
    <div style={{ ...styles.msgRow, justifyContent: isCustomer ? 'flex-start' : 'flex-end' }}>
      <div
        style={{
          ...styles.bubble,
          ...(isCustomer ? styles.bubbleCustomer : styles.bubbleAgent),
        }}
      >
        <div style={styles.bubbleSender}>{SENDER_LABELS[msg.senderType] ?? msg.senderType}</div>
        <div style={styles.bubbleContent}>{msg.content}</div>
        <div style={styles.bubbleTime}>{formatTime(msg.createdAt)}</div>
      </div>
    </div>
  );
}

function ConvSkeleton() {
  return (
    <div style={styles.skeleton}>
      <div style={styles.skeletonAvatar} />
      <div style={{ flex: 1 }}>
        <div style={{ ...styles.skeletonLine, width: '60%' }} />
        <div style={{ ...styles.skeletonLine, width: '85%', marginTop: 6 }} />
      </div>
    </div>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  page: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    padding: '0 0 0 0',
  },
  pageHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '28px 32px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    flexShrink: 0,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: 700,
    color: '#f1f5f9',
    margin: 0,
    letterSpacing: '-0.5px',
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#64748b',
    margin: '4px 0 0',
  },
  statsBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: 'rgba(16,185,129,0.12)',
    color: '#10b981',
    padding: '6px 14px',
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 500,
    border: '1px solid rgba(16,185,129,0.25)',
  },
  statsDot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: '#10b981',
    animation: 'pulse 2s infinite',
  },
  layout: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  leftPanel: {
    width: 340,
    flexShrink: 0,
    borderRight: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  searchRow: {
    padding: '12px 16px 8px',
  },
  searchInput: {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: '9px 14px',
    color: '#f1f5f9',
    fontSize: 13,
    outline: 'none',
    boxSizing: 'border-box',
  },
  filterRow: {
    display: 'flex',
    gap: 4,
    padding: '4px 16px 10px',
    flexWrap: 'wrap',
  },
  filterBtn: {
    padding: '4px 10px',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'transparent',
    color: '#64748b',
    fontSize: 11,
    cursor: 'pointer',
    fontWeight: 500,
    transition: 'all 0.15s',
  },
  filterBtnActive: {
    background: 'rgba(99,102,241,0.2)',
    color: '#818cf8',
    borderColor: 'rgba(99,102,241,0.4)',
  },
  convList: {
    flex: 1,
    overflowY: 'auto',
  },
  convItem: {
    display: 'flex',
    gap: 12,
    padding: '14px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
    transition: 'background 0.15s',
    alignItems: 'flex-start',
  },
  convItemSelected: {
    background: 'rgba(99,102,241,0.12)',
    borderLeft: '3px solid #6366f1',
  },
  convAvatar: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 700,
    fontSize: 16,
    flexShrink: 0,
    position: 'relative',
  },
  convDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 10,
    height: 10,
    borderRadius: '50%',
    border: '2px solid #0f172a',
  },
  convInfo: {
    flex: 1,
    overflow: 'hidden',
  },
  convNameRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  convName: {
    fontWeight: 600,
    color: '#e2e8f0',
    fontSize: 14,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  convTime: {
    fontSize: 11,
    color: '#475569',
    flexShrink: 0,
    marginLeft: 6,
  },
  convPreview: {
    fontSize: 12,
    color: '#64748b',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  rightPanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  emptyThread: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#94a3b8',
    textAlign: 'center',
  },
  threadHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '16px 24px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    flexShrink: 0,
    background: 'rgba(255,255,255,0.02)',
  },
  threadAvatar: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 700,
    fontSize: 18,
    flexShrink: 0,
  },
  threadName: {
    fontWeight: 700,
    color: '#f1f5f9',
    fontSize: 16,
  },
  threadMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginTop: 3,
    fontSize: 12,
    color: '#64748b',
  },
  statusBadge: {
    padding: '2px 10px',
    borderRadius: 12,
    fontSize: 11,
    fontWeight: 600,
    border: '1px solid',
  },
  threadActions: {
    display: 'flex',
    gap: 8,
    marginLeft: 'auto',
    flexShrink: 0,
  },
  actionBtnWarning: {
    padding: '7px 14px',
    borderRadius: 8,
    border: '1px solid rgba(245,158,11,0.4)',
    background: 'rgba(245,158,11,0.12)',
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  actionBtnGhost: {
    padding: '7px 14px',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.06)',
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  actionBtnSuccess: {
    padding: '7px 14px',
    borderRadius: 8,
    border: '1px solid rgba(16,185,129,0.4)',
    background: 'rgba(16,185,129,0.12)',
    color: '#34d399',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  messagesArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  msgLoading: {
    textAlign: 'center',
    color: '#475569',
    fontSize: 14,
    marginTop: 40,
  },
  msgRow: {
    display: 'flex',
  },
  bubble: {
    maxWidth: '68%',
    padding: '10px 14px',
    borderRadius: 14,
    lineHeight: 1.5,
  },
  bubbleCustomer: {
    background: 'rgba(255,255,255,0.07)',
    borderBottomLeftRadius: 4,
    border: '1px solid rgba(255,255,255,0.1)',
  },
  bubbleAgent: {
    background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.25))',
    borderBottomRightRadius: 4,
    border: '1px solid rgba(99,102,241,0.35)',
  },
  bubbleSender: {
    fontSize: 11,
    fontWeight: 700,
    color: '#6366f1',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  bubbleContent: {
    fontSize: 14,
    color: '#e2e8f0',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  bubbleTime: {
    fontSize: 10,
    color: '#475569',
    marginTop: 6,
    textAlign: 'right',
  },
  systemMsg: {
    display: 'flex',
    justifyContent: 'center',
    gap: 8,
    fontSize: 12,
    color: '#475569',
    fontStyle: 'italic',
    padding: '4px 0',
  },
  msgTime: {
    fontSize: 10,
    color: '#334155',
  },
  replyBox: {
    display: 'flex',
    gap: 10,
    padding: '14px 24px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    background: 'rgba(255,255,255,0.02)',
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  replyInput: {
    flex: 1,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 12,
    padding: '10px 14px',
    color: '#f1f5f9',
    fontSize: 14,
    outline: 'none',
    resize: 'none',
    lineHeight: 1.5,
    fontFamily: 'inherit',
  },
  sendBtn: {
    padding: '10px 20px',
    borderRadius: 12,
    border: 'none',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    fontWeight: 700,
    fontSize: 14,
    cursor: 'pointer',
    transition: 'all 0.15s',
    flexShrink: 0,
    height: 44,
  },
  emptyState: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyList: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    color: '#64748b',
  },
  skeleton: {
    display: 'flex',
    gap: 12,
    padding: '14px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    alignItems: 'center',
  },
  skeletonAvatar: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.06)',
    flexShrink: 0,
    animation: 'pulse 1.5s infinite',
  },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
    background: 'rgba(255,255,255,0.06)',
    animation: 'pulse 1.5s infinite',
  },
  errorToast: {
    position: 'fixed',
    bottom: 24,
    right: 24,
    background: 'rgba(239,68,68,0.15)',
    border: '1px solid rgba(239,68,68,0.4)',
    color: '#f87171',
    padding: '12px 16px',
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    fontSize: 14,
    zIndex: 999,
    backdropFilter: 'blur(10px)',
  },
  toastClose: {
    background: 'none',
    border: 'none',
    color: '#f87171',
    cursor: 'pointer',
    fontSize: 16,
    padding: 0,
    lineHeight: 1,
  },
};
