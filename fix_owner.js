const { Client } = require('pg');

const connectionString = 'postgresql://postgres.litzlvhlmaqcgszkwbdz:RuaD_-VQFk$+Gj3@aws-0-us-west-2.pooler.supabase.com:6543/postgres';

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function fixStoreOwner() {
    console.log("Fixing store owner for 'teomotos@gmail.com'...");
    try {
        await client.connect();

        // 1. Get the Auth User ID
        const userRes = await client.query("SELECT id FROM auth.users WHERE email = 'teomotos@gmail.com'");
        if (userRes.rows.length === 0) {
            console.error("User NOT found in auth.users. Cannot fix.");
            return;
        }
        const userId = userRes.rows[0].id;
        console.log("Found correct Auth User ID:", userId);

        // 2. Update the Store
        const updateRes = await client.query(
            "UPDATE public.stores SET owner_id = $1 WHERE email = 'teomotos@gmail.com' AND slug = 'teomotos' RETURNING id, owner_id",
            [userId]
        );

        if (updateRes.rows.length > 0) {
            console.log("✅ SUCCESS: Store owner updated!");
            console.log(updateRes.rows[0]);
        } else {
            console.log("❌ FAILURE: Store not updated. Check if slug/email matches in public.stores.");
        }

        await client.end();
    } catch (err) {
        console.error("Error updating DB:", err);
    }
}

fixStoreOwner();
