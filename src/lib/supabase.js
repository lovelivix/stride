import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Friendly guard so a missing/placeholder .env fails loudly and clearly
// instead of throwing a cryptic error deep in the app.
export const supabaseConfigured =
  !!url && !!anonKey && url !== 'your_url_here' && anonKey !== 'your_anon_key_here';

if (!supabaseConfigured) {
  // eslint-disable-next-line no-console
  console.warn(
    '[STRIDE] Supabase is not configured. Copy .env.example to .env and add your ' +
      'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from Supabase → Project Settings → API.'
  );
}

export const supabase = createClient(
  supabaseConfigured ? url : 'https://placeholder.supabase.co',
  supabaseConfigured ? anonKey : 'placeholder-anon-key'
);
