"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { storeService, Store } from '@/lib/services/storeService';

type ThemeContextType = {
    theme: Store;
    updateTheme: (newTheme: Partial<Store>) => void;
    setThemeBySlug: (slug: string) => Promise<void>;
    isEditMode: boolean;
    setEditMode: (mode: boolean) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const params = useParams();
    const slug = params?.slug as string;

    // Initial state setup
    const [theme, setTheme] = useState<Store>(() => {
        // SSR safe initial state - will be hydrated in useEffect
        return {
            slug: slug || 'teomotos',
            name: 'TEOMOTOS',
            logo: 'https://litzlvhlmaqcgszkwbdz.supabase.co/storage/v1/object/public/images/gdfa7647khi_1770915739568.png',
            primaryColor: '#fec806',
            secondaryColor: '#ffc800',
            tertiaryColor: '#ffc800',
            whatsappNumber: '(82) 99921-0317',
            whatsappMessage: 'Olá! Vim pelo site da Teo Motos.',
            address: 'Maceió, AL',
            isDarkMode: true,
            showFinancing: true,
            aboutText: '',
            aboutImage: '',
            heroTitle: 'sua proxima moto esta na teo motos',
            heroSubTitle: '',
            heroImage: 'https://litzlvhlmaqcgszkwbdz.supabase.co/storage/v1/object/public/images/53ox8xv53h_1770915631908.jpeg',
            mapUrl: 'https://maps.google.com/maps?q=TEOMOTOS%20-%20Salvador%20lyra%20-%20R.%20Des.%20Carlos%20de%20Gusm%C3%A3o%20-%20Antares%2C%20Macei%C3%B3%20-%20A&t=&z=16&ie=UTF8&iwloc=&output=embed',
            instagram: 'https://www.instagram.com/teomotos1/',
            facebook: '',
            email: 'teomotos@gmail.com',
            financingText: '',
            navbarCta: 'TÁ ESPERANDO OQUE PARA COMPRAR A SUA?',
            contactTitle: 'Fale Conosco',
            contactSubtitle: 'ENTRE EM CONTATO COM NOSSA EQUIPE!',
            addressTitle: 'Nossa Loja',
            addressDescription: 'Venha nos visitar',
            channelsTitle: 'Canais de Atendimento',
            channelsDescription: 'Tire suas dúvidas',
            hoursTitle: 'Horários',
            hoursDescription: 'Segunda a Sábado',
            hoursWeekdays: '08:00 - 18:00',
            hoursSaturday: '08:00 - 13:00',
            feature1Title: 'Procedência',
            feature1Desc: 'Motos revisadas e com garantia',
            feature2Title: 'Facilidade',
            feature2Desc: 'Financiamento simplificado',
            feature3Title: 'Confiança',
            feature3Desc: 'Anos de mercado',
            featuredTitle: 'Destaques',
            aboutTeaserTitle: 'Sobre a Teo Motos',
            aboutTeaserText: 'Referência em motocicletas.',
            financingTitle: 'Simule Agora',
            financingSubtitle: 'É rápido e fácil',
            financingHeroImage: 'https://litzlvhlmaqcgszkwbdz.supabase.co/storage/v1/object/public/images/nu7llieeuqg_1771521616043.jpg',
            financingMainTitle: 'Seu sonho mais perto',
            financingSecondaryImage: 'https://litzlvhlmaqcgszkwbdz.supabase.co/storage/v1/object/public/images/e2qqprivsyr_1771521631253.jpg',
        };
    });

    const [isEditMode, _setEditMode] = useState(false);

    // Persist edit mode in localStorage
    const setEditMode = (mode: boolean) => {
        _setEditMode(mode);
        if (mode) {
            localStorage.setItem('jl_admin_session', 'true');
        } else {
            localStorage.removeItem('jl_admin_session');
        }
    };

    // Robust fetch by slug that can be triggered explicitly
    const setThemeBySlug = async (targetSlug: string) => {
        if (!targetSlug || targetSlug === 'default' || targetSlug === theme.slug) return;

        try {
            const store = await storeService.getStoreBySlug(targetSlug);
            if (store) {
                setTheme(store);
            }
        } catch (error: any) {
            if (error.name === 'AbortError') return;
            console.error("Erro ao sincronizar tema por slug:", error);
        }
    };

    // Load initial edit mode
    useEffect(() => {
        const session = localStorage.getItem('jl_admin_session');
        if (session === 'true') {
            _setEditMode(true);
        }
    }, []);

    // Sync theme with the current slug or logged-in user
    useEffect(() => {
        let isAborted = false;

        // 1. Initial Load
        async function loadStore() {
            try {
                if (slug && slug !== 'default') {
                    const store = await storeService.getStoreBySlug(slug);
                    if (isAborted) return;
                    if (store) setTheme(store);
                } else if (supabase) {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (isAborted) return;

                    if (session?.user) {
                        const store = await storeService.getStoreByOwner(session.user.id);
                        if (isAborted) return;
                        if (store) setTheme(store);
                    }
                }
            } catch (error: any) {
                if (error.name === 'AbortError') return;
                console.error("Erro ao carregar loja:", error);
            }
        }

        loadStore();

        // 2. Listen for Auth Changes (Login/Logout)
        if (!slug && supabase) {
            const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
                if (isAborted) return;
                try {
                    if (session?.user) {
                        const store = await storeService.getStoreByOwner(session.user.id);
                        if (isAborted) return;
                        if (store) setTheme(store);
                    }
                } catch (error: any) {
                    if (error.name === 'AbortError') return;
                    console.error("Erro na mudança de auth:", error);
                }
            });

            return () => {
                isAborted = true;
                subscription.unsubscribe();
            };
        }

        return () => {
            isAborted = true;
        };
    }, [slug]);

    const updateTheme = async (newTheme: Partial<Store>) => {
        setTheme((prev) => {
            const updated = { ...prev, ...newTheme };
            // Fire and forget to Supabase (or handle error if preferred)
            storeService.saveStore(theme.slug || 'default', newTheme).catch(console.error);
            return updated;
        });
    };

    const contextValue = useMemo(() => ({
        theme,
        updateTheme,
        setThemeBySlug,
        isEditMode,
        setEditMode
    }), [theme, isEditMode]);

    return (
        <ThemeContext.Provider value={contextValue}>
            <div
                style={{
                    // @ts-ignore
                    '--primary': theme.primaryColor,
                    '--primary-foreground': '#ffffff'
                }}
                className={theme.isDarkMode ? 'dark' : ''}
            >
                {children}
            </div>
        </ThemeContext.Provider>
    );
}

export const useStoreTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useStoreTheme must be used within a ThemeProvider');
    return context;
};
