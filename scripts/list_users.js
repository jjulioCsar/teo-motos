const pg = require('pg');

async function run() {
    const c = new pg.Client({
        connectionString: 'postgresql://postgres.kcutjutbekiyrdhxsusz:teomotospassword_@aws-1-us-west-1.pooler.supabase.com:6543/postgres',
        ssl: { rejectUnauthorized: false }
    });
    await c.connect();

    // List ALL auth users
    const users = await c.query("SELECT id, email, created_at FROM auth.users ORDER BY created_at");
    console.log('=== ALL AUTH USERS ===');
    users.rows.forEach(u => console.log(`  ${u.id} | ${u.email} | ${u.created_at}`));

    // List ALL profiles
    const profiles = await c.query("SELECT id, role, store_id FROM profiles");
    console.log('\n=== ALL PROFILES ===');
    profiles.rows.forEach(p => console.log(`  ${p.id} | role: ${p.role} | store: ${p.store_id}`));

    await c.end();
}
run().catch(e => console.error(e.message));
