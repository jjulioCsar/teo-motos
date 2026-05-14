const pg = require('pg');
const { createClient } = require('@supabase/supabase-js');

async function run() {
    // Check via Postgres
    const c = new pg.Client({
        connectionString: 'postgresql://postgres.kcutjutbekiyrdhxsusz:teomotospassword_@aws-1-us-west-1.pooler.supabase.com:6543/postgres',
        ssl: { rejectUnauthorized: false }
    });
    await c.connect();

    // 1. Check current owner_id on teomotos store
    const store = await c.query("SELECT id, slug, owner_id FROM stores WHERE slug = 'teomotos'");
    console.log('Store teomotos:', store.rows[0]);

    // 2. Get the new auth user(s)
    const users = await c.query("SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 5");
    console.log('\nAuth users:');
    users.rows.forEach(u => console.log(`  ${u.id} | ${u.email} | ${u.created_at}`));

    // 3. Check profiles table
    const profiles = await c.query("SELECT * FROM profiles");
    console.log('\nProfiles:', profiles.rows);

    // 4. Check what the delete function looks like
    const delCheck = await c.query("SELECT id, make, model, status FROM motorcycles LIMIT 5");
    console.log('\nSample motos:', delCheck.rows.map(m => `${m.make} ${m.model} (${m.status})`));

    await c.end();
    console.log('\nDone');
}
run().catch(e => console.error(e.message));
