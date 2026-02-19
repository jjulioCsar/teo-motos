const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
    console.log('Testing Supabase Client...');
    const userId = '6fe0014a-2fb9-471c-994a-aca36f97b78e'; // The user ID we found

    const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('owner_id', userId)
        .single();

    if (error) {
        console.error('Supabase Error:', error);
    } else {
        console.log('Supabase Data:', data);
    }
}

run();
