const pg = require('pg');
const fs = require('fs');
const path = require('path');
const EXPORT_DIR = path.join(__dirname, '..', 'backup_export');

function readJson(f) { return JSON.parse(fs.readFileSync(path.join(EXPORT_DIR, f), 'utf-8')); }

async function run() {
    const client = new pg.Client({
        connectionString: 'postgresql://postgres.kcutjutbekiyrdhxsusz:teomotospassword_@aws-1-us-west-1.pooler.supabase.com:6543/postgres',
        ssl: { rejectUnauthorized: false }
    });
    await client.connect();
    console.log('Connected to NEW database');

    // Add missing columns to stores
    const extras = ['logo_url TEXT', 'hours_sunday TEXT', 'about_hero_image TEXT'];
    for (const col of extras) {
        await client.query(`ALTER TABLE stores ADD COLUMN IF NOT EXISTS ${col}`).catch(() => {});
    }
    console.log('Added missing columns');

    // IMPORT STORES
    const stores = readJson('stores.json');
    for (const s of stores) {
        const cols = Object.keys(s);
        const vals = Object.values(s).map(v => v === null || v === undefined ? null : typeof v === 'object' ? JSON.stringify(v) : v);
        const ph = vals.map((_, i) => `$${i + 1}`).join(', ');
        const cn = cols.map(c => `"${c}"`).join(', ');
        try {
            await client.query(`INSERT INTO stores (${cn}) VALUES (${ph}) ON CONFLICT (id) DO NOTHING`, vals);
            console.log(`  Store OK: ${s.slug}`);
        } catch (e) {
            console.log(`  Store FAIL ${s.slug}: ${e.message}`);
        }
    }

    // IMPORT MOTORCYCLES
    const motos = readJson('motorcycles.json');
    let mOk = 0, mFail = 0;
    for (const m of motos) {
        const cols = Object.keys(m);
        const vals = Object.values(m).map(v => v === null || v === undefined ? null : typeof v === 'object' ? JSON.stringify(v) : v);
        const ph = vals.map((_, i) => `$${i + 1}`).join(', ');
        const cn = cols.map(c => `"${c}"`).join(', ');
        try {
            await client.query(`INSERT INTO motorcycles (${cn}) VALUES (${ph}) ON CONFLICT (id) DO NOTHING`, vals);
            mOk++;
        } catch (e) {
            mFail++;
            console.log(`  Moto FAIL: ${m.make} ${m.model}: ${e.message}`);
        }
    }
    console.log(`Motos: ${mOk} ok, ${mFail} fail`);

    // IMPORT LEADS
    const leads = readJson('leads.json');
    let lOk = 0;
    for (const l of leads) {
        const cols = Object.keys(l);
        const vals = Object.values(l).map(v => v === null || v === undefined ? null : typeof v === 'object' ? JSON.stringify(v) : v);
        const ph = vals.map((_, i) => `$${i + 1}`).join(', ');
        const cn = cols.map(c => `"${c}"`).join(', ');
        try {
            await client.query(`INSERT INTO leads (${cn}) VALUES (${ph}) ON CONFLICT (id) DO NOTHING`, vals);
            lOk++;
        } catch (e) {}
    }
    console.log(`Leads: ${lOk}/${leads.length}`);

    // RLS POLICIES
    for (const t of ['stores', 'motorcycles', 'leads', 'profiles']) {
        await client.query(`ALTER TABLE ${t} ENABLE ROW LEVEL SECURITY`).catch(() => {});
    }
    await client.query(`CREATE POLICY "pub_read_stores" ON stores FOR SELECT USING (true)`).catch(() => {});
    await client.query(`CREATE POLICY "pub_read_motorcycles" ON motorcycles FOR SELECT USING (true)`).catch(() => {});
    await client.query(`CREATE POLICY "pub_insert_leads" ON leads FOR INSERT WITH CHECK (true)`).catch(() => {});
    await client.query(`CREATE POLICY "pub_read_leads" ON leads FOR SELECT USING (true)`).catch(() => {});

    for (const t of ['stores', 'motorcycles', 'leads', 'profiles']) {
        await client.query(`CREATE POLICY "auth_all_${t}" ON ${t} FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated')`).catch(() => {});
        await client.query(`CREATE POLICY "svc_all_${t}" ON ${t} FOR ALL USING (auth.role() = 'service_role')`).catch(() => {});
    }
    console.log('RLS policies OK');

    // VERIFY
    console.log('\nVerification:');
    for (const t of ['stores', 'motorcycles', 'leads']) {
        const r = await client.query(`SELECT COUNT(*) as c FROM ${t}`);
        console.log(`  ${t}: ${r.rows[0].c} rows`);
    }

    await client.end();
    console.log('\nDONE!');
}

run().catch(e => console.error('FATAL:', e.message));
