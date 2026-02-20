import { supabase } from '@/lib/supabase';

// Types for better structure
export interface Store {
    id?: string;
    slug: string;
    name: string;
    logo?: string;
    primaryColor: string;
    secondaryColor: string;
    tertiaryColor: string;
    whatsappNumber: string;
    whatsappMessage: string;
    address: string;
    isDarkMode: boolean;
    showFinancing: boolean;
    // New Content Fields
    heroTitle?: string;
    heroSubTitle?: string;
    heroImage?: string;
    // Static Page Fields
    aboutText?: string;
    aboutImage?: string;
    financingText?: string;
    financingTitle?: string;
    financingSubtitle?: string;
    financingHeroImage?: string;
    financingMainTitle?: string;
    financingSecondaryImage?: string;
    email?: string;
    instagram?: string;
    facebook?: string;
    mapUrl?: string;
    // Expanded Content
    aboutSubtitle?: string;
    aboutParagraphs?: string[];

    navbarCta?: string;
    // Contact Page Fields
    contactTitle?: string;
    contactSubtitle?: string;
    addressTitle?: string;
    addressDescription?: string;
    channelsTitle?: string;
    channelsDescription?: string;
    hoursTitle?: string;
    hoursDescription?: string;
    hoursWeekdays?: string;
    hoursSaturday?: string;
    // Home Page Features
    feature1Title?: string;
    feature1Desc?: string;
    feature2Title?: string;
    feature2Desc?: string;
    feature3Title?: string;
    feature3Desc?: string;
    // Teasers
    featuredTitle?: string;
    aboutTeaserTitle?: string;
    aboutTeaserText?: string;
    ourValues?: any[];
}
// Store interface ends here

export interface Motorcycle {
    id: string;
    make: string;
    model: string;
    year: string;
    price: string;
    image: string;
    images: string[];
    status: 'available' | 'sold' | 'reserved';
    km?: string;
    color?: string;
    fuelType?: string;
    description?: string;
    features?: string[];
    condition?: 'Nova' | 'Seminova' | 'Repasse';
    hasWarranty?: boolean;
    is_featured?: boolean;
}

// Helper to map DB to Frontend
const mapStore = (data: any): Store => ({
    slug: data.slug,
    name: data.name,
    logo: data.logo_url || '',
    primaryColor: data.primary_color || '#6366f1',
    secondaryColor: data.secondary_color || '#4f46e5',
    tertiaryColor: data.tertiary_color || '#ef4444',
    whatsappNumber: data.whatsapp_number || data.whatsapp || '',
    whatsappMessage: data.whatsapp_message || '',
    address: data.address || '',
    isDarkMode: data.is_dark_mode ?? true,
    showFinancing: data.show_financing ?? true,
    heroTitle: data.hero_title || '',
    heroSubTitle: data.hero_subtitle || '',
    heroImage: data.hero_image || '',
    aboutText: data.about_text || '',
    aboutSubtitle: data.about_subtitle || '',
    aboutImage: data.about_image || '',
    aboutParagraphs: data.about_paragraphs || [],
    ourValues: data.our_values || [], // Added this field based on the diff

    financingText: data.financing_text || '',
    financingTitle: data.financing_title || '',
    financingSubtitle: data.financing_subtitle || '',
    financingHeroImage: data.financing_hero_image || '',
    financingMainTitle: data.financing_main_title || '',
    financingSecondaryImage: data.financing_secondary_image || '',
    email: data.email || '',
    instagram: data.instagram || '',
    facebook: data.facebook || '',
    mapUrl: data.map_url || '',
    navbarCta: data.navbar_cta || 'Premium Motorcycle Marketplace', // Updated default based on diff
    // Contact Page Mappings
    contactTitle: data.contact_title || 'Fale Conosco',
    contactSubtitle: data.contact_subtitle || 'Vamos começar uma nova jornada?',
    addressTitle: data.address_title || 'Nossa Loja',
    addressDescription: data.address_description || 'Venha tomar um café conosco e conhecer nosso showroom exclusivo.',
    channelsTitle: data.channels_title || 'Canais Diretos',
    channelsDescription: data.channels_description || 'Atendimento ágil e personalizado para tirar todas as suas dúvidas.',
    hoursTitle: data.hours_title || 'Horários',
    hoursDescription: data.hours_description || 'Estamos prontos para te receber nos seguintes horários:',
    hoursWeekdays: data.hours_weekdays || 'Segunda à Sexta 08:00 - 18:00',
    hoursSaturday: data.hours_saturday || 'Sábado 08:00 - 13:00',
    feature1Title: data.feature1_title || 'Qualidade Garantida',
    feature1Desc: data.feature1_desc || 'Todas as nossas motos passam por uma rigorosa vistoria técnica.',
    feature2Title: data.feature2_title || 'Financiamento Fácil',
    feature2Desc: data.feature2_desc || 'As melhores taxas do mercado com aprovação rápida e sem burocracia.',
    feature3Title: data.feature3_title || 'Entrega Segura',
    feature3Desc: data.feature3_desc || 'Receba sua nova conquista no conforto da sua casa com total segurança.',
    featuredTitle: data.featured_title || 'Destaques da Semana',
    aboutTeaserTitle: data.about_teaser_title || 'Paixão por Duas Rodas',
    aboutTeaserText: data.about_teaser_text || 'Na curadoria da nossa loja selecionamos apenas máquinas impecáveis para garantir que sua única preocupação seja o destino.'
});

