"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    ChevronRight,
    Share2,
    Heart,
    ShieldCheck,
    Zap,
    Info,
    Calendar,
    Gauge,
    Palette,
    ArrowLeft
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { storeService, inventoryService } from '@/lib/services/storeService';
import { useStoreTheme } from '@/lib/context/ThemeContext';
import Image from 'next/image';
import FinancingModal from '@/components/FinancingModal';

export default function MotorcycleDetailsPage() {
    const { slug, id } = useParams();
    const router = useRouter();
    const { theme } = useStoreTheme();
    const [activeImage, setActiveImage] = useState(0);
    const [moto, setMoto] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isFinancingModalOpen, setIsFinancingModalOpen] = useState(false);

    useEffect(() => {
        async function loadMoto() {
            if (!id) return;
            try {
                const data = await inventoryService.getMotorcycleById(id as string);
                setMoto(data);
            } catch (error) {
                console.error("Error loading motorcycle:", error);
            } finally {
                setLoading(false);
            }
        }
        loadMoto();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!moto) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-4">
                <h1 className="text-2xl font-black mb-4 italic uppercase">Motocicleta não encontrada</h1>
                <button
                    onClick={() => router.push(`/${slug}/estoque`)}
                    className="flex items-center gap-2 text-indigo-500 font-bold hover:gap-3 transition-all"
                >
                    <ArrowLeft className="w-4 h-4" /> Voltar ao estoque
                </button>
            </div>
        );
    }

    const images = moto.images && moto.images.length > 0 ? moto.images : [moto.image];

    return (
        <div className="pb-24 text-white">
            {/* Breadcrumbs */}
            <div className="container px-4 mx-auto py-6">
                <nav className="flex gap-4 text-xs font-bold uppercase tracking-wider text-white/30">
                    <button onClick={() => router.push(`/${slug}`)} className="hover:text-white transition-colors">Início</button>
                    <span>/</span>
                    <button onClick={() => router.push(`/${slug}/estoque`)} className="hover:text-white transition-colors">Estoque</button>
                    <span>/</span>
                    <span className="text-white/60">{moto.make} {moto.model}</span>
                </nav>
            </div>

            <div className="container px-4 mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Gallery Section */}
                <div className="lg:col-span-8 space-y-4">
                    <div className="relative aspect-[16/10] rounded-[2rem] overflow-hidden bg-zinc-900 border border-white/5 shadow-2xl">
                        <AnimatePresence mode="wait">
                            <motion.img
                                key={activeImage}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                                src={images[activeImage] || 'https://images.unsplash.com/photo-1558981403-c5f91cbba527?q=80&w=2070'}
                                className="w-full h-full object-cover"
                            />
                        </AnimatePresence>

                        {images.length > 1 && (
                            <div className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none">
                                <button
                                    onClick={() => setActiveImage(prev => prev > 0 ? prev - 1 : images.length - 1)}
                                    className="p-3 rounded-full bg-black/50 backdrop-blur-xl border border-white/10 text-white pointer-events-auto hover:bg-white hover:text-black transition-all"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <button
                                    onClick={() => setActiveImage(prev => prev < images.length - 1 ? prev + 1 : 0)}
                                    className="p-3 rounded-full bg-black/50 backdrop-blur-xl border border-white/10 text-white pointer-events-auto hover:bg-white hover:text-black transition-all"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </div>
                        )}
                    </div>

                    {images.length > 1 && (
                        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                            {images.map((img: string, i: number) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveImage(i)}
                                    className={`relative flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all ${activeImage === i ? 'border-indigo-500 scale-95' : 'border-transparent opacity-50 hover:opacity-100'}`}
                                >
                                    <img src={img} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Info Section */}
                <div className="lg:col-span-4 flex flex-col gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-full" style={{ color: theme.primaryColor, backgroundColor: `${theme.primaryColor}10` }}>
                                {moto.condition || 'Seminova'}
                            </span>
                            <div className="flex gap-2">
                                <button className="p-2 rounded-full border border-white/10 hover:bg-white/5 transition-colors"><Share2 className="w-4 h-4" /></button>
                                <button className="p-2 rounded-full border border-white/10 hover:bg-white/5 transition-colors"><Heart className="w-4 h-4" /></button>
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-[0.9]">
                            {moto.make} <br />
                            <span style={{ color: theme.primaryColor }}>{moto.model}</span>
                        </h1>
                        <div className="grid grid-cols-3 gap-1 border-y border-white/5 py-6">
                            <div className="text-center">
                                <Calendar className="w-5 h-5 mx-auto mb-2 text-white/20" />
                                <p className="text-lg font-bold">{moto.year}</p>
                                <p className="text-[10px] text-white/30 uppercase font-bold tracking-tighter">Ano</p>
                            </div>
                            <div className="text-center border-x border-white/5">
                                <Gauge className="w-5 h-5 mx-auto mb-2 text-white/20" />
                                <p className="text-lg font-bold">{moto.km || '0'}</p>
                                <p className="text-[10px] text-white/30 uppercase font-bold tracking-tighter">KM</p>
                            </div>
                            <div className="text-center">
                                <Palette className="w-5 h-5 mx-auto mb-2 text-white/20" />
                                <p className="text-lg font-bold truncate">{moto.color || 'N/A'}</p>
                                <p className="text-[10px] text-white/30 uppercase font-bold tracking-tighter">Cor</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 space-y-6">
                        <div>
                            <p className="text-[10px] text-white/40 uppercase font-black mb-1">Preço Especial</p>
                            <p className="text-5xl font-black tracking-tighter">
                                R$ {new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 0 }).format(Math.floor(Number(String(moto.price).replace(/\D/g, ''))))}
                            </p>
                            <p className="text-xs mt-2 font-bold tracking-tight inline-flex items-center gap-1" style={{ color: theme.primaryColor }}>
                                <Zap className="w-3 h-3 fill-current" /> Condições exclusivas de financiamento
                            </p>
                        </div>

                        <div className="space-y-3">
                            <a
                                href={`https://wa.me/${theme.whatsappNumber?.replace(/\D/g, '')}?text=Olá,%20tenho%20interesse%20na%20${moto.make}%20${moto.model}%20anunciada%20no%20site.`}
                                target="_blank"
                                className="w-full bg-white text-black py-4 rounded-2xl font-black text-center text-lg hover:scale-[1.02] transition-transform block"
                            >
                                Quero Proposta
                            </a>
                            <button
                                onClick={() => setIsFinancingModalOpen(true)}
                                className="w-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 py-4 rounded-2xl font-black text-lg hover:bg-indigo-500/20 transition-all flex items-center justify-center gap-2"
                                style={{ color: theme.primaryColor, borderColor: `${theme.primaryColor}20`, backgroundColor: `${theme.primaryColor}10` }}
                            >
                                Simular Financiamento
                            </button>
                        </div>

                        <div className="pt-4 flex items-center gap-4 text-xs text-white/40 font-medium">
                            <div className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-green-500" /> {moto.hasWarranty ? 'Garantia inclusa' : 'Procedência garantida'}</div>
                            <div className="flex items-center gap-1.5"><Info className="w-4 h-4 text-white/20" /> Vistoria cautelar</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Description & Features */}
            <div className="container px-4 mx-auto mt-20">
                <div className="max-w-4xl space-y-12">
                    {moto.description && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold tracking-tight uppercase italic mb-8">Descrição do Vendedor</h2>
                            <p className="text-white/60 leading-relaxed text-lg italic border-l-4 pl-8 py-2" style={{ borderColor: theme.primaryColor }}>
                                "{moto.description}"
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {moto.features && moto.features.length > 0 && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold uppercase italic">Destaques do Veículo</h3>
                                <ul className="space-y-4">
                                    {moto.features.map((feature: string, i: number) => (
                                        <li key={i} className="flex items-center gap-4 text-white/60 font-medium">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.primaryColor }} />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="bg-zinc-900 border border-white/5 rounded-3xl p-8 space-y-6">
                            <h3 className="text-xl font-bold uppercase italic">Localização</h3>
                            <div>
                                <p className="text-sm font-bold">{theme.name}</p>
                                <p className="text-sm text-white/40">{theme.address || 'Venha nos visitar'}</p>
                            </div>
                            <div className="h-40 bg-zinc-800 rounded-2xl flex items-center justify-center text-xs text-white/20 uppercase font-black italic tracking-widest text-center px-4">
                                Carregando mapa interativo...
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <FinancingModal
                isOpen={isFinancingModalOpen}
                onClose={() => setIsFinancingModalOpen(false)}
                motorcycle={moto}
                storeSlug={slug as string}
                primaryColor={theme.primaryColor}
                whatsappNumber={theme.whatsappNumber}
            />
        </div>
    );
}
