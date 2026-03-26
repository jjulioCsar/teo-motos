import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Fix Cloudinary URLs that are missing f_auto,q_auto transformation
// This makes HEIC images (from iPhones) display correctly in browsers
export async function GET() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return NextResponse.json({ error: 'Missing env vars' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all motorcycles with Cloudinary URLs
    const { data: motos, error } = await supabase
        .from('motorcycles')
        .select('id, images');

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let fixedCount = 0;

    for (const moto of motos || []) {
        if (!moto.images || !Array.isArray(moto.images)) continue;

        let hasCloudinaryUrl = false;
        const fixedImages = moto.images.map((url: string) => {
            // Only fix Cloudinary URLs that DON'T already have f_auto,q_auto
            if (url.includes('res.cloudinary.com') && !url.includes('f_auto')) {
                hasCloudinaryUrl = true;
                return url.replace('/upload/', '/upload/f_auto,q_auto/');
            }
            return url;
        });

        if (hasCloudinaryUrl) {
            const { error: updateError } = await supabase
                .from('motorcycles')
                .update({ images: fixedImages })
                .eq('id', moto.id);

            if (!updateError) fixedCount++;
        }
    }

    // Also fix store fields that might have Cloudinary URLs
    const { data: stores } = await supabase.from('stores').select('id, logo_url, hero_image, about_image, financing_hero_image, financing_secondary_image');

    let storeFixedCount = 0;
    for (const store of stores || []) {
        const updates: any = {};
        const fields = ['logo_url', 'hero_image', 'about_image', 'financing_hero_image', 'financing_secondary_image'];
        
        for (const field of fields) {
            const val = (store as any)[field];
            if (val && typeof val === 'string' && val.includes('res.cloudinary.com') && !val.includes('f_auto')) {
                updates[field] = val.replace('/upload/', '/upload/f_auto,q_auto/');
            }
        }

        if (Object.keys(updates).length > 0) {
            await supabase.from('stores').update(updates).eq('id', store.id);
            storeFixedCount++;
        }
    }

    return NextResponse.json({
        success: true,
        motorcyclesFixed: fixedCount,
        storesFixed: storeFixedCount,
        message: `Fixed ${fixedCount} motorcycles and ${storeFixedCount} stores with Cloudinary URLs`
    });
}
