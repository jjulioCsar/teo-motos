"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStoreTheme } from '@/lib/context/ThemeContext';
import { supabase } from '@/lib/supabase';

export default function GestaoRootRedirect() {
    const router = useRouter();
    const { setEditMode } = useStoreTheme();
    const [status, setStatus] = useState('Iniciando...');
    const [debugInfo, setDebugInfo] = useState<string[]>([]);
    const [isErrored, setIsErrored] = useState(false);

    const addLog = (msg: string) => {
        console.log(`[Gestao Debug] ${msg}`);
        setDebugInfo(prev => [...prev, msg]);
        setStatus(msg);
    };

    useEffect(() => {
        let isStale = false;

        const checkSession = async () => {
            // Safety timeout: if it takes more than 5s, force a redirect or show error
            const timeoutId = setTimeout(() => {
                if (!isStale) {
                    addLog("⏳ Tempo de conexão excedido. Redirecionando para login...");
                    window.location.replace('/auth');
                }
            }, 5000);

            try {
                addLog("1. Verificando configuração do Supabase...");
                if (!supabase) {
                    addLog("❌ Erro: Supabase não inicializado nas variáveis de ambiente.");
                    setIsErrored(true);
                    clearTimeout(timeoutId);
                    // Wait 2s then redirect to auth
                    setTimeout(() => window.location.replace('/auth'), 2000);
                    return;
                }

                addLog("2. Solicitando sessão do Supabase...");
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    addLog(`❌ Erro de Sessão: ${error.message}`);
                    throw error;
                }

                if (session) {
                    addLog("3. Sessão encontrada! Ativando Modo Gestão...");
                    localStorage.setItem('jl_admin_session', 'true');

                    addLog("4. Redirecionando para a loja...");
                    clearTimeout(timeoutId);
                    window.location.replace('/teomotos?edit=true');
                } else {
                    addLog("3. Nenhuma sessão ativa. Redirecionando para Login...");
                    clearTimeout(timeoutId);
                    window.location.replace('/auth');
                }
            } catch (error: any) {
                addLog(`🔥 Erro crítico: ${error.message || 'Erro desconhecido'}`);
                setIsErrored(true);
                clearTimeout(timeoutId);
                setTimeout(() => window.location.replace('/auth'), 3000);
            }
        };

        checkSession();
        return () => { isStale = true; };
    }, []);

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-white font-sans">
            <div className="max-w-md w-full space-y-8 text-center">
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
                    <p className={`text-[10px] font-black uppercase tracking-widest ${isErrored ? 'text-red-400' : 'text-zinc-500'}`}>
                        {status}
                    </p>
                </div>

                <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 text-left font-mono">
                    <p className="text-[10px] text-zinc-600 mb-4 font-bold uppercase tracking-widest">Logs de Acesso:</p>
                    <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                        {debugInfo.map((log, i) => (
                            <p key={i} className="text-[9px] text-zinc-400 border-l-2 border-indigo-500/30 pl-3 py-1">
                                {log}
                            </p>
                        ))}
                    </div>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={() => window.location.replace('/auth')}
                        className="flex-1 py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                        Página de Login
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                        Tentar Novamente
                    </button>
                </div>
            </div>
        </div>
    );
}
