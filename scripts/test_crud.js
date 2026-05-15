const { createClient } = require('@supabase/supabase-js');
const pg = require('pg');

async function run() {
    // 1. Test via direct Postgres (bypasses RLS) - should always work
    const c = new pg.Client({
        connectionString: 'postgresql://postgres.kcutjutbekiyrdhxsusz:teomotospassword_@aws-1-us-west-1.pooler.supabase.com:6543/postgres',
        ssl: { rejectUnauthorized: false }
    });
    await c.connect();

    // Check current motos
    const motos = await c.query("SELECT id, make, model FROM motorcycles ORDER BY created_at LIMIT 5");
    console.log('=== Current motos (first 5) ===');
    motos.rows.forEach(m => console.log(`  ${m.id} | ${m.make} ${m.model}`));

    // Check RLS policies for motorcycles
    const policies = await c.query("SELECT policyname, cmd, roles, qual, with_check FROM pg_policies WHERE tablename = 'motorcycles'");
    console.log('\n=== Motorcycles RLS policies ===');
    policies.rows.forEach(p => console.log(`  ${p.policyname} | cmd: ${p.cmd} | roles: ${p.roles} | qual: ${p.qual}`));

    // 2. Test via Supabase client as authenticated user
    console.log('\n=== Testing via Supabase JS client ===');
    const supabase = createClient(
        'https://kcutjutbekiyrdhxsusz.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjdXRqdXRiZWtpeXJkaHhzdXN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyODU2NTAsImV4cCI6MjA5Mzg2MTY1MH0.8Kf1RVAcTofJIcurUugImpRZSl37aQ5ObDxQU0UokWw'
    );

    // Login as admin
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'teomotos@gmail.com',
        password: 'teomotospassword_'
    });
    
    if (authError) {
        console.log('Auth FAILED:', authError.message);
        // Try with service_role key
        console.log('\n=== Testing with service_role key ===');
        const svc = createClient(
            'https://kcutjutbekiyrdhxsusz.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjdXRqdXRiZWtpeXJkaHhzdXN6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODI4NTY1MCwiZXhwIjoyMDkzODYxNjUwfQ.1PZWmZXFV37QZdyEuRWGOwESdhD0QNG5cOGMaSrMWCg'
        );
        // Try reading
        const { data: svcData, error: svcError } = await svc.from('motorcycles').select('id, make, model').limit(2);
        console.log('Service role read:', svcError ? svcError.message : `${svcData.length} motos OK`);
    } else {
        console.log('Auth OK, user:', authData.user.email);
        console.log('Session role:', authData.session.access_token ? 'has token' : 'NO TOKEN');
        
        // Test SELECT
        const { data: readData, error: readErr } = await supabase.from('motorcycles').select('id, make, model').limit(2);
        console.log('\nSELECT test:', readErr ? `FAIL: ${readErr.message}` : `OK - ${readData.length} motos`);

        // Test UPDATE (just set same value)
        if (readData && readData.length > 0) {
            const testId = readData[0].id;
            const { data: upData, error: upErr } = await supabase
                .from('motorcycles')
                .update({ make: readData[0].make })
                .eq('id', testId)
                .select();
            console.log('UPDATE test:', upErr ? `FAIL: ${upErr.message}` : `OK - ${upData.length} rows affected`);

            // Test DELETE (on a specific test moto - let's NOT actually delete, just check permission)
            // We'll try to delete a non-existent ID to test the permission
            const { data: delData, error: delErr } = await supabase
                .from('motorcycles')
                .delete()
                .eq('id', '00000000-0000-0000-0000-000000000000')
                .select();
            console.log('DELETE permission test:', delErr ? `FAIL: ${delErr.message}` : 'OK (no RLS error)');
        }
    }

    await c.end();
    console.log('\nDone');
}

run().catch(e => console.error('FATAL:', e.message));