// Helper to map Frontend to DB
const mapToDB = (store: Partial<Store>) => ({
    name: store.name,
    logo_url: store.logo,
    primary_color: store.primaryColor,
    secondary_color: store.secondaryColor,
    tertiary_color: store.tertiaryColor,
    whatsapp_number: store.whatsappNumber,
    whatsapp_message: store.whatsappMessage,
    address: store.address,
    is_dark_mode: store.isDarkMode,
    show_financing: store.showFinancing,
    hero_title: store.heroTitle,
    hero_subtitle: store.heroSubTitle,
    hero_image: store.heroImage,
    financing_text: store.financingText,
    financing_title: store.financingTitle,
    financing_subtitle: store.financingSubtitle,
    financing_hero_image: store.financingHeroImage,
    financing_main_title: store.financingMainTitle,
    financing_secondary_image: store.financingSecondaryImage,
    about_text: store.aboutText,
    about_subtitle: store.aboutSubtitle,
    about_image: store.aboutImage,
    about_paragraphs: store.aboutParagraphs,
    our_values: store.ourValues, // Added this field based on the diff

    email: store.email,
    instagram: store.instagram,
    facebook: store.facebook,
    map_url: store.mapUrl,
    navbar_cta: store.navbarCta,
    // Contact Page Mappings
    contact_title: store.contactTitle,
    contact_subtitle: store.contactSubtitle,
    address_title: store.addressTitle,
    address_description: store.addressDescription,
    channels_title: store.channelsTitle,
    channels_description: store.channelsDescription,
    hours_title: store.hoursTitle,
    hours_description: store.hoursDescription,
    feature1_title: store.feature1Title,
    feature1_desc: store.feature1Desc,
    feature2_title: store.feature2Title,
    feature2_desc: store.feature2Desc,
    feature3_title: store.feature3Title,
    feature3_desc: store.feature3Desc,
    featured_title: store.featuredTitle,
    about_teaser_title: store.aboutTeaserTitle,
    about_teaser_text: store.aboutTeaserText,
    hours_weekdays: store.hoursWeekdays,
    hours_saturday: store.hoursSaturday,
    slug: store.slug // Ensure slug is part of DB data for upserts
});

