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
    storageKey: 'buzztate-auth',
    // Don't auto-detect session on init — we'll call getSession() explicitly
    // This prevents the stale token retry loop from blocking page load
    detectSessionInUrl: true,
  },
  global: {
    fetch: (url, options) => {
      // 5-second timeout for token refresh to prevent infinite retry loops
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
