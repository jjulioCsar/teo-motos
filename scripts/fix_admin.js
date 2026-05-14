const pg = require('pg');

async function run() {
    const c = new pg.Client({
        connectionString: 'postgresql://postgres.kcutjutbekiyrdhxsusz:teomotospassword_@aws-1-us-west-1.pooler.supabase.com:6543/postgres',
        ssl: { rejectUnauthorized: false }
    });
    await c.connect();
    console.log('Connected');

    const NEW_USER_ID = '6d4b913d-f2a8-4183-bc86-6e68001e93d2';

    // 1. Update store owner_id
    await c.query("UPDATE stores SET owner_id = $1 WHERE slug = 'teomotos'", [NEW_USER_ID]);
    console.log('✅ Store owner_id updated to new user');

    // 2. Create profile for admin
    await c.query(
        "INSERT INTO profiles (id, role, store_id) VALUES ($1, 'admin', (SELECT id FROM stores WHERE slug = 'teomotos')) ON CONFLICT (id) DO UPDATE SET role = 'admin'",
        [NEW_USER_ID]
    );
    console.log('✅ Admin profile created');

    // Verify
    const store = await c.query("SELECT slug, owner_id FROM stores WHERE slug = 'teomotos'");
    console.log('\nStore:', store.rows[0]);
    const profile = await c.query("SELECT * FROM profiles WHERE id = $1", [NEW_USER_ID]);
    console.log('Profile:', profile.rows[0]);

    await c.end();
    console.log('\nDone!');
}
run().catch(e => console.error(e.message));
