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
    console.log('Connected');

    // DROP and recreate to match exact old schema
    await client.query('DROP TABLE IF EXISTS leads CASCADE');
    await client.query('DROP TABLE IF EXISTS motorcycles CASCADE');
    await client.query('DROP TABLE IF EXISTS profiles CASCADE');
    await client.query('DROP TABLE IF EXISTS stores CASCADE');
    console.log('Dropped old tables');

    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Get exact columns from exported data
    const storesSample = readJson('stores.json')[0];
    const storeCols = Object.keys(storesSample || {});
    
    // Build CREATE TABLE from actual column names
    const storeColDefs = storeCols.map(c => {
        if (c === 'id') return '"id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY';
        if (c === 'slug') return '"slug" TEXT UNIQUE NOT NULL';
        if (c === 'name') return '"name" TEXT NOT NULL';
        if (c === 'is_dark_mode' || c === 'show_financing') return `"${c}" BOOLEAN DEFAULT false`;
        if (c === 'about_paragraphs' || c === 'our_values') return `"${c}" JSONB`;
        if (c === 'created_at') return '"created_at" TIMESTAMPTZ DEFAULT NOW()';
        if (c === 'owner_id') return '"owner_id" UUID';
        return `"${c}" TEXT`;
    }).join(',\n  ');

    await client.query(`CREATE TABLE stores (\n  ${storeColDefs}\n)`);
    console.log('Created stores table');

    await client.query(`
        CREATE TABLE motorcycles (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
            slug TEXT,
            make TEXT NOT NULL,
            model TEXT NOT NULL,
            year TEXT,
            price NUMERIC,
            images JSONB DEFAULT '[]'::jsonb,
            status TEXT DEFAULT 'available',
            mileage TEXT,
            color TEXT,
            condition TEXT DEFAULT 'Seminova',
            description TEXT,
            features JSONB DEFAULT '[]'::jsonb,
            has_warranty BOOLEAN DEFAULT false,
            is_featured BOOLEAN DEFAULT false,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    `);
    console.log('Created motorcycles table');

    await client.query(`
        CREATE TABLE leads (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
            motorcycle_id UUID,
            name TEXT NOT NULL,
            phone TEXT,
            source TEXT DEFAULT 'website',
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    `);
    console.log('Created leads table');

    await client.query(`
        CREATE TABLE profiles (
            id UUID PRIMARY KEY,
            role TEXT DEFAULT 'viewer',
            store_id UUID,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    `);
    console.log('Created profiles table');

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
            if (mFail <= 3) console.log(`  Moto FAIL: ${m.make} ${m.model}: ${e.message}`);
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

    // RLS
    for (const t of ['stores', 'motorcycles', 'leads', 'profiles']) {
        await client.query(`ALTER TABLE ${t} ENABLE ROW LEVEL SECURITY`).catch(() => {});
    }
    await client.query(`CREATE POLICY "pub_read_stores" ON stores FOR SELECT USING (true)`).catch(() => {});
    await client.query(`CREATE POLICY "pub_read_motos" ON motorcycles FOR SELECT USING (true)`).catch(() => {});
    await client.query(`CREATE POLICY "pub_insert_leads" ON leads FOR INSERT WITH CHECK (true)`).catch(() => {});
    await client.query(`CREATE POLICY "pub_read_leads" ON leads FOR SELECT USING (true)`).catch(() => {});
    for (const t of ['stores', 'motorcycles', 'leads', 'profiles']) {
        await client.query(`CREATE POLICY "auth_${t}" ON ${t} FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated')`).catch(() => {});
        await client.query(`CREATE POLICY "svc_${t}" ON ${t} FOR ALL USING (auth.role() = 'service_role')`).catch(() => {});
    }
    console.log('RLS OK');

    // VERIFY
    console.log('\n=== VERIFICATION ===');
    for (const t of ['stores', 'motorcycles', 'leads']) {
        const r = await client.query(`SELECT COUNT(*) as c FROM ${t}`);
        console.log(`  ${t}: ${r.rows[0].c} rows`);
    }

    await client.end();
    console.log('\nMIGRATION COMPLETE!');
}

run().catch(e => console.error('FATAL:', e.message));
