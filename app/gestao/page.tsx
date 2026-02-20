"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStoreTheme } from '@/lib/context/ThemeContext';
import { supabase } from '@/lib/supabase';

export default function GestaoRootRedirect() {
    const router = useRouter();
    const { setEditMode } = useStoreTheme();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            if (!supabase) return;
            const { data: { session } } = await supabase.auth.getSession();

            if (session) {
                // Activate Edit Mode in Context and LocalStorage
                setEditMode(true);

                // Redirect directly to the storefront (teomotos)
                // Using the specific slug for this tenant
                router.push('/teomotos');
            } else {
                router.push('/auth');
            }
            setIsLoading(false);
        };

        checkSession();
    }, [router, setEditMode]);

    return (
        <div className="min-h-screen bg-black flex items-center justify-center text-white">
            {isLoading && (
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Acessando Gestão...</p>
                </div>
            )}
        </div>
    );
}
