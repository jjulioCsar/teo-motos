const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStore() {
    const { data: store, error } = await supabase
        .from('stores')
        .select('*')
        .eq('slug', 'teomotos')
        .single();

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Store Data:', JSON.stringify(store, null, 2));
    }
}

checkStore();
