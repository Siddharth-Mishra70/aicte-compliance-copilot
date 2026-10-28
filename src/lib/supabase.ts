import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  supabaseAnonKey.length > 10 &&
  !supabaseUrl.includes('your-project')
);

let supabaseInstance: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  try {
    supabaseInstance = createClient(supabaseUrl!, supabaseAnonKey!);
  } catch (error) {
    console.warn('[Supabase] Failed to initialize client:', error);
    supabaseInstance = null;
  }
} else {
  if (process.env.NODE_ENV === 'development') {
    console.info(
      '[Supabase] Supabase credentials not found or placeholder values used. Running in local mock/offline state mode.'
    );
  }
}

/**
 * Supabase client instance. Returns `null` if credentials are not configured.
 * This ensures the client-side app does not throw unhandled initialization exceptions.
 */
export const supabase = supabaseInstance;

