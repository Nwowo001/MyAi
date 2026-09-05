import { createBrowserClient } from '@supabase/ssr';

const SUPABASE_URL =
  process.env['NEXT_PUBLIC_SUPABASE_URL'] || 'https://mawvsjvarlfyxrmhgwvj.supabase.co';

const SUPABASE_ANON_KEY =
  process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hd3ZzanZhcmxmeXhybWhnd3ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2MjIwMzEsImV4cCI6MjEwNDE5ODAzMX0.HvmAM4MtARRWI8qgsEjqNkNadgQuHiosmGWFvZpYybo';

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
