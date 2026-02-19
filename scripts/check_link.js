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

        const email = 'teomotos@gmail.com';

        // 1. Get User ID
        const resUser = await client.query(`
      SELECT id, email FROM auth.users WHERE email = $1;
    `, [email]);

        if (resUser.rows.length === 0) {
            console.log('User not found:', email);
            return;
        }
        const userId = resUser.rows[0].id;
        console.log('User ID:', userId);

        // 2. Get Store owner_id
        const resStore = await client.query(`
      SELECT id, name, slug, email, owner_id FROM public.stores WHERE email = $1;
    `, [email]);

        if (resStore.rows.length === 0) {
            console.log('Store not found for email:', email);
        } else {
            const store = resStore.rows[0];
            console.log('Store found:', store.name, 'Expected Owner:', userId, 'Actual Owner:', store.owner_id);

            if (store.owner_id === userId) {
                console.log('SUCCESS: Store is correctly linked to user.');
            } else {
                console.log('FAILURE: Store owner_id does not match user id.');
            }
        }

    } catch (err) {
        console.error('Error executing script:', err);
    } finally {
        await client.end();
    }
}

run();
