import { createClient } from '@supabase/supabase-js';

// Defense against invalid URLs that crash the server on initialization
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Only create the client if the URL is valid, otherwise export a dummy/null
// to avoid "Invalid URL" crash on top-level module load.
export const supabase = (supabaseUrl.startsWith('http'))
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;
