const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://litzlvhlmaqcgszkwbdz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpdHpsdmhsbWFxY2dzemt3YmR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NDAxNTUsImV4cCI6MjA4NjQxNjE1NX0.Lb-By7p3VMSJT_ve_estqAiieTXOZpr7k99YR3SZwTk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuthConnection() {
    console.log("Testing connection to Supabase Auth...");

    // Try to sign in with a fake user to see if we reach the server
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'test_connectivity@example.com',
        password: 'wrong_password_123'
    });

    if (error) {
        console.log("Connection result:", error.message);
        if (error.message.includes('Invalid login credentials')) {
            console.log("✅ SUCCESS: Connected to Supabase Auth (Invalid credentials as expected).");
            console.log("Backend connectivity is working.");
        } else {
            console.error("❌ FAILURE: Could not connect or other error:", error);
        }
    } else {
        console.log("Unexpected success (should not happen with fake user).");
    }
}

testAuthConnection();
