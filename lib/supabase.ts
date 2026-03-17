import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl.startsWith('http')) {
    console.warn(
        '[Supabase] NEXT_PUBLIC_SUPABASE_URL is missing or invalid. ' +
        'Database features will be disabled. Check your .env.local file.'
    );
}

// Browser-side singleton client
// Returns null only if env vars are genuinely missing (dev/build time safety)
export const supabase = supabaseUrl.startsWith('http')
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
        },
    })
    : null;
