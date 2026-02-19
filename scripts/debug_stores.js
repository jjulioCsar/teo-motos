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

        // 2. Check profiles
        const resProfiles = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'profiles';
    `);
        console.log('Profiles Table Columns:', resProfiles.rows);

        // 1. Check table columns
        const resColumns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'stores';
    `);
        console.log('Stores Table Columns:', resColumns.rows);

        // 2. Check for the specific store (teomotos)
        const resStore = await client.query(`
      SELECT * 
      FROM public.stores 
      WHERE slug ILIKE '%teo%' OR name ILIKE '%teo%';
    `);
        console.log('Found Stores:', resStore.rows);

    } catch (err) {
        console.error('Error executing script:', err);
    } finally {
        await client.end();
    }
}

run();
