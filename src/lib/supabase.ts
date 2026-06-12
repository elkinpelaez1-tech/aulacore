import { createBrowserClient } from '@supabase/ssr';

const cleanEnvVar = (val: string | undefined) => {
  if (!val) return '';
  return val.replace(/^['"]|['"]$/g, '');
};

const supabaseUrl = cleanEnvVar(process.env.NEXT_PUBLIC_SUPABASE_URL);
const supabaseAnonKey = cleanEnvVar(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

if (!supabaseUrl || !supabaseAnonKey) {
  if (typeof window !== 'undefined') {
    console.warn(
      'Supabase: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing in your environment configuration.'
    );
  }
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);


