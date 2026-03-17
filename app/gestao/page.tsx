"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function GestaoRootRedirect() {
    const router = useRouter();
    const [status, setStatus] = useState('Verificando sessão...');
    const [isErrored, setIsErrored] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const checkAndRedirect = async () => {
            // Safety timeout
            const timeout = setTimeout(() => {
                if (!cancelled) {
                    setStatus('Tempo excedido. Redirecionando...');
                    window.location.replace('/auth');
                }
            }, 6000);

            try {
                if (!supabase) {
                    setStatus('Erro de configuração. Redirecionando...');
                    setIsErrored(true);
                    clearTimeout(timeout);
                    setTimeout(() => window.location.replace('/auth'), 1500);
                    return;
                }

                const { data: { user }, error } = await supabase.auth.getUser();

                if (cancelled) return;
                clearTimeout(timeout);

                if (error || !user) {
                    setStatus('Sessão expirada. Faça login novamente.');
                    localStorage.removeItem('jl_admin_session');
                    setTimeout(() => window.location.replace('/auth'), 1000);
                    return;
                }

                // Session valid — activate admin mode and redirect
                setStatus('Sessão válida! Redirecionando...');
                localStorage.setItem('jl_admin_session', 'true');
                window.location.replace('/teomotos?edit=true');
            } catch (err: any) {
                if (cancelled) return;
                clearTimeout(timeout);
                setStatus(`Erro: ${err.message || 'Falha na conexão'}`);
                setIsErrored(true);
                setTimeout(() => window.location.replace('/auth'), 2000);
            }
        };

        checkAndRedirect();
        return () => { cancelled = true; };
    }, []);

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-white font-sans">
            <div className="max-w-sm w-full space-y-8 text-center">
                <div className="flex justify-center">
                    {isErrored ? (
                        <div className="w-12 h-12 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center border border-red-500/50">
                            <span className="text-2xl font-bold">!</span>
                        </div>
                    ) : (
                        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    )}
                </div>
                <div className="space-y-2">
                    <h1 className="text-xl font-black uppercase tracking-tighter italic">Acessando Gestão</h1>
                    <p className={`text-xs font-bold uppercase tracking-widest ${isErrored ? 'text-red-400' : 'text-zinc-500'}`}>
                        {status}
                    </p>
                </div>
                <button
                    onClick={() => window.location.replace('/auth')}
                    className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                    Ir para Login
                </button>
            </div>
        </div>
    );
}
