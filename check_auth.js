const { Client } = require('pg');

const connectionString = 'postgresql://postgres.litzlvhlmaqcgszkwbdz:RuaD_-VQFk$+Gj3@aws-0-us-west-2.pooler.supabase.com:6543/postgres';

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function checkAuthUser() {
    console.log("Checking auth.users for 'teomotos@gmail.com'...");
    try {
        await client.connect();
        const res = await client.query("SELECT id, email, created_at, last_sign_in_at FROM auth.users WHERE email = 'teomotos@gmail.com'");

        if (res.rows.length > 0) {
            console.log("User Found:", res.rows[0]);
        } else {
            console.log("User 'teomotos@gmail.com' NOT found in auth.users.");
        }
        await client.end();
    } catch (err) {
        console.error("Error querying DB:", err);
    }
}

checkAuthUser();
