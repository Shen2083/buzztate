import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase Environment Variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    // Limit retries so a stale token doesn't block page load
    storageKey: 'buzztate-auth',
  },
  global: {
    fetch: (url, options) => {
      // Short timeout for auth requests to prevent infinite hangs
      if (typeof url === 'string' && url.includes('token?grant_type=refresh')) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        return fetch(url, { ...options, signal: controller.signal }).finally(() =>
          clearTimeout(timeoutId)
        );
      }
      return fetch(url, options);
    },
  },
});