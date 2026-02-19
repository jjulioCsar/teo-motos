"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, Globe, MapPin, Check, Rocket, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { storeService } from '@/lib/services/storeService';

const STEPS = ['Sobre a Loja', 'Endereço', 'Finalizar'];

function CreateStoreContent() {
    const [step, setStep] = useState(0);
    const [slug, setSlug] = useState('');
    const [loadingCep, setLoadingCep] = useState(false);

    const [address, setAddress] = useState({
        cep: '',
        street: '',
        neighborhood: '',
        city: '',
        state: '',
        number: ''
    });

    const searchParams = useSearchParams();
    const router = useRouter();
    const initialSlug = searchParams.get('slug') || '';

    useEffect(() => {
        if (initialSlug) setSlug(initialSlug);
    }, [initialSlug]);

    const handleCepLookup = async (cep: string) => {
        const cleanCep = cep.replace(/\D/g, '');
        if (cleanCep.length !== 8) return;

        setLoadingCep(true);
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
            const data = await response.json();

            if (!data.erro) {
                setAddress(prev => ({
                    ...prev,
                    street: data.logradouro,
                    neighborhood: data.bairro,
                    city: data.localidade,
                    state: data.uf,
                    cep: data.cep
                }));
            }
        } catch (error) {
            console.error("Erro ao buscar CEP:", error);
        } finally {
            setLoadingCep(false);
        }
    };

    const handleLaunch = async () => {
        try {
            if (!slug) return;
            await storeService.saveStore(slug, {
                name: slug.replace(/-/g, ' ').toUpperCase(),
                address: `${address.street}, ${address.number} - ${address.neighborhood}, ${address.city} - ${address.state}, ${address.cep}`,
                whatsappNumber: '5582999999999',
                whatsappMessage: 'Olá! Vim pelo site.',
                primaryColor: '#6366f1',
                secondaryColor: '#4f46e5',
                tertiaryColor: '#ef4444',
                isDarkMode: true
            });
            router.push(`/${slug}/gestao`);
        } catch (error: any) {
            console.error("Erro ao criar loja (Message):", error?.message);
            console.error("Erro ao criar loja (Full):", JSON.stringify(error, null, 2));
            alert(`Erro ao criar loja: ${error?.message || 'Erro desconhecido'}`);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center px-4 relative">
            {/* Background */}
            <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-indigo-600/10 to-transparent" />

            <div className="w-full max-w-2xl relative z-10">
                <div className="mb-12 flex justify-between items-center text-zinc-500">
                    {STEPS.map((s, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= i ? 'bg-white text-black' : 'bg-zinc-900 border border-white/5'
                                }`}>
                                {step > i ? <Check className="w-4 h-4" /> : i + 1}
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest hidden md:block ${step >= i ? 'text-white' : 'text-zinc-600'
                                }`}>
                                {s}
                            </span>
                            {i < STEPS.length - 1 && <div className="w-8 h-[1px] bg-white/5 mx-2" />}
                        </div>
                    ))}
                </div>

                <div className="bg-zinc-900/80 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-12 shadow-2xl">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.02 }}
                            className="space-y-8"
                        >
                            {step === 0 && (
                                <div className="space-y-8">
                                    <div>
                                        <h2 className="text-3xl font-black tracking-tighter mb-2">Qual o nome do seu império?</h2>
                                        <p className="text-zinc-500">Isso será o coração da sua marca na plataforma.</p>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-4">Nome da Concessionária</label>
                                            <div className="relative">
                                                <Store className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                                                <input
                                                    type="text"
                                                    value={slug.replace(/-/g, ' ')}
                                                    placeholder="Ex: Minha Concessionária"
                                                    className="w-full bg-black/40 border border-white/5 rounded-3xl py-5 pl-14 pr-8 outline-none focus:border-white/20 transition-all font-bold text-lg"
                                                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/ /g, '-').normalize("NFD").replace(/[\u0300-\u031f]/g, ""))}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-4">Link da sua loja (URL)</label>
                                            <div className="relative">
                                                <Globe className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                                                <div className="flex items-center w-full bg-black/40 border border-white/5 rounded-3xl py-5 pl-14 pr-8">
                                                    <span className="text-zinc-500 font-medium">jl-system.com.br/</span>
                                                    <span className="font-black text-indigo-400">{slug || 'sua-loja'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 1 && (
                                <div className="space-y-8">
                                    <div>
                                        <h2 className="text-3xl font-black tracking-tighter mb-2">Onde os clientes te encontram?</h2>
                                        <p className="text-zinc-500">Localização ajuda a gerar confiança local.</p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-4">CEP</label>
                                            <div className="relative mt-1">
                                                <input
                                                    type="text"
                                                    placeholder="00000-000"
                                                    value={address.cep}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setAddress(prev => ({ ...prev, cep: val }));
                                                        if (val.replace(/\D/g, '').length === 8) handleCepLookup(val);
                                                    }}
                                                    className="w-full bg-black/40 border border-white/5 rounded-3xl py-5 px-8 outline-none focus:border-white/20 transition-all font-bold text-lg"
                                                />
                                                {loadingCep && <Loader2 className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500 animate-spin" />}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-12 gap-4">
                                            <div className="col-span-8 space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-4">Logradouro</label>
                                                <input
                                                    type="text"
                                                    value={address.street}
                                                    onChange={(e) => setAddress(prev => ({ ...prev, street: e.target.value }))}
                                                    placeholder="Rua, Avenida..."
                                                    className="w-full bg-black/40 border border-white/5 rounded-3xl py-5 px-8 outline-none focus:border-white/20 transition-all font-bold"
                                                />
                                            </div>
                                            <div className="col-span-4 space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-4">Número</label>
                                                <input
                                                    type="text"
                                                    value={address.number}
                                                    onChange={(e) => setAddress(prev => ({ ...prev, number: e.target.value }))}
                                                    placeholder="123"
                                                    className="w-full bg-black/40 border border-white/5 rounded-3xl py-5 px-8 outline-none focus:border-white/20 transition-all font-bold"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-4">Bairro</label>
                                                <input
                                                    type="text"
                                                    value={address.neighborhood}
                                                    onChange={(e) => setAddress(prev => ({ ...prev, neighborhood: e.target.value }))}
                                                    placeholder="Seu Bairro"
                                                    className="w-full bg-black/40 border border-white/5 rounded-3xl py-5 px-8 outline-none focus:border-white/20 transition-all font-bold"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-4">Cidade</label>
                                                <input
                                                    type="text"
                                                    value={address.city}
                                                    readOnly
                                                    className="w-full bg-black/40 border border-white/5 rounded-3xl py-5 px-8 outline-none font-bold text-zinc-500 cursor-not-allowed"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-4">Estado (UF)</label>
                                            <input
                                                type="text"
                                                value={address.state}
                                                readOnly
                                                className="w-full bg-black/40 border border-white/5 rounded-3xl py-5 px-8 outline-none font-bold text-zinc-500 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="text-center py-12 space-y-6">
                                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-white/10">
                                        <Rocket className="w-10 h-10 text-black animate-bounce" />
                                    </div>
                                    <div>
                                        <h2 className="text-4xl font-black tracking-tighter mb-2">Tudo Pronto!</h2>
                                        <p className="text-zinc-500 max-w-xs mx-auto">Sua loja premium está prestes a entrar em órbita.</p>
                                    </div>
                                    <div className="bg-black/40 border border-white/5 rounded-3xl p-6 text-left">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-2">Resumo da Inauguração</p>
                                        <p className="text-xl font-bold uppercase tracking-tighter">{slug.replace(/-/g, ' ') || 'Minha Loja'}</p>
                                        <p className="text-sm text-zinc-500">{address.city} - {address.state}</p>
                                        <p className="text-xs text-zinc-600 mt-1">{address.street}, {address.number}</p>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    <div className="mt-12 pt-8 border-t border-white/5 flex gap-4">
                        {step > 0 && (
                            <button
                                onClick={() => setStep(prev => prev - 1)}
                                className="flex-1 py-4 border border-white/10 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/5 transition-all"
                            >
                                <ArrowLeft className="w-4 h-4" /> Voltar
                            </button>
                        )}
                        <button
                            onClick={() => step < 2 ? setStep(prev => prev + 1) : handleLaunch()}
                            className="flex-[2] bg-white text-black py-4 rounded-2xl font-black text-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 shadow-xl shadow-white/10"
                        >
                            {step === 2 ? 'Lançar Loja' : 'Continuar'} <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CreateStoreWizard() {
    return (
        <React.Suspense fallback={<div className="min-h-screen bg-zinc-950 flex items-center justify-center"><Loader2 className="w-10 h-10 text-indigo-600 animate-spin" /></div>}>
            <CreateStoreContent />
        </React.Suspense>
    );
}
