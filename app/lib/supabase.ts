import { createClient } from '@supabase/supabase-js';

let supabaseInstance: any;

const getSupabaseClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseInstance) {
    // If we're at build time and variables are missing, use placeholders to prevent crash.
    // At runtime, if variables are missing, createClient will throw a more helpful error.
    supabaseInstance = createClient(
      url || 'https://placeholder.supabase.co',
      key || 'placeholder'
    );
  }
  return supabaseInstance;
};

export const supabase = new Proxy({} as any, {
  get(target, prop) {
    const client = getSupabaseClient();
    return (client as any)[prop];
  },
});
