const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://litzlvhlmaqcgszkwbdz.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpdHpsdmhsbWFxY2dzemt3YmR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NDAxNTUsImV4cCI6MjA4NjQxNjE1NX0.Lb-By7p3VMSJT_ve_estqAiieTXOZpr7k99YR3SZwTk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectStore() {
    console.log("Checking store 'teomotos'...");

    const { data: bySlug, error } = await supabase
        .from('stores')
        .select('*')
        .eq('slug', 'teomotos')
        .maybeSingle();

    if (error) {
        console.error("Error fetching store:", error);
        return;
    }

    if (bySlug) {
        console.log("Store found:");
        console.log(`ID: ${bySlug.id}`);
        console.log(`Slug: ${bySlug.slug}`);
        console.log(`Owner ID: ${bySlug.owner_id}`);
        console.log(`Email: ${bySlug.email}`);
        console.log(`Created At: ${bySlug.created_at}`);
    } else {
        console.log("Store 'teomotos' NOT found.");
    }
}

inspectStore();
