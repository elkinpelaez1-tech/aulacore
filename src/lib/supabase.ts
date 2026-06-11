import { createBrowserClient } from '@supabase/ssr';

const getClient = () => {
  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/^['"]|['"]$/g, '');
  const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').replace(/^['"]|['"]$/g, '');

  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window !== 'undefined') {
      console.warn(
        'Supabase: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing in your environment configuration.'
      );
    }
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};

let client: any = null;

// Export a lazy proxy to avoid SSR singleton issues and guarantee correct browser initialization
export const supabase = new Proxy({} as any, {
  get(target, prop) {
    if (!client) {
      client = getClient();
    }
    const value = Reflect.get(client, prop);
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  }
});


