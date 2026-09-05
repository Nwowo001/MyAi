'use client';

/**
 * Business Settings & WhatsApp Integration Page.
 *
 * Provides:
 * 1. Business profile configuration (name, currency, timezone).
 * 2. WhatsApp connection with two modes:
 *    - Mode A: Direct API Credentials (Instant connect with Phone Number ID + Token)
 *    - Mode B: Meta Embedded Signup (One-click popup for client onboarding)
 * 3. Copyable Webhook URL & verification token with one-click clipboard helpers.
 */

import { useState, useEffect, useCallback } from 'react';
import { useBusinessStore } from '@/stores/useBusinessStore';
import { createClient } from '@/lib/supabase/client';
import { fetchUserBusinesses, updateBusiness } from '@/lib/api/business';
import {
  Check,
  Copy,
  ExternalLink,
  Key,
  Phone,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Building2,
  Globe,
  Coins,
  Clock,
  Sparkles,
  Plug,
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';
const META_APP_ID = process.env.NEXT_PUBLIC_META_APP_ID ?? '';
const isMetaAppConfigured = Boolean(
  META_APP_ID &&
  META_APP_ID !== 'your_meta_app_id_here' &&
  /^\d+$/.test(META_APP_ID)
);

// ── Types ──────────────────────────────────────────────────────────────────

interface WhatsAppStatus {
  connected: boolean;
  displayPhoneNumber?: string;
  wabaId?: string;
  phoneNumberId?: string;
  status?: string;
}

// ── Auth header helper ─────────────────────────────────────────────────────

async function getAuthHeaders(): Promise<Record<string, string>> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return {
    'Content-Type': 'application/json',
    ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
  };
}

