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

        // Update the email for 'teomotos'
        const resUpdate = await client.query(`
      UPDATE public.stores 
      SET email = 'teomotos@gmail.com' 
      WHERE slug = 'teomotos';
    `);

        console.log('Update Result:', resUpdate.rowCount);

        // Verify
        const resVerify = await client.query(`
        SELECT slugs, email FROM public.stores WHERE slug = 'teomotos';
    `);
        console.log('Verified:', resVerify.rows);

    } catch (err) {
        console.error('Error executing script:', err);
    } finally {
        await client.end();
    }
}

run();
