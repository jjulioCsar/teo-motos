const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function reloadSchema() {
    console.log('Connecting to database to reload schema cache...');

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected!');

        const sql = "NOTIFY pgrst, 'reload config';";

        console.log('Executing NOTIFY pgrst, "reload config"...');
        await client.query(sql);
        console.log('Schema cache reload triggered successfully!');
    } catch (err) {
        console.error('Failed to reload schema:', err);
    } finally {
        await client.end();
    }
}

reloadSchema();
