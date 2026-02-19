const { Client } = require('pg');

const connectionString = 'postgresql://postgres.litzlvhlmaqcgszkwbdz:RuaD_-VQFk$+Gj3@aws-0-us-west-2.pooler.supabase.com:6543/postgres';

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function testDB() {
    console.log("Testing direct DB connection...");
    try {
        await client.connect();
        console.log("✅ SUCCESS: Connected to Database directly via TCP.");
        const res = await client.query('SELECT NOW()');
        console.log("Current DB Time:", res.rows[0]);
        await client.end();
    } catch (err) {
        console.error("❌ FAILURE: Could not connect to DB:", err);
    }
}

testDB();
