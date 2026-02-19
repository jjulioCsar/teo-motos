const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const createRpcSql = `
CREATE OR REPLACE FUNCTION public.claim_store_by_email()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_email text;
  v_user_id uuid;
  v_store_id uuid;
BEGIN
  -- Get current user email and ID from the session claims
  v_user_email := auth.jwt() ->> 'email';
  v_user_id := auth.uid();

  IF v_user_email IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'Email not found in JWT');
  END IF;

  -- Find the store with matching email
  SELECT id INTO v_store_id
  FROM public.stores
  WHERE email = v_user_email
  LIMIT 1;

  IF v_store_id IS NOT NULL THEN
    -- Update the owner_id
    UPDATE public.stores
    SET owner_id = v_user_id
    WHERE id = v_store_id;

    RETURN json_build_object('success', true, 'store_id', v_store_id);
  ELSE
    RETURN json_build_object('success', false, 'message', 'No store found with email: ' || v_user_email);
  END IF;
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'message', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_store_by_email() TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_store_by_email() TO service_role;
GRANT EXECUTE ON FUNCTION public.claim_store_by_email() TO anon;
`;

async function run() {
  try {
    await client.connect();
    console.log('Connected to database...');

    await client.query(createRpcSql);
    console.log('RPC function claim_store_by_email created successfully.');

  } catch (err) {
    console.error('Error executing script:', err);
  } finally {
    await client.end();
  }
}

run();
