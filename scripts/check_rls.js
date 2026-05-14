const pg = require('pg');
async function run() {
    const c = new pg.Client({
        connectionString: 'postgresql://postgres.kcutjutbekiyrdhxsusz:teomotospassword_@aws-1-us-west-1.pooler.supabase.com:6543/postgres',
        ssl: { rejectUnauthorized: false }
    });
    await c.connect();
    
    // Check RLS policies
    const r = await c.query("SELECT tablename, policyname, cmd, permissive, roles, qual FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, policyname");
    console.log('=== RLS POLICIES ===');
    r.rows.forEach(p => console.log(`  ${p.tablename} | ${p.policyname} | cmd: ${p.cmd} | roles: ${p.roles}`));

    // Check motorcycles count
    const cnt = await c.query("SELECT COUNT(*) as c FROM motorcycles");
    console.log('\nMotorcycles in DB:', cnt.rows[0].c);

    await c.end();
}
run().catch(e => console.error(e.message));
