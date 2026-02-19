const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase env vars");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStore() {
    console.log("Checking for store with slug containing 'teo'...");
    const { data, error } = await supabase
        .from('stores')
        .select('name, slug, id, owner_id')
        .ilike('slug', '%teo%');

    if (error) {
        console.error("Error fetching stores:", error);
    } else {
        console.log("Matching stores:", JSON.stringify(data, null, 2));
    }
}

checkStore();
