import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const slug = requestUrl.searchParams.get('slug');

    if (!slug) {
        return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    const cookieStore = await cookies();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
            },
        }
    );

    // 1. Check Auth
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Verify Store Ownership
    const { data: store, error: storeError } = await supabase
        .from('stores')
        .select('*')
        .eq('slug', slug)
        .eq('owner_id', session.user.id)
        .single();

    if (storeError || !store) {
        return NextResponse.json({ error: 'Store not found or permission denied' }, { status: 403 });
    }

    try {
        // 3. Fetch Related Data
        const { data: motorcycles } = await supabase
            .from('motorcycles')
            .select('*')
            .eq('store_id', store.id);

        const { data: leads } = await supabase
            .from('leads')
            .select('*')
            .eq('store_id', store.id);

        // 4. Construct Backup Object
        const backupData = {
            metadata: {
                exported_at: new Date().toISOString(),
                exported_by: session.user.email,
                version: '1.0'
            },
            store: store,
            motorcycles: motorcycles || [],
            leads: leads || []
        };

        // 5. Return as Download
        const json = JSON.stringify(backupData, null, 2);

        return new NextResponse(json, {
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="backup-${slug}-${new Date().toISOString().split('T')[0]}.json"`
            }
        });

    } catch (err: any) {
        console.error("Backup error:", err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