// Logic for persistent store management
export const storeService = {
    getStoreByOwner: async (ownerId: string): Promise<Store | null> => {
        if (!supabase) return null;
        try {
            const { data, error } = await supabase
                .from('stores')
                .select('*')
                .eq('owner_id', ownerId)
                .maybeSingle();

            if (error) {
                if (error.message?.includes('AbortError')) return null;
                console.error('Error fetching store by owner:', error.message, error.details);
                return null;
            }

            return data ? mapStore(data) : null;
        } catch (err: any) {
            if (err.name === 'AbortError' || err.message?.includes('AbortError')) return null;
            console.error('Unexpected error in getStoreByOwner:', err);
            return null;
        }
    },

    getStoreBySlug: async (slug: string): Promise<Store | null> => {
        if (!supabase) return null;
        console.log("Fetching store by slug:", slug);
        const { data, error } = await supabase
            .from('stores')
            .select('*')
            .eq('slug', slug)
            .maybeSingle();

        if (error) {
            if (error.message?.includes('AbortError')) return null;
            console.error('Error in getStoreBySlug:', error.message);
            return null;
        }
        if (!data) {
            console.warn('Store not found for slug:', slug);
            return null;
        }
        return mapStore(data);
    },

    getStoreByEmail: async (email: string): Promise<Store | null> => {
        if (!supabase) return null;
        // Search for store by the configuring email
        const { data, error } = await supabase
            .from('stores')
            .select('*')
            .eq('email', email)
            .maybeSingle();

        if (error || !data) return null;
        return mapStore(data);
    },

    saveStore: async (slug: string, store: Partial<Store>) => {
        try {
            if (!supabase) {
                console.error("Supabase client not initialized in saveStore");
                return;
            }

            console.log("saveStore called for:", slug);

            // Fetch existing store to get name if not provided (for partial updates)
            let currentName = store.name;
            if (!currentName) {
                const { data: existing } = await supabase.from('stores').select('name').eq('slug', slug).single();
                if (existing) {
                    currentName = existing.name;
                } else {
                    // If new store and no name, derive from slug
                    currentName = slug.replace(/-/g, ' ').toUpperCase();
                }
            }

            // Clean undefined values to avoid overwriting with null/issues or checking types
            const rawData = {
                ...mapToDB(store),
                slug,
                name: currentName // Ensure name is always present
            };

            const dbData = Object.fromEntries(
                Object.entries(rawData).filter(([_, v]) => v !== undefined)
            );

            console.log("Payload to Supabase:", dbData);

            const { error } = await supabase
                .from('stores')
                .upsert(dbData, { onConflict: 'slug' });

            if (error) {
                console.error('Supabase Upsert Error:', JSON.stringify(error, null, 2));
                throw error;
            }

            console.log("Store saved successfully!");
        } catch (err) {
            console.error("Unexpected error in saveStore:", err);
            throw err;
        }
    },

    uploadImage: async (file: File): Promise<string | null> => {
        if (!supabase) return null;

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { data, error } = await supabase.storage
                .from('images')
                .upload(filePath, file);

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('images')
                .getPublicUrl(filePath);

            return publicUrl;
        } catch (err) {
            console.error('Error in uploadImage:', err);
            throw err;
        }
    }
};

