import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// This endpoint serves two purposes:
// 1. Health check for monitoring (e.g. UptimeRobot, cron-job.org)
// 2. Keeps Supabase free tier alive by making a DB query every few days
export async function GET() {
    const status: Record<string, string> = {
        status: 'ok',
        timestamp: new Date().toISOString(),
    };

    try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (url && key) {
            const supabase = createClient(url, key);
            const { count, error } = await supabase
                .from('stores')
                .select('*', { count: 'exact', head: true });

            status.database = error ? 'error' : 'connected';
            status.stores = String(count ?? 0);
        } else {
            status.database = 'no_credentials';
        }
    } catch {
        status.database = 'unreachable';
    }

    return NextResponse.json(status);
}
