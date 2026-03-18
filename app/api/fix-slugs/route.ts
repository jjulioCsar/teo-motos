import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

function generateUniqueSlug(make: string, model: string, year: string): string {
    const base = `${make}-${model}-${year}`
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    const uid = Math.random().toString(36).substring(2, 6);
    return `${base}-${uid}`;
}

export async function GET() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all motorcycles
    const { data: motos, error } = await supabase
        .from('motorcycles')
        .select('id, make, model, year, slug');

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Find duplicates and motos without proper unique slugs
    const slugCounts: Record<string, number> = {};
    for (const m of motos || []) {
        slugCounts[m.slug] = (slugCounts[m.slug] || 0) + 1;
    }

    const updated: string[] = [];
    for (const m of motos || []) {
        // Update if slug is duplicated OR if slug doesn't have a 4-char uid suffix
        const hasUid = m.slug && /^.+-[a-z0-9]{4}$/.test(m.slug);
        if (!hasUid || slugCounts[m.slug] > 1) {
            const newSlug = generateUniqueSlug(m.make, m.model, m.year);
            const { error: updateError } = await supabase
                .from('motorcycles')
                .update({ slug: newSlug })
                .eq('id', m.id);

            if (!updateError) {
                updated.push(`${m.make} ${m.model} ${m.year}: ${m.slug} -> ${newSlug}`);
            }
        }
    }

    return NextResponse.json({
        message: `Updated ${updated.length} motorcycle slugs`,
        updates: updated
    });
}
