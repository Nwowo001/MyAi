'use client';

import Link from 'next/link';
import { useBusinessStore } from '@/stores/useBusinessStore';
import {
  Package,
  Calendar,
  Users,
  MessageSquare,
  TrendingUp,
  ArrowRight,
  Plus,
  Zap,
} from 'lucide-react';

export default function DashboardPage() {
  const activeBusiness = useBusinessStore((s) => s.activeBusiness);
  const formatCurrency = useBusinessStore((s) => s.formatCurrency);

  const businessName = activeBusiness?.name || 'Your Business';
  const currencyCode = activeBusiness?.currency || 'NGN';

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30 text-xs font-medium mb-3">
            <Zap className="w-3.5 h-3.5" />
            <span>AutoAgent Active 24/7</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome back, {businessName}
          </h1>
          <p className="mt-1 text-slate-300 text-sm max-w-xl">
            Your AI assistant is ready to respond to customer inquiries, handle bookings, and issue payment links.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/catalog"
            className="px-4 py-2.5 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white text-sm font-medium transition-colors shadow-sm inline-flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Offering</span>
          </Link>
          <Link
            href="/settings"
            className="px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/10 text-sm font-medium transition-colors"
          >
            Agent Settings
          </Link>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
              Catalog Items
            </span>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-[#10B981] flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <p className="text-2xl font-bold text-[#0F172A]">--</p>
            <Link href="/catalog" className="text-xs font-medium text-[#10B981] hover:underline flex items-center gap-1">
              Manage <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
              Total Customers
            </span>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <p className="text-2xl font-bold text-[#0F172A]">--</p>
            <span className="text-xs text-[#64748B]">Active leads</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
              Conversations
            </span>
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <p className="text-2xl font-bold text-[#0F172A]">--</p>
            <span className="text-xs text-[#64748B]">WhatsApp</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
              Bookings
            </span>
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <p className="text-2xl font-bold text-[#0F172A]">--</p>
            <span className="text-xs text-[#64748B]">Confirmed</span>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-base font-bold text-[#0F172A] mb-4">Quick Navigation</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/catalog"
            className="p-4 rounded-lg border border-slate-200 hover:border-[#10B981] hover:bg-slate-50 transition-all flex items-start space-x-3 group"
          >
            <div className="p-2 rounded-md bg-emerald-50 text-[#10B981] group-hover:bg-[#10B981] group-hover:text-white transition-colors">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A] group-hover:text-[#10B981] transition-colors">
                Catalog Management
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Create and manage products, services, pricing, and stock.
              </p>
            </div>
          </Link>

          <Link
            href="/settings"
            className="p-4 rounded-lg border border-slate-200 hover:border-[#10B981] hover:bg-slate-50 transition-all flex items-start space-x-3 group"
          >
            <div className="p-2 rounded-md bg-slate-100 text-[#0F172A] group-hover:bg-[#0F172A] group-hover:text-white transition-colors">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A] group-hover:text-[#10B981] transition-colors">
                Agent Configuration
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Set system instructions, business hours, and auto-reply rules.
              </p>
            </div>
          </Link>

          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 opacity-60 flex items-start space-x-3">
            <div className="p-2 rounded-md bg-slate-200 text-[#64748B]">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A]">
                Analytics & Revenue (Phase 7)
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Track payments, conversion rates, and revenue performance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