export default function SettingsPage() {
  const { activeBusiness, setActiveBusiness, setBusinesses, formatCurrency } = useBusinessStore();
  const businessId = activeBusiness?.id ?? '';

  // Profile Form state
  const [name, setName] = useState(activeBusiness?.name ?? '');
  const [currency, setCurrency] = useState(activeBusiness?.currency ?? 'NGN');
  const [timezone, setTimezone] = useState(activeBusiness?.timezone ?? 'Africa/Lagos');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync profile form when activeBusiness changes
  useEffect(() => {
    if (activeBusiness) {
      setName(activeBusiness.name);
      setCurrency(activeBusiness.currency);
      setTimezone(activeBusiness.timezone);
    }
  }, [activeBusiness]);

  // Fallback: load businesses if not yet in store
  useEffect(() => {
    if (!activeBusiness) {
      void fetchUserBusinesses()
        .then((businesses) => {
          if (businesses && businesses.length > 0) {
            setBusinesses(businesses);
          }
        })
        .catch(() => {});
    }
  }, [activeBusiness, setBusinesses]);

  // WhatsApp Connection State
  const [waStatus, setWaStatus] = useState<WhatsAppStatus>({ connected: false });
  const [waLoading, setWaLoading] = useState(false);
  const [waConnecting, setWaConnecting] = useState(false);
  const [waError, setWaError] = useState<string | null>(null);
  const [waSuccessMsg, setWaSuccessMsg] = useState<string | null>(null);

  // Direct Credentials State
  const [connectMode, setConnectMode] = useState<'direct' | 'embedded'>('direct');
  const [directPhoneId, setDirectPhoneId] = useState('');
  const [directWabaId, setDirectWabaId] = useState('');
  const [directToken, setDirectToken] = useState('');
  const [directPhone, setDirectPhone] = useState('');

  // Clipboard copy state
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  // ── Load WhatsApp connection status ───────────────────────────────────────

  const loadWaStatus = useCallback(async () => {
    if (!businessId) return;
    try {
      const res = await fetch(`${API_BASE}/businesses/${businessId}/whatsapp/status`, {
        headers: await getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setWaStatus(json.data);
        }
      }
    } catch {
      // silently fail on initial load
    }
  }, [businessId]);

  useEffect(() => {
    void loadWaStatus();
  }, [loadWaStatus]);

  // ── Load Meta Facebook SDK (for Embedded Signup) ──────────────────────────

  useEffect(() => {
    if (!isMetaAppConfigured || typeof window === 'undefined') return;
    if (document.getElementById('facebook-jssdk')) return;

    const script = document.createElement('script');
    script.id = 'facebook-jssdk';
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.FB?.init({
        appId: META_APP_ID,
        cookie: true,
        xfbml: true,
        version: 'v21.0',
      });
    };
    document.body.appendChild(script);

    return () => {
      const el = document.getElementById('facebook-jssdk');
      if (el) el.remove();
    };
  }, []);

  // ── Save Business Profile ─────────────────────────────────────────────────

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setSaveSuccess(false);

    let targetBusinessId = businessId;

    if (!targetBusinessId) {
      setSavingProfile(true);
      try {
        const businesses = await fetchUserBusinesses();
        const first = businesses[0];
        if (first) {
          setBusinesses(businesses);
          targetBusinessId = first.id;
        } else {
          setProfileError('No business account found. Please complete onboarding first.');
          setSavingProfile(false);
          return;
        }
      } catch {
        setProfileError('Could not locate your business profile. Please refresh.');
        setSavingProfile(false);
        return;
      }
    }

    setSavingProfile(true);
    try {
      const updated = await updateBusiness(targetBusinessId, {
        name: name.trim(),
        currency,
        timezone,
      });

      setActiveBusiness(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Failed to save business settings');
    } finally {
      setSavingProfile(false);
    }
  };

  // ── Mode A: Direct Credentials Submission ─────────────────────────────────

  const handleDirectConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) {
      setWaError('No active business found. Please refresh or select a business.');
      return;
    }
    if (!directPhoneId.trim() || !directToken.trim()) {
      setWaError('Phone Number ID and Access Token are required.');
      return;
    }

    setWaLoading(true);
    setWaError(null);
    setWaSuccessMsg(null);

    try {
      const res = await fetch(`${API_BASE}/businesses/${businessId}/whatsapp/connect`, {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({
          phoneNumberId: directPhoneId.trim(),
          wabaId: directWabaId.trim() || undefined,
          accessToken: directToken.trim(),
          displayPhoneNumber: directPhone.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error ?? 'Failed to connect WhatsApp account.');
      }

      setWaStatus({
        connected: true,
        displayPhoneNumber: json.connection?.displayPhoneNumber ?? directPhone,
        wabaId: json.connection?.wabaId ?? directWabaId,
        phoneNumberId: json.connection?.phoneNumberId ?? directPhoneId,
        status: 'CONNECTED',
      });

      setWaSuccessMsg('WhatsApp Business account connected and encrypted successfully!');
      setDirectToken('');
    } catch (err) {
      setWaError(err instanceof Error ? err.message : 'Connection failed. Please check credentials.');
    } finally {
      setWaLoading(false);
    }
  };

  // ── Mode B: Meta Embedded Signup Popup ────────────────────────────────────

  const launchEmbeddedSignup = () => {
    if (!isMetaAppConfigured) {
      setWaError(
        'Meta App ID is not yet configured. Please enter your Meta App ID in apps/web/.env.local or use the Direct API Credentials tab below.'
      );
      return;
    }

    if (!window.FB) {
      setWaError('Facebook SDK is still initializing. Please wait a moment and try again.');
      return;
    }

    setWaConnecting(true);
    setWaError(null);
    setWaSuccessMsg(null);

    const safetyTimeout = setTimeout(() => {
      setWaConnecting(false);
    }, 60000);

    try {
      window.FB.login(
        async (response: { authResponse?: { code: string }; status: string }) => {
          clearTimeout(safetyTimeout);
          setWaConnecting(false);

          if (response.authResponse?.code) {
            await exchangeEmbeddedCode(response.authResponse.code);
          } else {
            if (response.status !== 'unknown') {
              setWaError('WhatsApp setup was cancelled or closed.');
            }
          }
        },
        {
          config_id: META_APP_ID,
          response_type: 'code',
          override_default_response_type: true,
          extras: {
            setup: {},
            featureType: '',
            sessionInfoVersion: '3',
          },
        }
      );
    } catch (err) {
      clearTimeout(safetyTimeout);
      setWaConnecting(false);
      setWaError(err instanceof Error ? err.message : 'Failed to launch Meta popup.');
    }
  };

  const exchangeEmbeddedCode = async (code: string) => {
    setWaLoading(true);
    setWaError(null);
    try {
      const res = await fetch(`${API_BASE}/businesses/${businessId}/whatsapp/connect`, {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ code }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error ?? 'Failed to exchange authentication code with Meta.');
      }

      setWaStatus({
        connected: true,
        displayPhoneNumber: json.connection?.displayPhoneNumber,
        wabaId: json.connection?.wabaId,
        phoneNumberId: json.connection?.phoneNumberId,
        status: 'CONNECTED',
      });
      setWaSuccessMsg('WhatsApp account connected successfully!');
    } catch (err) {
      setWaError(err instanceof Error ? err.message : 'Failed to connect WhatsApp account.');
    } finally {
      setWaLoading(false);
    }
  };

  // ── Disconnect WhatsApp ───────────────────────────────────────────────────

  const handleDisconnect = async () => {
    if (
      !confirm(
        'Disconnect WhatsApp? Your AI agent will no longer receive or respond to WhatsApp messages for this business.'
      )
    ) {
      return;
    }

    setWaLoading(true);
    setWaError(null);
    setWaSuccessMsg(null);

    try {
      const res = await fetch(`${API_BASE}/businesses/${businessId}/whatsapp/disconnect`, {
        method: 'DELETE',
        headers: await getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Failed to disconnect');

      setWaStatus({ connected: false });
      setWaSuccessMsg('WhatsApp account disconnected successfully.');
    } catch {
      setWaError('Failed to disconnect WhatsApp account.');
    } finally {
      setWaLoading(false);
    }
  };

  // ── Copy to Clipboard ─────────────────────────────────────────────────────

  const webhookUrl =
    typeof window !== 'undefined'
      ? `${window.location.protocol}//${window.location.hostname}:4000/api/webhooks/whatsapp`
      : 'https://your-api-domain.com/api/webhooks/whatsapp';

  const copyToClipboard = (text: string, type: 'webhook' | 'token') => {
    navigator.clipboard.writeText(text);
    if (type === 'webhook') {
      setCopiedWebhook(true);
      setTimeout(() => setCopiedWebhook(false), 2000);
    } else {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your business profile, operating currency, and WhatsApp AI integrations.
        </p>
      </div>

      {/* Save Success Banner */}
      {saveSuccess && (
        <div className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          Business settings saved successfully!
        </div>
      )}

      {/* ── Section 1: Business Profile ────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Business Profile</h2>
            <p className="text-xs text-slate-500">
              Identity details used by the AI agent when conversing with your customers.
            </p>
          </div>
        </div>

        <form onSubmit={handleProfileSave} className="p-6 space-y-5">
          {profileError && (
            <div className="flex items-start gap-2 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>{profileError}</div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Business Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
              placeholder="e.g. Acme Tech Stores"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-slate-400" /> Currency (ISO 4217)
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
              >
                <option value="NGN">NGN — Nigerian Naira (₦)</option>
                <option value="USD">USD — US Dollar ($)</option>
                <option value="GBP">GBP — British Pound (£)</option>
                <option value="EUR">EUR — Euro (€)</option>
                <option value="GHS">GHS — Ghanaian Cedi (₵)</option>
                <option value="KES">KES — Kenyan Shilling (KSh)</option>
                <option value="ZAR">ZAR — South African Rand (R)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
              >
                <option value="Africa/Lagos">Africa/Lagos (WAT, UTC+1)</option>
                <option value="Africa/Accra">Africa/Accra (GMT, UTC+0)</option>
                <option value="Africa/Nairobi">Africa/Nairobi (EAT, UTC+3)</option>
                <option value="Africa/Johannesburg">Africa/Johannesburg (SAST, UTC+2)</option>
                <option value="Europe/London">Europe/London (GMT, UTC+0)</option>
                <option value="America/New_York">America/New_York (EST, UTC-5)</option>
                <option value="Asia/Dubai">Asia/Dubai (GST, UTC+4)</option>
              </select>
            </div>
          </div>

          {/* Currency Preview Card */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Formatted Price Preview
              </span>
              <span className="text-xs text-slate-400">
                How products and booking totals will appear to customers
              </span>
            </div>
            <div className="text-lg font-bold text-emerald-600 font-mono">
              {formatCurrency(125000)}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm transition disabled:opacity-50 flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {savingProfile ? (
                <>
                  <span className="inline-block animate-spin">⏳</span>
                  <span>Saving Changes…</span>
                </>
              ) : (
                'Save Profile Changes'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ── Section 2: WhatsApp Integration ────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#25D366]/10 text-[#25D366] flex items-center justify-center font-bold text-lg">
              📱
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-slate-900">WhatsApp Business Cloud</h2>
                {waStatus.connected ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                    Not Connected
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Connect your WhatsApp Business line so the AI Agent can automatically handle customer orders and inquiries.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Notifications */}
          {waSuccessMsg && (
            <div className="flex items-center gap-2 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              {waSuccessMsg}
            </div>
          )}

          {waError && (
            <div className="flex items-start gap-2 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>{waError}</div>
            </div>
          )}

          {waStatus.connected ? (
            /* ── Connected State View ── */
            <div className="space-y-6">
              <div className="p-5 bg-emerald-50/50 border border-emerald-200/80 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xl">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-base font-bold text-slate-900">
                      {waStatus.displayPhoneNumber || 'Active WhatsApp Line'}
                    </div>
                    <div className="text-xs text-slate-500 space-y-0.5 mt-0.5">
                      <div>WABA Account ID: <span className="font-mono text-slate-700">{waStatus.wabaId || 'Registered'}</span></div>
                      <div>Phone Number ID: <span className="font-mono text-slate-700">{waStatus.phoneNumberId || 'Linked'}</span></div>
                    </div>
                    <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                      <Sparkles className="w-3.5 h-3.5" /> AI Auto-Responder Active
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDisconnect}
                  disabled={waLoading}
                  className="px-4 py-2 bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-lg text-xs font-semibold transition disabled:opacity-50"
                >
                  {waLoading ? 'Disconnecting…' : 'Disconnect Line'}
                </button>
              </div>

              {/* Webhook Configuration for Meta */}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <div className="flex items-center gap-2">
                  <Plug className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-semibold text-slate-900">Meta Webhook Settings</h3>
                </div>
                <p className="text-xs text-slate-600">
                  Ensure this webhook URL is configured in your{' '}
                  <a
                    href="https://developers.facebook.com/apps/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 hover:underline inline-flex items-center gap-1 font-medium"
                  >
                    Meta Developer Console <ExternalLink className="w-3 h-3" />
                  </a>{' '}
                  under WhatsApp &gt; Configuration:
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Callback URL
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={webhookUrl}
                        className="w-full font-mono text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 select-all"
                      />
                      <button
                        type="button"
                        onClick={() => copyToClipboard(webhookUrl, 'webhook')}
                        className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-medium text-slate-700 flex items-center gap-1 flex-shrink-0 transition"
                      >
                        {copiedWebhook ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedWebhook ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Verify Token
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value="autoagent_webhook_verify"
                        className="w-full font-mono text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 select-all"
                      />
                      <button
                        type="button"
                        onClick={() => copyToClipboard('autoagent_webhook_verify', 'token')}
                        className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-medium text-slate-700 flex items-center gap-1 flex-shrink-0 transition"
                      >
                        {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedToken ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ── Not Connected: Dual Setup Options ── */
            <div className="space-y-6">
              {/* Tab Selector */}
              <div className="flex border-b border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setConnectMode('direct');
                    setWaError(null);
                  }}
                  className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition -mb-px flex items-center gap-2 cursor-pointer ${
                    connectMode === 'direct'
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Key className="w-4 h-4" /> Direct Credentials (Instant Setup)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConnectMode('embedded');
                    setWaError(null);
                  }}
                  className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition -mb-px flex items-center gap-2 cursor-pointer ${
                    connectMode === 'embedded'
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Sparkles className="w-4 h-4" /> Meta Embedded Signup (Popup)
                </button>
              </div>

              {/* Mode A: Direct Manual Setup */}
              {connectMode === 'direct' && (
                <form onSubmit={handleDirectConnect} className="space-y-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 space-y-1">
                    <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" /> Instant Connection via Meta Developer Credentials
                    </div>
                    <p>
                      Copy your <strong>Phone Number ID</strong> and <strong>Access Token</strong> (System User or Test Token) from the{' '}
                      <a
                        href="https://developers.facebook.com/apps/"
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-700 font-medium underline inline-flex items-center gap-0.5"
                      >
                        Meta App Dashboard <ExternalLink className="w-3 h-3" />
                      </a>
                      . Tokens are encrypted using AES-256 before storing in the database.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Phone Number ID <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={directPhoneId}
                        onChange={(e) => setDirectPhoneId(e.target.value)}
                        placeholder="e.g. 104829104812398"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        WhatsApp Business Account ID (WABA ID)
                      </label>
                      <input
                        type="text"
                        value={directWabaId}
                        onChange={(e) => setDirectWabaId(e.target.value)}
                        placeholder="e.g. 109283749281726"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Meta Access Token (System User / Permanent Token) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={directToken}
                      onChange={(e) => setDirectToken(e.target.value)}
                      placeholder="EAAG..."
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Must have <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">whatsapp_business_messaging</code> and <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">whatsapp_business_management</code> permissions.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Display Phone Number (Optional)
                    </label>
                    <input
                      type="text"
                      value={directPhone}
                      onChange={(e) => setDirectPhone(e.target.value)}
                      placeholder="e.g. +234 801 234 5678"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={waLoading}
                      className="px-6 py-3 bg-[#25D366] hover:bg-[#20ba59] text-white font-semibold text-sm rounded-lg shadow-sm hover:shadow transition flex items-center gap-2 disabled:opacity-60 cursor-pointer"
                    >
                      <Phone className="w-4 h-4" />
                      {waLoading ? 'Verifying with Meta…' : 'Connect WhatsApp Account'}
                    </button>
                  </div>
                </form>
              )}

              {/* Mode B: Meta Embedded Signup Popup */}
              {connectMode === 'embedded' && (
                <div className="space-y-4">
                  {!isMetaAppConfigured && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 space-y-1">
                      <div className="font-semibold flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-amber-600" /> Meta App ID Required for Embedded Signup
                      </div>
                      <p>
                        To use the one-click Meta login popup, set <code className="font-mono bg-amber-100 px-1 rounded">NEXT_PUBLIC_META_APP_ID</code> in <code className="font-mono bg-amber-100 px-1 rounded">apps/web/.env.local</code> to your numeric Meta App ID.
                      </p>
                      <p className="mt-1">
                        👉 Or switch to the <strong>Direct Credentials</strong> tab above to connect immediately without configuring Embedded Signup!
                      </p>
                    </div>
                  )}

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                    <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                      How Embedded Signup Works
                    </h4>
                    <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside">
                      <li>Click the button below to launch Meta's secure WhatsApp Business onboarding popup.</li>
                      <li>Select your Meta Business Account and choose or register a phone number.</li>
                      <li>Grant messaging permissions to AutoAgent.</li>
                      <li>Your WhatsApp number and access tokens will be securely linked to this business.</li>
                    </ol>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={launchEmbeddedSignup}
                      disabled={waConnecting || waLoading || !isMetaAppConfigured}
                      className="px-6 py-3.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow transition flex items-center gap-2.5 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                    >
                      <span className="text-lg">📲</span>
                      {waConnecting ? (
                        <span>Launching Meta Login…</span>
                      ) : waLoading ? (
                        <span>Exchanging Code with Meta…</span>
                      ) : (
                        <span>Connect with Meta Embedded Signup</span>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Webhook Info Card */}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                    Webhook Destination for Inbound WhatsApp Messages
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={webhookUrl}
                      className="w-full font-mono text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 select-all"
                    />
                    <button
                      type="button"
                      onClick={() => copyToClipboard(webhookUrl, 'webhook')}
                      className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-medium text-slate-700 flex items-center gap-1 flex-shrink-0 transition"
                    >
                      {copiedWebhook ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedWebhook ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Verify Token: <code className="font-mono text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">autoagent_webhook_verify</code>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Meta SDK Global Declaration ─────────────────────────────────────────────

declare global {
  interface Window {
    FB?: {
      init: (options: Record<string, unknown>) => void;
      login: (
        callback: (response: { authResponse?: { code: string }; status: string }) => void,
        options: Record<string, unknown>
      ) => void;
    };
  }
}