// Logic for inventory management scoped by store
export const inventoryService = {
    getInventory: async (storeSlug: string): Promise<Motorcycle[]> => {
        if (!supabase) return [];

        const { data: store, error: storeError } = await supabase
            .from('stores')
            .select('id')
            .eq('slug', storeSlug)
            .maybeSingle();

        if (storeError || !store) return [];

        const { data, error } = await supabase
            .from('motorcycles')
            .select('*')
            .eq('store_id', store.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching motorcycles:', error.message);
            return [];
        }
        console.log(`Fetched ${data.length} motorcycles for store ${store.id}`);

        return data.map(m => ({
            id: m.id,
            make: m.make,
            model: m.model,
            year: m.year,
            price: m.price.toString(),
            image: m.images?.[0] || '',
            images: m.images || [],
            status: m.status,
            km: m.mileage?.toString(),
            color: m.color,
            fuelType: m.condition === 'New' ? 'Flex' : 'Gasolina', // Legacy fallback or update logic
            description: m.description,
            features: m.features,
            condition: m.condition || 'Seminova',
            hasWarranty: m.has_warranty ?? false
        }));
    },

    getMotorcycleById: async (id: string): Promise<Motorcycle | null> => {
        if (!supabase) return null;

        const { data, error } = await supabase
            .from('motorcycles')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) return null;

        return {
            id: data.id,
            make: data.make,
            model: data.model,
            year: data.year,
            price: data.price.toString(),
            image: data.images?.[0] || '',
            images: data.images || [],
            status: data.status,
            km: data.mileage?.toString(),
            color: data.color,
            fuelType: data.condition === 'New' ? 'Flex' : 'Gasolina',
            description: data.description,
            features: data.features,
            condition: data.condition || 'Seminova',
            hasWarranty: data.has_warranty ?? false
        };
    },

    addMotorcycle: async (storeSlug: string, moto: Omit<Motorcycle, 'id'>) => {
        if (!supabase) return;

        try {
            const { data: store, error: storeError } = await supabase
                .from('stores')
                .select('id')
                .eq('slug', storeSlug)
                .maybeSingle();

            if (storeError || !store) {
                console.error('Store not found for inventory addition:', storeSlug);
                return;
            }

            const { error } = await supabase
                .from('motorcycles')
                .insert({
                    store_id: store.id,
                    make: moto.make,
                    model: moto.model,
                    year: moto.year,
                    price: parseFloat(moto.price.replace(/\D/g, '')),
                    status: moto.status,
                    mileage: moto.km ? parseInt(moto.km.replace(/\D/g, '')) : 0,
                    color: moto.color,
                    description: moto.description,
                    features: moto.features,
                    images: moto.images.length > 0 ? moto.images : [moto.image],
                    condition: moto.condition,
                    has_warranty: moto.hasWarranty,
                    slug: `${moto.make}-${moto.model}-${Date.now()}`.toLowerCase()
                });

            if (error) {
                console.error('Error adding motorcycle:', error);
                throw error;
            }
        } catch (err) {
            console.error('Unexpected error in addMotorcycle:', err);
            throw err;
        }
    },

    updateMotorcycle: async (id: string, moto: Partial<Motorcycle>) => {
        if (!supabase) return;

        try {
            const updates: any = {};
            if (moto.make) updates.make = moto.make;
            if (moto.model) updates.model = moto.model;
            if (moto.year) updates.year = moto.year;
            if (moto.price) updates.price = parseFloat(moto.price.replace(/\D/g, ''));
            if (moto.status) updates.status = moto.status;
            if (moto.km) updates.mileage = parseInt(moto.km.replace(/\D/g, ''));
            if (moto.color) updates.color = moto.color;
            if (moto.description) updates.description = moto.description;
            if (moto.features) updates.features = moto.features;
            if (moto.images) updates.images = moto.images;
            if (moto.condition) updates.condition = moto.condition;
            if (moto.hasWarranty !== undefined) updates.has_warranty = moto.hasWarranty;

            const { error } = await supabase
                .from('motorcycles')
                .update(updates)
                .eq('id', id);

            if (error) {
                console.error('Error updating motorcycle:', error);
                throw error;
            }
        } catch (err) {
            console.error('Unexpected error in updateMotorcycle:', err);
            throw err;
        }
    },

    deleteMotorcycle: async (id: string | number) => {
        if (!supabase) return;
        const { error } = await supabase.from('motorcycles').delete().eq('id', id);
        if (error) throw error;
    },

    getStats: async (storeSlug: string) => {
        if (!supabase) return null;

        const { data: store, error: storeError } = await supabase
            .from('stores')
            .select('id')
            .eq('slug', storeSlug)
            .maybeSingle();

        if (storeError || !store) return null;

        const [invCount, leadCount] = await Promise.all([
            supabase.from('motorcycles').select('*', { count: 'exact', head: true }).eq('store_id', store.id),
            supabase.from('leads').select('*', { count: 'exact', head: true }).eq('store_id', store.id)
        ]);

        return {
            inventoryCount: invCount.count || 0,
            leadsCount: leadCount.count || 0,
            views: 0, // Resetting simulated data to real zero
            conversions: leadCount.count ? Math.floor((leadCount.count / 100) * 100) : 0
        };
    }
};

// Logic for lead management scoped by store
export const leadService = {
    getLeads: async (storeSlug: string) => {
        if (!supabase) return [];

        const { data: store, error: storeError } = await supabase
            .from('stores')
            .select('id')
            .eq('slug', storeSlug)
            .maybeSingle();

        if (storeError || !store) return [];

        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .eq('store_id', store.id)
            .order('created_at', { ascending: false });

        if (error) return [];
        return data.map(l => ({
            ...l,
            initials: l.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
        }));
    },

    createLead: async (storeSlug: string, lead: { name: string, phone: string, motorcycleId?: string | number, source: string }) => {
        if (!supabase) return;

        const { data: store, error: storeError } = await supabase
            .from('stores')
            .select('id')
            .eq('slug', storeSlug)
            .maybeSingle();

        if (storeError || !store) return;

        const { error } = await supabase
            .from('leads')
            .insert({
                store_id: store.id,
                motorcycle_id: typeof lead.motorcycleId === 'string' && lead.motorcycleId.length > 20 ? lead.motorcycleId : null,
                name: lead.name,
                phone: lead.phone,
                source: lead.source
            });

        if (error) throw error;
    }
};
