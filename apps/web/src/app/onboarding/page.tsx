'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBusinessStore } from '@/stores/useBusinessStore';
import type { Business } from '@autoagent/shared';

const CURRENCIES = [
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setActiveBusiness } = useBusinessStore();

  // Form State
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('E-Commerce / Retail');
  const [description, setDescription] = useState('');
  const [currency, setCurrency] = useState('NGN');
  const [timezone, setTimezone] = useState('Africa/Lagos');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [teamEmail, setTeamEmail] = useState('');
  const [teamRole, setTeamRole] = useState<'ADMIN' | 'AGENT'>('AGENT');
  const [invitedMembers, setInvitedMembers] = useState<Array<{ email: string; role: string }>>([]);

  const handleAddMember = () => {
    if (!teamEmail.trim()) return;
    setInvitedMembers([...invitedMembers, { email: teamEmail.trim(), role: teamRole }]);
    setTeamEmail('');
  };

  const handleFinishOnboarding = async () => {
    setLoading(true);

    try {
      // Call backend API or local state initialization
      const mockCreatedBusiness: Business = {
        id: `biz_${Date.now()}`,
        name: businessName || 'My Business',
        description: description || null,
        industry: industry || null,
        phone: phone || null,
        email: email || null,
        website: null,
        address: null,
        timezone,
        currency,
        logoUrl: null,
        ownerId: 'usr_owner_001',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setActiveBusiness(mockCreatedBusiness);
      router.push('/dashboard');
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#020617] flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto w-full">
        {/* Step Indicator Header */}
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#0F172A] flex items-center justify-center text-white font-extrabold text-lg mx-auto shadow-md mb-4">
            AA
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">
            Set up your Business Agent
          </h1>
          <p className="mt-2 text-sm text-[#64748B]">Step {step} of 4</p>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 h-2 rounded-full mt-4 overflow-hidden">
            <div
              className="bg-[#10B981] h-full transition-all duration-300 ease-in-out"
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm">
          {/* STEP 1: Business Identity */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-[#0F172A]">Business Information</h2>
                <p className="text-xs text-[#64748B]">Tell us about your business or brand.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0F172A]">
                  Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="mt-1.5 w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-[#020617] focus:ring-2 focus:ring-[#10B981] focus:outline-none"
                  placeholder="e.g. Apex Luxury Services"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0F172A]">Industry</label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="mt-1.5 w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-[#020617] focus:ring-2 focus:ring-[#10B981] focus:outline-none"
                >
                  <option>E-Commerce / Retail</option>
                  <option>Professional Services & Consulting</option>
                  <option>Beauty, Spa & Wellness</option>
                  <option>Real Estate & Property Management</option>
                  <option>Hospitality & Travel</option>
                  <option>Healthcare & Clinics</option>
                  <option>Other Services</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0F172A]">
                  Business Overview (Optional)
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1.5 w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-[#020617] focus:ring-2 focus:ring-[#10B981] focus:outline-none"
                  placeholder="Briefly describe what your business offers so your AI Agent learns faster."
                ></textarea>
              </div>

              <button
                type="button"
                disabled={!businessName.trim()}
                onClick={() => setStep(2)}
                className="w-full py-3 px-4 rounded-lg text-sm font-semibold text-white bg-[#10B981] hover:bg-[#059669] transition-all disabled:opacity-50"
              >
                Continue to Currency & Region
              </button>
            </div>
          )}

          {/* STEP 2: Currency & Timezone */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-[#0F172A]">Currency & Region Settings</h2>
                <p className="text-xs text-[#64748B]">
                  Your AI will quote prices and generate payment links using this currency.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0F172A]">
                  Business Currency (ISO 4217) *
                </label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {CURRENCIES.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => setCurrency(c.code)}
                      className={`p-3.5 rounded-lg border text-left flex items-center justify-between transition-all ${
                        currency === c.code
                          ? 'border-[#10B981] bg-emerald-50/50 ring-2 ring-[#10B981]'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <span className="text-sm font-bold text-[#0F172A] block">{c.code}</span>
                        <span className="text-xs text-[#64748B]">{c.name}</span>
                      </div>
                      <span className="text-lg font-bold text-[#10B981]">{c.symbol}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0F172A]">Timezone *</label>
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

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 py-3 px-4 rounded-lg text-sm font-semibold text-[#0F172A] bg-slate-100 hover:bg-slate-200 transition-all"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="w-2/3 py-3 px-4 rounded-lg text-sm font-semibold text-white bg-[#10B981] hover:bg-[#059669] transition-all"
                >
                  Continue to Contact Details
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Contact & WhatsApp Channel */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-[#0F172A]">Customer Communication Contact</h2>
                <p className="text-xs text-[#64748B]">
                  Enter your official WhatsApp Business contact details.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0F172A]">
                  WhatsApp Business Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1.5 w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-[#020617] focus:ring-2 focus:ring-[#10B981] focus:outline-none"
                  placeholder="+234 800 000 0000"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0F172A]">
                  Business Contact Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5 w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-[#020617] focus:ring-2 focus:ring-[#10B981] focus:outline-none"
                  placeholder="contact@business.com"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-1/3 py-3 px-4 rounded-lg text-sm font-semibold text-[#0F172A] bg-slate-100 hover:bg-slate-200 transition-all"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="w-2/3 py-3 px-4 rounded-lg text-sm font-semibold text-white bg-[#10B981] hover:bg-[#059669] transition-all"
                >
                  Continue to Team Invites
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Invite Team */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-[#0F172A]">Invite Team Members</h2>
                <p className="text-xs text-[#64748B]">
                  Add human agents who will take over conversations when escalated.
                </p>
              </div>

              <div className="flex gap-2">
                <input
                  type="email"
                  value={teamEmail}
                  onChange={(e) => setTeamEmail(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-[#020617] focus:ring-2 focus:ring-[#10B981] focus:outline-none"
                  placeholder="colleague@business.com"
                />
                <select
                  value={teamRole}
                  onChange={(e) => setTeamRole(e.target.value as 'ADMIN' | 'AGENT')}
                  className="px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-[#020617]"
                >
                  <option value="AGENT">AGENT</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddMember}
                  className="px-4 py-2.5 rounded-lg bg-[#0F172A] hover:bg-slate-800 text-white font-semibold text-xs"
                >
                  Add
                </button>
              </div>

              {invitedMembers.length > 0 && (
                <div className="space-y-2">
                  {invitedMembers.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs"
                    >
                      <span className="font-medium text-[#0F172A]">{m.email}</span>
                      <span className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-600 font-semibold">
                        {m.role}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="w-1/3 py-3 px-4 rounded-lg text-sm font-semibold text-[#0F172A] bg-slate-100 hover:bg-slate-200 transition-all"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleFinishOnboarding}
                  className="w-2/3 py-3 px-4 rounded-lg text-sm font-semibold text-white bg-[#10B981] hover:bg-[#059669] shadow-sm transition-all disabled:opacity-50"
                >
                  {loading ? 'Launching Dashboard...' : 'Complete Business Setup'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
