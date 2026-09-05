import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

const SUPABASE_URL =
  process.env['NEXT_PUBLIC_SUPABASE_URL'] || 'https://mawvsjvarlfyxrmhgwvj.supabase.co';

const SUPABASE_ANON_KEY =
  process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hd3ZzanZhcmxmeXhybWhnd3ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2MjIwMzEsImV4cCI6MjEwNDE5ODAzMX0.HvmAM4MtARRWI8qgsEjqNkNadgQuHiosmGWFvZpYybo';

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // The `set` method was called from a Server Component.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options });
        } catch {
          // The `remove` method was called from a Server Component.
        }
      },
    },
  });
}
