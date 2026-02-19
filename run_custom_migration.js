const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres.litzlvhlmaqcgszkwbdz:RuaD_-VQFk$+Gj3@aws-0-us-west-2.pooler.supabase.com:6543/postgres';

async function runMigration() {
    const client = new Client({ connectionString });
    const migrationFile = process.argv[2];

    if (!migrationFile) {
        console.error("Please provide a migration file path.");
        process.exit(1);
    }

    try {
        console.log("=== Connecting to Database ===\n");
        await client.connect();

        const sqlPath = path.resolve(migrationFile);
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log(`=== Executing Migration: ${migrationFile} ===\n`);
        console.log(sql);

        await client.query(sql);

        console.log("\n✅ Migration executed successfully!");

    } catch (error) {
        console.error("❌ Migration failed:", error.message);
    } finally {
        await client.end();
    }
}

runMigration();
