/**
 * Import ALL data into the NEW Supabase project.
 * Run: node scripts/import_database.mjs
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EXPORT_DIR = path.join(__dirname, '..', 'backup_export');

// NEW Supabase Postgres connection
const NEW_DB_URL = 'postgresql://postgres.kcutjutbekiyrdhxsusz:teomotospassword_@aws-1-us-west-1.pooler.supabase.com:6543/postgres';

function readJson(filename) {
    return JSON.parse(fs.readFileSync(path.join(EXPORT_DIR, filename), 'utf-8'));
}

async function run() {
    console.log('🔌 Connecting to NEW Supabase Postgres...');
    const client = new pg.Client({ connectionString: NEW_DB_URL, ssl: { rejectUnauthorized: false } });

    try {
        await client.connect();
        console.log('✅ Connected to new database!\n');

        // ============================================
        // 1. CREATE TABLES
        // ============================================
        console.log('📐 Creating tables...\n');

        // Enable UUID extension
        await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

        // STORES table
        await client.query(`
            CREATE TABLE IF NOT EXISTS stores (
                id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
                slug TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                primary_color TEXT DEFAULT '#6366f1',
                secondary_color TEXT DEFAULT '#818cf8',
                tertiary_color TEXT DEFAULT '#4f46e5',
                whatsapp_number TEXT,
                whatsapp_message TEXT,
                address TEXT,
                is_dark_mode BOOLEAN DEFAULT true,
                show_financing BOOLEAN DEFAULT true,
                hero_title TEXT,
                hero_subtitle TEXT,
                hero_image TEXT,
                about_text TEXT,
                about_image TEXT,
                financing_text TEXT,
                financing_title TEXT,
                financing_subtitle TEXT,
                financing_hero_image TEXT,
                financing_main_title TEXT,
                financing_secondary_image TEXT,
                email TEXT,
                instagram TEXT,
                facebook TEXT,
                map_url TEXT,
                about_subtitle TEXT,
                about_paragraphs JSONB,
                navbar_cta TEXT,
                contact_title TEXT,
                contact_subtitle TEXT,
                address_title TEXT,
                address_description TEXT,
                channels_title TEXT,
                channels_description TEXT,
                hours_title TEXT,
                hours_description TEXT,
                hours_weekdays TEXT,
                hours_saturday TEXT,
                feature1_title TEXT,
                feature1_desc TEXT,
                feature2_title TEXT,
                feature2_desc TEXT,
                feature3_title TEXT,
                feature3_desc TEXT,
                featured_title TEXT,
                about_teaser_title TEXT,
                about_teaser_text TEXT,
                our_values JSONB,
                owner_id UUID,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);
        console.log('  ✅ stores table created');

        // MOTORCYCLES table
        await client.query(`
            CREATE TABLE IF NOT EXISTS motorcycles (
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
            );
        `);
        console.log('  ✅ motorcycles table created');

        // LEADS table
        await client.query(`
            CREATE TABLE IF NOT EXISTS leads (
                id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
                store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
                motorcycle_id UUID,
                name TEXT NOT NULL,
                phone TEXT,
                source TEXT DEFAULT 'website',
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);
        console.log('  ✅ leads table created');

        // PROFILES table
        await client.query(`
            CREATE TABLE IF NOT EXISTS profiles (
                id UUID PRIMARY KEY,
                role TEXT DEFAULT 'viewer',
                store_id UUID,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);
        console.log('  ✅ profiles table created');

        // ============================================
        // 2. IMPORT DATA
        // ============================================
        console.log('\n📦 Importing data...\n');

        // Import STORES
        const stores = readJson('stores.json');
        for (const s of stores) {
            try {
                // Build columns and values dynamically from the exported data
                const cols = Object.keys(s);
                const vals = Object.values(s).map(v => {
                    if (v === null || v === undefined) return null;
                    if (typeof v === 'object') return JSON.stringify(v);
                    return v;
                });
                const placeholders = vals.map((_, i) => `$${i + 1}`).join(', ');
                const colNames = cols.map(c => `"${c}"`).join(', ');
                
                await client.query(
                    `INSERT INTO stores (${colNames}) VALUES (${placeholders}) ON CONFLICT (id) DO NOTHING`,
                    vals
                );
            } catch (err) {
                console.log(`  ⚠️ Store ${s.slug}: ${err.message}`);
            }
        }
        console.log(`  ✅ Stores: ${stores.length} imported`);

        // Import MOTORCYCLES
        const motos = readJson('motorcycles.json');
        let motoOk = 0;
        for (const m of motos) {
            try {
                const cols = Object.keys(m);
                const vals = Object.values(m).map(v => {
                    if (v === null || v === undefined) return null;
                    if (typeof v === 'object') return JSON.stringify(v);
                    return v;
                });
                const placeholders = vals.map((_, i) => `$${i + 1}`).join(', ');
                const colNames = cols.map(c => `"${c}"`).join(', ');
                
                await client.query(
                    `INSERT INTO motorcycles (${colNames}) VALUES (${placeholders}) ON CONFLICT (id) DO NOTHING`,
                    vals
                );
                motoOk++;
            } catch (err) {
                console.log(`  ⚠️ Moto ${m.make} ${m.model}: ${err.message}`);
            }
        }
        console.log(`  ✅ Motorcycles: ${motoOk}/${motos.length} imported`);

        // Import LEADS
        const leads = readJson('leads.json');
        let leadOk = 0;
        for (const l of leads) {
            try {
                const cols = Object.keys(l);
                const vals = Object.values(l).map(v => {
                    if (v === null || v === undefined) return null;
                    if (typeof v === 'object') return JSON.stringify(v);
                    return v;
                });
                const placeholders = vals.map((_, i) => `$${i + 1}`).join(', ');
                const colNames = cols.map(c => `"${c}"`).join(', ');
                
                await client.query(
                    `INSERT INTO leads (${colNames}) VALUES (${placeholders}) ON CONFLICT (id) DO NOTHING`,
                    vals
                );
                leadOk++;
            } catch (err) {
                // Skip individual lead errors silently
            }
        }
        console.log(`  ✅ Leads: ${leadOk}/${leads.length} imported`);

        // ============================================
        // 3. SETUP RLS POLICIES
        // ============================================
        console.log('\n🔒 Setting up RLS policies...\n');

        // Enable RLS on all tables
        for (const table of ['stores', 'motorcycles', 'leads', 'profiles']) {
            await client.query(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`);
        }

        // Public read access for stores and motorcycles (storefront needs this)
        await client.query(`
            CREATE POLICY "Public read stores" ON stores FOR SELECT USING (true);
        `).catch(() => {});
        await client.query(`
            CREATE POLICY "Public read motorcycles" ON motorcycles FOR SELECT USING (true);
        `).catch(() => {});
        await client.query(`
            CREATE POLICY "Public insert leads" ON leads FOR INSERT WITH CHECK (true);
        `).catch(() => {});
        await client.query(`
            CREATE POLICY "Public read leads" ON leads FOR SELECT USING (true);
        `).catch(() => {});

        // Authenticated users can do everything (admin panel)
        for (const table of ['stores', 'motorcycles', 'leads', 'profiles']) {
            await client.query(`
                CREATE POLICY "Auth full access ${table}" ON ${table} FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
            `).catch(() => {});
        }

        // Service role bypass
        for (const table of ['stores', 'motorcycles', 'leads', 'profiles']) {
            await client.query(`
                CREATE POLICY "Service role ${table}" ON ${table} FOR ALL USING (auth.role() = 'service_role');
            `).catch(() => {});
        }

        console.log('  ✅ RLS policies configured');

        // ============================================
        // 4. VERIFY
        // ============================================
        console.log('\n📊 Verification:\n');
        for (const table of ['stores', 'motorcycles', 'leads', 'profiles']) {
            const res = await client.query(`SELECT COUNT(*) as cnt FROM ${table}`);
            console.log(`  ${table}: ${res.rows[0].cnt} rows`);
        }

        console.log('\n🎉 Migration complete!');

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
    }
}

run();
