const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://litzlvhlmaqcgszkwbdz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpdHpsdmhsbWFxY2dzemt3YmR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NDAxNTUsImV4cCI6MjA4NjQxNjE1NX0.Lb-By7p3VMSJT_ve_estqAiieTXOZpr7k99YR3SZwTk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function finalTest() {
    console.log("=== Final Persistence Test ===\n");

    // 1. List all stores
    const { data: stores, error: listError } = await supabase
        .from('stores')
        .select('slug, name');

    if (listError) {
        console.error("Error listing stores:", listError);
        return;
    }

    console.log("Available stores:");
    stores.forEach(s => console.log(`  - ${s.slug} (${s.name})`));
    console.log("");

    if (stores.length === 0) {
        console.log("No stores found in database.");
        return;
    }

    // 2. Test update on the first store
    const testSlug = stores[0].slug;
    const testValue = 'MIGRATION SUCCESS ' + new Date().toISOString();

    console.log(`Testing update on store: ${testSlug}`);
    console.log(`Setting contact_subtitle to: "${testValue}"\n`);

    const { data, error } = await supabase
        .from('stores')
        .update({ contact_subtitle: testValue })
        .eq('slug', testSlug)
        .select();

    if (error) {
        console.error("❌ Update failed:", error);
        return;
    }

    console.log("✅ Update successful!");
    console.log("Returned data:", data);

    // 3. Verify by reading it back
    const { data: verifyData } = await supabase
        .from('stores')
        .select('contact_subtitle')
        .eq('slug', testSlug)
        .single();

    if (verifyData.contact_subtitle === testValue) {
        console.log("\n🎉 VERIFICATION PASSED! Database is fully functional.");
        console.log("The Live Editor will now be able to save changes successfully.");
    } else {
        console.error("\n❌ Verification failed: Data mismatch!");
    }
}

finalTest();
