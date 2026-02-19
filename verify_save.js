const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://litzlvhlmaqcgszkwbdz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpdHpsdmhsbWFxY2dzemt3YmR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NDAxNTUsImV4cCI6MjA4NjQxNjE1NX0.Lb-By7p3VMSJT_ve_estqAiieTXOZpr7k99YR3SZwTk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifySave() {
    console.log("--- Supabase Persistence Test ---");
    const testSlug = 'dreammotos';
    const testSubtitle = 'Teste de Persistência ' + new Date().toISOString();

    console.log(`Setting contact_subtitle to: "${testSubtitle}" for slug: "${testSlug}"`);

    const { data, error } = await supabase
        .from('stores')
        .update({ contact_subtitle: testSubtitle })
        .eq('slug', testSlug)
        .select();

    if (error) {
        console.error("Error updating record:", error);
        return;
    }

    if (data && data.length > 0) {
        console.log("Success! Data persisted correctly.");
        console.log("Updated record:", data[0].contact_subtitle);

        // Final check: fetch it back
        const { data: verifyData } = await supabase
            .from('stores')
            .select('contact_subtitle')
            .eq('slug', testSlug)
            .single();

        if (verifyData.contact_subtitle === testSubtitle) {
            console.log("Verified: Database returned the correct updated value.");
        } else {
            console.error("Verification failed: Data mismatch!");
        }
    } else {
        console.warn("No data returned from update. Check if the slug exists.");
    }
}

verifySave();
