const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres.litzlvhlmaqcgszkwbdz:RuaD_-VQFk$+Gj3@aws-0-us-west-2.pooler.supabase.com:6543/postgres';

async function runMigration() {
    const client = new Client({ connectionString });

    try {
        console.log("=== Connecting to Database ===\n");
        await client.connect();
        console.log("✅ Connected successfully!\n");

        const sqlPath = path.join(__dirname, 'supabase', 'schema_migration.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log("=== Executing Migration ===\n");
        console.log(sql);
        console.log("\n");

        await client.query(sql);

        console.log("✅ Migration executed successfully!\n");

        console.log("=== Verifying Changes ===\n");

        const result = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'stores' 
            AND column_name IN ('contact_subtitle', 'financing_title', 'navbar_cta', 'whatsapp_number')
            ORDER BY column_name;
        `);

        console.log("New columns found:");
        result.rows.forEach(row => console.log(`  ✅ ${row.column_name}`));

        if (result.rows.length === 4) {
            console.log("\n🎉 All columns created successfully!");
        } else {
            console.log("\n⚠️  Some columns may be missing. Check the output above.");
        }

    } catch (error) {
        console.error("❌ Migration failed:", error.message);
        console.error(error);
    } finally {
        await client.end();
        console.log("\n=== Connection closed ===");
    }
}

runMigration();
