'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white text-[#020617]">
      {/* Responsive Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-[#0F172A] flex items-center justify-center text-white font-bold text-lg shadow-sm">
                AA
              </div>
              <span className="text-xl font-bold tracking-tight text-[#0F172A]">
                AutoAgent
              </span>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-[#64748B]">
              <a href="#features" className="hover:text-[#0F172A] transition-colors">
                Features
              </a>
              <a href="#architecture" className="hover:text-[#0F172A] transition-colors">
                Architecture
              </a>
              <a href="#channels" className="hover:text-[#0F172A] transition-colors">
                Channels
              </a>
              <a href="#pricing" className="hover:text-[#0F172A] transition-colors">
                Solutions
              </a>
            </nav>

            {/* Desktop Action Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-semibold text-[#0F172A] hover:text-[#64748B] transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-5 py-2 text-sm font-semibold rounded-lg bg-[#10B981] hover:bg-[#059669] text-white transition-all shadow-sm"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Toggle Button */}
            <div className="flex md:hidden items-center">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-[#0F172A] hover:bg-slate-100 transition-colors focus:outline-none"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-4">
            <nav className="flex flex-col space-y-3 text-base font-medium text-[#64748B]">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md hover:bg-slate-50 hover:text-[#0F172A] transition-colors"
              >
                Features
              </a>
              <a
                href="#architecture"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md hover:bg-slate-50 hover:text-[#0F172A] transition-colors"
              >
                Architecture
              </a>
              <a
                href="#channels"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md hover:bg-slate-50 hover:text-[#0F172A] transition-colors"
              >
                Channels
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md hover:bg-slate-50 hover:text-[#0F172A] transition-colors"
              >
                Solutions
              </a>
            </nav>

            <div className="pt-4 border-t border-slate-100 flex flex-col space-y-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-semibold text-[#0F172A] bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-semibold text-white bg-[#10B981] hover:bg-[#059669] rounded-lg transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-16 text-center">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#F8FAFC] border border-slate-200 text-[#0F172A] text-xs font-semibold uppercase tracking-wider mb-6">
            <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
            <span>Autonomous AI Business Agent</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#0F172A] max-w-4xl mx-auto leading-tight">
            Turn WhatsApp & Customer Messaging Into Automated Revenue
          </h1>

          <p className="mt-6 text-base sm:text-lg md:text-xl text-[#64748B] max-w-2xl mx-auto leading-relaxed">
            Qualify leads, share offerings, issue quotes, process bookings, generate Paystack payment links, and verify payments automatically 24/7.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto sm:max-w-none">
            <Link
              href="/register"
              className="w-full sm:w-auto px-7 py-3.5 text-base font-semibold rounded-lg bg-[#10B981] hover:bg-[#059669] text-white shadow-md transition-all text-center"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-7 py-3.5 text-base font-semibold rounded-lg bg-[#F8FAFC] hover:bg-slate-100 text-[#0F172A] border border-slate-300 transition-all text-center"
            >
              Sign In
            </Link>
          </div>
        </section>

        {/* Feature Cards Section */}
        <section id="features" className="py-16 bg-[#F8FAFC] border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">
                Built for High-Performing Business Operations
              </h2>
              <p className="mt-3 text-sm sm:text-base text-[#64748B]">
                Engineered with multi-tenant security, custom business hours, and controlled tool execution.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm hover:border-[#10B981] transition-colors">
                <div className="w-12 h-12 rounded-lg bg-[#F8FAFC] border border-slate-200 flex items-center justify-center text-[#10B981] font-bold text-xl mb-5">
                  💬
                </div>
                <h3 className="text-xl font-bold text-[#0F172A]">WhatsApp MVP First</h3>
                <p className="mt-3 text-sm text-[#64748B] leading-relaxed">
                  Channel-agnostic normalized message adapter starting with Meta WhatsApp Business Cloud API.
                </p>
              </div>

              <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm hover:border-[#10B981] transition-colors">
                <div className="w-12 h-12 rounded-lg bg-[#F8FAFC] border border-slate-200 flex items-center justify-center text-[#059669] font-bold text-xl mb-5">
                  🧠
                </div>
                <h3 className="text-xl font-bold text-[#0F172A]">AI Provider Abstraction</h3>
                <p className="mt-3 text-sm text-[#64748B] leading-relaxed">
                  OpenAI GPT-4o by default with pluggable support for Anthropic Claude and Google Gemini models.
                </p>
              </div>

              <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm hover:border-[#10B981] transition-colors">
                <div className="w-12 h-12 rounded-lg bg-[#F8FAFC] border border-slate-200 flex items-center justify-center text-[#10B981] font-bold text-xl mb-5">
                  💳
                </div>
                <h3 className="text-xl font-bold text-[#0F172A]">Products & Services</h3>
                <p className="mt-3 text-sm text-[#64748B] leading-relaxed">
                  Support for both products and services, configurable currency (default NGN), and Paystack links.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Enterprise Banner */}
        <section className="py-16 bg-[#0F172A] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div className="max-w-2xl">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Seamless Human Agent Handover
              </h2>
              <p className="mt-3 text-slate-300 text-sm md:text-base leading-relaxed">
                When complex inquiries or escalation requests occur, AutoAgent smoothly hands over the conversation to your human sales or support staff in real time.
              </p>
            </div>
            <div>
              <Link
                href="/onboarding"
                className="px-6 py-3.5 text-sm font-semibold rounded-lg bg-[#10B981] hover:bg-[#059669] text-white transition-all shadow-md inline-block w-full sm:w-auto"
              >
                Configure Your Agent
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center text-xs text-[#64748B] gap-4">
          <p>© 2026 AutoAgent SaaS Platform. All rights reserved.</p>
          <div className="flex space-x-6 font-medium">
            <a href="/docs/ARCHITECTURE.md" className="hover:text-[#0F172A]">
              Architecture Docs
            </a>
            <a href="/docs/API.md" className="hover:text-[#0F172A]">
              API Reference
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
