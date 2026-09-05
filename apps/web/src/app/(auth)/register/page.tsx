'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    // If session is present immediately (e.g. email confirmation disabled in dev)
    if (data.session) {
      router.push('/onboarding');
      return;
    }

    // Email confirmation required state
    setRegisteredEmail(email);
    setLoading(false);
  };

  const handleResend = async () => {
    if (!registeredEmail) return;
    setResendStatus('Resending confirmation link...');
    const supabase = createClient();
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: registeredEmail,
    });
    if (error) {
      setResendStatus(`Error: ${error.message}`);
    } else {
      setResendStatus('Confirmation email resent! Please check your inbox.');
    }
  };

  const checkConfirmationStatus = async () => {
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      router.push('/onboarding');
    } else {
      setErrorMsg('Email not verified yet. Please click the link in your email first.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header Navigation */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-600 hover:text-[#0F172A] px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
        <span className="text-xs text-slate-400 font-medium">AutoAgent SaaS</span>
      </div>

      {/* Main Card */}
      <div className="my-auto sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#0F172A] flex items-center justify-center text-white font-extrabold text-xl mx-auto shadow-md mb-3">
            AA
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            {registeredEmail ? 'Verify Your Email' : 'Create Your Account'}
          </h1>
          <p className="mt-1.5 text-xs text-slate-500">
            {registeredEmail
              ? 'Please confirm your email address to continue to business setup.'
              : 'Set up your AutoAgent account in less than 2 minutes.'}
          </p>
        </div>

        <div className="bg-white py-8 px-6 sm:px-8 shadow-sm rounded-2xl border border-slate-200">
          {registeredEmail ? (
            /* EMAIL CONFIRMATION REQUIRED UI */
            <div className="text-center space-y-5">
              <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 text-[#10B981] rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                <Mail className="w-7 h-7" />
              </div>

              <div>
                <h2 className="text-base font-bold text-[#0F172A]">Check Your Inbox</h2>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  We've sent a verification link to:
                </p>
                <p className="text-sm font-bold text-[#10B981] mt-1 bg-emerald-50/60 py-1.5 px-3 rounded-lg border border-emerald-100 inline-block">
                  {registeredEmail}
                </p>
                <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                  Please click the link inside your email to verify your account, then click the button below.
                </p>
              </div>

              {resendStatus && (
                <div className="p-3 bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-xl">
                  {resendStatus}
                </div>
              )}

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700 rounded-xl flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-3 pt-2">
                <button
                  onClick={checkConfirmationStatus}
                  className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#10B981] hover:bg-[#059669] shadow-sm transition-all flex items-center justify-center space-x-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>I've Verified My Email — Continue</span>
                </button>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    onClick={handleResend}
                    className="text-slate-600 hover:text-[#0F172A] font-semibold flex items-center space-x-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                    <span>Resend Email</span>
                  </button>

                  <Link href="/login" className="text-[#10B981] font-semibold hover:underline">
                    Back to Sign In
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            /* REGISTER FORM */
            <>
              {errorMsg && (
                <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start space-x-2.5">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form className="space-y-5" onSubmit={handleRegister}>
                <div>
                  <label htmlFor="fullName" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all"
                      placeholder="Jane Doe"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Work Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all"
                      placeholder="jane@company.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all"
                      placeholder="At least 6 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#10B981] hover:bg-[#059669] shadow-sm transition-all disabled:opacity-50 mt-2"
                >
                  {loading ? 'Creating Account...' : 'Continue to Business Setup'}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-500">
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className="font-semibold text-[#10B981] hover:text-[#059669] transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-md w-full mx-auto text-center text-[11px] text-slate-400">
        © 2026 AutoAgent SaaS. All rights reserved.
      </div>
    </div>
  );
}
