/**
 * Export ALL data from the old Supabase project.
 * Uses direct Postgres connection (bypasses REST API egress limits).
 * 
 * Run: node scripts/export_database.mjs
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EXPORT_DIR = path.join(__dirname, '..', 'backup_export');

// Direct Postgres connection
const DATABASE_URL = 'postgresql://postgres.litzlvhlmaqcgszkwbdz:RuaD_-VQFk$+Gj3@aws-0-us-west-2.pooler.supabase.com:6543/postgres';

async function run() {
    // Create export directory
    if (!fs.existsSync(EXPORT_DIR)) fs.mkdirSync(EXPORT_DIR, { recursive: true });

    console.log('🔌 Connecting to Supabase Postgres...');
    const client = new pg.Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
    
    try {
        await client.connect();
        console.log('✅ Connected!\n');

        // 1. List all tables in public schema
        const tablesRes = await client.query(`
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        `);
        const tables = tablesRes.rows.map(r => r.table_name);
        console.log(`📋 Found ${tables.length} tables: ${tables.join(', ')}\n`);

        // 2. Export each table
        for (const table of tables) {
            try {
                const countRes = await client.query(`SELECT COUNT(*) as cnt FROM "${table}"`);
                const count = parseInt(countRes.rows[0].cnt);
                
                const dataRes = await client.query(`SELECT * FROM "${table}"`);
                const filePath = path.join(EXPORT_DIR, `${table}.json`);
                fs.writeFileSync(filePath, JSON.stringify(dataRes.rows, null, 2));
                console.log(`  ✅ ${table}: ${count} rows → ${table}.json`);
            } catch (err) {
                console.log(`  ❌ ${table}: ${err.message}`);
            }
        }

        // 3. Export schema (CREATE TABLE statements)
        console.log('\n📐 Exporting schema...');
        const schemaRes = await client.query(`
            SELECT 
                'CREATE TABLE IF NOT EXISTS "' || table_name || '" (' ||
                string_agg(
                    '"' || column_name || '" ' || 
                    CASE 
                        WHEN data_type = 'USER-DEFINED' THEN udt_name
                        WHEN data_type = 'ARRAY' THEN udt_name
                        WHEN character_maximum_length IS NOT NULL THEN data_type || '(' || character_maximum_length || ')'
                        ELSE data_type 
                    END ||
                    CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END ||
                    CASE WHEN column_default IS NOT NULL THEN ' DEFAULT ' || column_default ELSE '' END,
                    ', ' ORDER BY ordinal_position
                ) || ');' as ddl,
                table_name
            FROM information_schema.columns
            WHERE table_schema = 'public'
            GROUP BY table_name
            ORDER BY table_name;
        `);
        
        let schemaSql = '-- Exported schema from old Supabase project\n\n';
        for (const row of schemaRes.rows) {
            schemaSql += row.ddl + '\n\n';
        }
        fs.writeFileSync(path.join(EXPORT_DIR, '_schema.sql'), schemaSql);
        console.log('  ✅ Schema saved to _schema.sql');

        // 4. Export RLS policies
        console.log('\n🔒 Exporting RLS policies...');
        const rlsRes = await client.query(`
            SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
            FROM pg_policies WHERE schemaname = 'public';
        `);
        fs.writeFileSync(path.join(EXPORT_DIR, '_rls_policies.json'), JSON.stringify(rlsRes.rows, null, 2));
        console.log(`  ✅ ${rlsRes.rows.length} RLS policies saved`);

        // 5. Check for image URLs in motorcycle data
        console.log('\n🖼️  Scanning image URLs...');
        try {
            const imgRes = await client.query(`SELECT id, make, model, images FROM motorcycles`);
            let supabaseImages = 0;
            let cloudinaryImages = 0;
            let allImageUrls = [];
            
            for (const row of imgRes.rows) {
                if (row.images && Array.isArray(row.images)) {
                    for (const url of row.images) {
                        if (url.includes('supabase.co')) {
                            supabaseImages++;
                            allImageUrls.push({ moto: `${row.make} ${row.model}`, id: row.id, url });
                        } else if (url.includes('cloudinary')) {
                            cloudinaryImages++;
                        }
                    }
                }
            }
            
            console.log(`  📊 Cloudinary images: ${cloudinaryImages} (safe ✅)`);
            console.log(`  📊 Supabase Storage images: ${supabaseImages} (need download ⚠️)`);
            
            if (allImageUrls.length > 0) {
                fs.writeFileSync(path.join(EXPORT_DIR, '_supabase_images.json'), JSON.stringify(allImageUrls, null, 2));
                console.log(`  📁 Supabase image URLs saved to _supabase_images.json`);
            }
        } catch (err) {
            console.log(`  ⚠️ Could not scan images: ${err.message}`);
        }

        // Also check store logos/images
        try {
            const storeRes = await client.query(`SELECT slug, logo, hero_image, about_image, financing_hero_image FROM stores`);
            let storeImages = [];
            for (const row of storeRes.rows) {
                for (const field of ['logo', 'hero_image', 'about_image', 'financing_hero_image']) {
                    if (row[field] && row[field].includes('supabase.co')) {
                        storeImages.push({ store: row.slug, field, url: row[field] });
                    }
                }
            }
            if (storeImages.length > 0) {
                fs.writeFileSync(path.join(EXPORT_DIR, '_supabase_store_images.json'), JSON.stringify(storeImages, null, 2));
                console.log(`  📁 ${storeImages.length} store image URLs saved`);
            }
        } catch (err) {
            console.log(`  ⚠️ Could not scan store images: ${err.message}`);
        }

        console.log(`\n🎉 Export complete! Files saved to: ${EXPORT_DIR}`);

    } catch (err) {
        console.error('❌ Connection failed:', err.message);
        console.log('\nIf connection is blocked, you can still export via the Supabase Dashboard:');
        console.log('1. Go to https://supabase.com/dashboard → Your Project → SQL Editor');
        console.log('2. Run: SELECT * FROM motorcycles;');
        console.log('3. Copy the results');
    } finally {
        await client.end();
    }
}

run();
