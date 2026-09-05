'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
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

    // Redirect to multi-step onboarding
    router.push('/onboarding');
  };

  return (
    <div className="min-h-screen bg-white text-[#020617] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-xl bg-[#0F172A] flex items-center justify-center text-white font-extrabold text-xl mx-auto shadow-md">
          AA
        </div>
        <h2 className="mt-6 text-3xl font-extrabold text-[#0F172A] tracking-tight">
          Create your AutoAgent account
        </h2>
        <p className="mt-2 text-sm text-[#64748B]">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-semibold text-[#10B981] hover:text-[#059669] transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#F8FAFC] py-8 px-6 shadow-sm rounded-xl border border-slate-200 sm:px-10">
          {errorMsg && (
            <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {errorMsg}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleRegister}>
            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold text-[#0F172A]">
                Full Name
              </label>
              <div className="mt-1.5">
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-[#020617] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[#0F172A]">
                Work Email address
              </label>
              <div className="mt-1.5">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-[#020617] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all"
                  placeholder="john@company.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-[#0F172A]">
                Password
              </label>
              <div className="mt-1.5">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-[#020617] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all"
                  placeholder="At least 6 characters"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-lg text-sm font-semibold text-white bg-[#10B981] hover:bg-[#059669] shadow-sm transition-all disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Continue to Business Setup'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
