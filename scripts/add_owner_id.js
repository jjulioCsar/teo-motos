const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function run() {
    try {
        await client.connect();
        console.log('Connected to database...');

        // Add owner_id column
        await client.query(`
      ALTER TABLE public.stores 
      ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
    `);
        console.log('Added owner_id column to stores.');

        // Add index for performance
        await client.query(`
      CREATE INDEX IF NOT EXISTS idx_stores_owner_id ON public.stores(owner_id);
    `);
        console.log('Added index on owner_id.');

    } catch (err) {
        console.error('Error executing script:', err);
    } finally {
        await client.end();
    }
}

run();
