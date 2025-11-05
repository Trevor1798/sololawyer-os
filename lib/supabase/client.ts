import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const createClientSupabase = () => {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};

export const getSupabaseClient = (clerkUserId: string) => {
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        'x-clerk-user-id': clerkUserId,
      },
    },
  });
  
  // Set user context for RLS (fire-and-forget)
  void (async () => {
    try {
      await client.rpc('set_user_context', { clerk_user_id: clerkUserId });
    } catch {
      // Silent fail - RLS will handle auth
    }
  })();
  
  return client;
};

