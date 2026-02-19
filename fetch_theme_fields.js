const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchFields() {
    const { data: store, error } = await supabase
        .from('stores')
        .select('name, logo_url, primary_color, secondary_color, tertiary_color, hero_title, hero_subtitle, hero_image')
        .eq('slug', 'teomotos')
        .single();

    if (error) {
        console.error('Error:', error);
    } else {
        console.log(JSON.stringify(store, null, 2));
    }
}

fetchFields();
