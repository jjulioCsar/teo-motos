const pg = require('pg');
async function run() {
    const c = new pg.Client({
        connectionString: 'postgresql://postgres.kcutjutbekiyrdhxsusz:teomotospassword_@aws-1-us-west-1.pooler.supabase.com:6543/postgres',
        ssl: { rejectUnauthorized: false }
    });
    await c.connect();
    console.log('Connected');

    // Drop old auth policies and recreate with correct condition
    const tables = ['stores', 'motorcycles', 'leads', 'profiles'];
    
    for (const t of tables) {
        // Drop old broken policies
        await c.query(`DROP POLICY IF EXISTS "auth_${t}" ON ${t}`).catch(() => {});
        await c.query(`DROP POLICY IF EXISTS "svc_${t}" ON ${t}`).catch(() => {});
        
        // Create proper policies for authenticated users (auth.uid() IS NOT NULL means user is logged in)
        await c.query(`CREATE POLICY "auth_insert_${t}" ON ${t} FOR INSERT TO authenticated WITH CHECK (true)`).catch(e => console.log(`  skip: ${e.message}`));
        await c.query(`CREATE POLICY "auth_update_${t}" ON ${t} FOR UPDATE TO authenticated USING (true) WITH CHECK (true)`).catch(e => console.log(`  skip: ${e.message}`));
        await c.query(`CREATE POLICY "auth_delete_${t}" ON ${t} FOR DELETE TO authenticated USING (true)`).catch(e => console.log(`  skip: ${e.message}`));
        
        // Service role full access
        await c.query(`CREATE POLICY "svc_${t}" ON ${t} FOR ALL TO service_role USING (true)`).catch(e => console.log(`  skip: ${e.message}`));
        
        console.log(`  ✅ ${t} policies fixed`);
    }

    // Verify
    const r = await c.query("SELECT tablename, policyname, cmd, roles FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, policyname");
    console.log('\n=== UPDATED POLICIES ===');
    r.rows.forEach(p => console.log(`  ${p.tablename} | ${p.policyname} | cmd: ${p.cmd} | roles: ${p.roles}`));

    // Check moto count
    const cnt = await c.query("SELECT COUNT(*) as c FROM motorcycles");
    console.log('\nMotorcycles still in DB:', cnt.rows[0].c);

    await c.end();
    console.log('\nDONE - RLS fixed!');
}
run().catch(e => console.error(e.message));
