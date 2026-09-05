'use client';

import { useState } from 'react';
import { useBusinessStore } from '@/stores/useBusinessStore';

export default function BusinessSettingsPage() {
  const { activeBusiness, setActiveBusiness, formatCurrency } = useBusinessStore();

  const [name, setName] = useState(activeBusiness?.name ?? 'My Business');
  const [currency, setCurrency] = useState(activeBusiness?.currency ?? 'NGN');
  const [timezone, setTimezone] = useState(activeBusiness?.timezone ?? 'Africa/Lagos');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBusiness) return;

    setActiveBusiness({
      ...activeBusiness,
      name,
      currency,
      timezone,
      updatedAt: new Date().toISOString(),
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 sm:p-8 space-y-8 bg-white min-h-screen">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">Business Settings</h1>
        <p className="text-sm text-[#64748B] mt-1">
          Manage your tenant business profile, ISO 4217 currency settings, and team access.
        </p>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-50 border border-[#10B981] text-[#059669] text-sm font-semibold rounded-lg">
          Business settings updated successfully.
        </div>
      )}

      {/* Business Identity Form */}
      <form onSubmit={handleSave} className="bg-[#F8FAFC] p-6 rounded-xl border border-slate-200 space-y-6">
        <h2 className="text-lg font-bold text-[#0F172A]">General Profile</h2>

        <div>
          <label className="block text-sm font-semibold text-[#0F172A]">Business Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-[#020617] focus:ring-2 focus:ring-[#10B981] focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#0F172A]">
              Currency Code (ISO 4217)
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="mt-1.5 w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-[#020617] focus:ring-2 focus:ring-[#10B981] focus:outline-none"
            >
              <option value="NGN">NGN — Nigerian Naira (₦)</option>
              <option value="USD">USD — US Dollar ($)</option>
              <option value="GBP">GBP — British Pound (£)</option>
              <option value="EUR">EUR — Euro (€)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#0F172A]">Timezone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="mt-1.5 w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-[#020617] focus:ring-2 focus:ring-[#10B981] focus:outline-none"
            >
              <option value="Africa/Lagos">Africa/Lagos (WAT, UTC+1)</option>
              <option value="Europe/London">Europe/London (GMT, UTC+0)</option>
              <option value="America/New_York">America/New_York (EST, UTC-5)</option>
              <option value="Asia/Dubai">Asia/Dubai (GST, UTC+4)</option>
            </select>
          </div>
        </div>

        {/* Currency Preview Card */}
        <div className="p-4 bg-white border border-slate-200 rounded-lg">
          <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] block mb-1">
            Formatted Currency Preview
          </span>
          <p className="text-2xl font-extrabold text-[#10B981]">
            {formatCurrency(125000)}
          </p>
          <span className="text-xs text-[#64748B] mt-1 block">
            Prices, quotes, and Paystack payment links will format using {currency}.
          </span>
        </div>

        <div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white text-sm font-semibold rounded-lg shadow-sm transition-all"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
