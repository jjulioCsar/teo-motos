const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function runMigration() {
    console.log('Connecting to database...');

    // Explicitly use the connection string from env
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false } // Required for Supabase
    });

    try {
        await client.connect();
        console.log('Combined successfully!');

        const MIGRATION_FILE = 'supabase/migrations/20240212_add_moto_details.sql';
        const sqlPath = path.join(__dirname, '..', MIGRATION_FILE);
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Running migration...');
        await client.query(sql);
        console.log('Migration completed successfully!');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

runMigration();
