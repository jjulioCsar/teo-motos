import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import MotoClientPage from './MotoClientPage';

// Server-side Supabase client for metadata generation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

async function getMotoData(id: string) {
    if (!supabaseUrl.startsWith('http')) return null;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Try slug first, then UUID
    let { data } = await supabase
        .from('motorcycles')
        .select('make, model, year, price, images, description, color, condition, mileage')
        .eq('slug', decodeURIComponent(id))
        .maybeSingle();

    if (!data) {
        const res = await supabase
            .from('motorcycles')
            .select('make, model, year, price, images, description, color, condition, mileage')
            .eq('id', decodeURIComponent(id))
            .maybeSingle();
        data = res.data;
    }

    return data;
}

export async function generateMetadata(
    { params }: { params: Promise<{ slug: string; id: string }> }
): Promise<Metadata> {
    const { slug, id } = await params;
    const moto = await getMotoData(id);

    if (!moto) {
        return {
            title: 'Moto não encontrada | Téo Motos',
        };
    }

    const title = `${moto.make} ${moto.model} ${moto.year || ''} | Téo Motos`.trim();
    const price = Number(moto.price || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const km = moto.mileage ? `${Number(moto.mileage).toLocaleString('pt-BR')} km` : '';
    const description = `${moto.make} ${moto.model} ${moto.year || ''} - ${price}${km ? ` • ${km}` : ''}${moto.color ? ` • ${moto.color}` : ''}${moto.condition ? ` • ${moto.condition}` : ''}. Confira no site!`;

    // Use the first image as OG image
    const ogImage = moto.images && moto.images.length > 0 ? moto.images[0] : undefined;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: 'website',
            url: `https://teomotos.vercel.app/${slug}/moto/${id}`,
            siteName: 'Téo Motos',
            ...(ogImage ? {
                images: [
                    {
                        url: ogImage,
                        width: 1200,
                        height: 630,
                        alt: `${moto.make} ${moto.model}`,
                    },
                ],
            } : {}),
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            ...(ogImage ? { images: [ogImage] } : {}),
        },
    };
}

export default function Page() {
    return <MotoClientPage />;
}
