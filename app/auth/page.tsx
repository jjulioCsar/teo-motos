"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Github, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/lib/context/ToastContext';

export default function AuthPage() {
    const [mode, setMode] = useState<'signin' | 'signup'>('signin');
    const { addToast } = useToast();
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        if (!supabase) {
            setError("Erro de conexão com o servidor. Tente novamente mais tarde.");
            setIsLoading(false);
            return;
        }

        try {
            if (mode === 'signin') {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) {
                    if (error.message.includes('Invalid login credentials')) {
                        throw new Error("Senha incorreta ou usuário inexistente. Se nunca criou conta aqui, use a aba 'CRIAR CONTA' primeiro.");
                    }
                    throw error;
                }

                const userId = data.user.id;
                const userEmail = data.user.email;

                // 1. Tentar encontrar loja pelo ID do dono (Link correto)
                let { data: store, error: fetchError } = await supabase
                    .from('stores')
                    .select('slug')
                    .eq('owner_id', userId)
                    .maybeSingle();

                if (fetchError) {
                    console.error("Erro ao buscar loja por ID:", fetchError.message);
                }

                // 2. Se não achar pelo ID, tentar pelo Email (Recuperação de conexão)
                if (!store && userEmail) {
                    console.log("Loja não encontrada pelo ID. Tentando vincular pelo email:", userEmail);

                    // NEW: Use Secure RPC to bypass RLS and link store
                    const { error: rpcError } = await supabase.rpc('claim_store_by_email');

                    if (!rpcError) {
                        console.log("Loja vinculada com sucesso via RPC!");
                        // Fetch the store again to confirm and get data
                        const { data: storeRefetched } = await supabase
                            .from('stores')
                            .select('slug')
                            .eq('owner_id', userId)
                            .single();

                        if (storeRefetched) {
                            store = storeRefetched;
                        }
                    } else {
                        console.error("Erro ao vincular loja via RPC:", rpcError.message || rpcError);
                    }
                }

                if (store) {
                    // Activate admin session for the local context
                    localStorage.setItem('jl_admin_session', 'true');

                    // Redirect to the store-specific management route
                    // STRICT SINGLE TENANT: Always go to teomotos
                    // Redirect to the site with edit flag
                    router.push(`/teomotos?edit=true`);
                } else {
                    // ... (no changes to else)
                    console.error("Store not found for this user");
                    addToast('Loja não encontrada para este usuário.', 'error');
                }
            } else {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                        },
                    },
                });

                if (error) throw error;

                if (data.session) {
                    // Check logic for auto-linking on signup as well
                    const userId = data.session.user.id;
                    const userEmail = data.session.user.email;

                    if (userEmail) {
                        const { error: rpcError } = await supabase.rpc('claim_store_by_email');

                        // Just redirect to site with edit flag
                        router.push(`/teomotos?edit=true`);
                    }
                } else {
                    // Email confirmation case (if enabled)
                    addToast('Verifique seu email para confirmar o cadastro!', 'info');
                    setMode('signin');
                }
            }
        } catch (err: any) {
            console.error("Auth error:", err);
            setError(err.message === 'Invalid login credentials' ? 'Email ou senha incorretos.' : err.message || 'Ocorreu um erro.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-0 -left-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-0 -right-20 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-black tracking-tighter mb-2 italic">JL System</h1>
                    <p className="text-zinc-500 font-medium">
                        {mode === 'signin' ? 'Bem-vindo de volta, piloto.' : 'Comece sua jornada digital hoje.'}
                    </p>
                </div>

                <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-10 shadow-2xl">
                    <div className="flex bg-black/50 p-1 rounded-2xl mb-8">
                        <button
                            onClick={() => { setMode('signin'); setError(null); }}
                            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${mode === 'signin' ? 'bg-white text-black' : 'text-zinc-500'}`}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => { setMode('signup'); setError(null); }}
                            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${mode === 'signup' ? 'bg-white text-black' : 'text-zinc-500'}`}
                        >
                            Criar Conta
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold p-4 rounded-xl text-center">
                                {error}
                            </div>
                        )}

                        {mode === 'signup' && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Nome Completo</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                    <input
                                        type="text"
                                        placeholder="Seu nome"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required={mode === 'signup'}
                                        className="w-full bg-black/50 border border-white/5 rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-indigo-500/50 transition-all font-medium"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Email Profissional</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                <input
                                    type="email"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    className="w-full bg-black/50 border border-white/5 rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-indigo-500/50 transition-all font-medium disabled:opacity-50"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    className="w-full bg-black/50 border border-white/5 rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-indigo-500/50 transition-all font-medium disabled:opacity-50"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white py-4 rounded-2xl font-black text-lg transition-all shadow-xl shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Processando...
                                </>
                            ) : (
                                <>
                                    {mode === 'signin' ? 'Entrar' : 'Cadastrar'} <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-white/5 text-center">
                        <p className="text-xs text-zinc-600 mb-6 font-bold uppercase tracking-widest">Ou continue com</p>
                        <div className="grid grid-cols-2 gap-4">
                            <button className="flex items-center justify-center gap-2 py-3 border border-white/5 rounded-xl hover:bg-white/5 transition-all text-sm font-bold">
                                <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                                Google
                            </button>
                            <button className="flex items-center justify-center gap-2 py-3 border border-white/5 rounded-xl hover:bg-white/5 transition-all text-sm font-bold">
                                <Github className="w-4 h-4" /> Github
                            </button>
                        </div>
                    </div>
                </div>

                <p className="mt-8 text-center text-xs text-zinc-600 font-medium">
                    Ao continuar, você concorda com nossos <a href="#" className="underline">Termos de Uso</a> e <a href="#" className="underline">Privacidade</a>.
                </p>
            </div>
        </div>
    );
}
