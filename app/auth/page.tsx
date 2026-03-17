"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
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

                // Tentar encontrar loja pelo ID do dono
                const { data: store } = await supabase
                    .from('stores')
                    .select('slug')
                    .eq('owner_id', userId)
                    .maybeSingle();

                // Activate admin session
                localStorage.setItem('jl_admin_session', 'true');

                // Use window.location for full page reload (refreshes server cookies for middleware)
                const targetSlug = store?.slug || 'teomotos';
                window.location.href = `/${targetSlug}?edit=true`;
                return; // Stop execution — page is navigating
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
                    localStorage.setItem('jl_admin_session', 'true');
                    window.location.href = `/teomotos?edit=true`;
                    return;
                } else {
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
                </div>
            </div>
        </div>
    );
}
