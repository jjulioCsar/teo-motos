"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStoreTheme } from '@/lib/context/ThemeContext';
import { inventoryService } from '@/lib/services/storeService';
import { PackageOpen, ArrowRight } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

export default function StorePage() {
    const params = useParams();
    const slug = (params?.slug as string) || 'teomotos';

    const { theme } = useStoreTheme();
    const [featured, setFeatured] = useState<any[]>([]);

    const router = useRouter();

    useEffect(() => {
        if (!slug) return;
        async function loadFeatured() {
            const data = await inventoryService.getInventory(slug as string);
            setFeatured(data.slice(0, 3));
        }
        loadFeatured();
    }, [slug]);

    const handleMotoClick = (moto: any) => {
        router.push(`/${slug}/moto/${moto.id}`);
    };

    return (
        <div className="relative text-white">
            {/* Hero Section */}
            <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black to-transparent z-10" />
                <div className="absolute inset-0 z-0">
                    <Image
                        src={theme.heroImage || 'https://images.unsplash.com/photo-1558981403-c5f91cbba527?q=80&w=2070'}
                        alt="Hero Background"
                        fill
                        className="object-cover transition-all duration-1000"
                        priority
                        unoptimized={theme.heroImage ? !theme.heroImage.includes('unsplash.com') : false}
                    />
                </div>

                <div className="absolute inset-0 z-[5] bg-black/60" />
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/40 to-transparent z-[6]" />
                <div className="absolute inset-0 z-[7] bg-gradient-to-b from-black/80 via-transparent to-transparent" />
                <div className="absolute inset-0 z-[8]" style={{ backgroundColor: `${theme.primaryColor}05` }} />

                <div className="container relative z-20 px-8 mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-6 inline-block px-6 py-2 rounded-full border border-white/10 bg-black/50 backdrop-blur-xl text-[10px] font-black uppercase tracking-[0.3em]"
                    >
                        {theme.navbarCta || 'Premium Motorcycle Marketplace'}
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85] italic mb-8"
                    >
                        {theme.heroTitle?.includes('?') ? (
                            <>
                                {theme.heroTitle.split('?')[0]} <br />
                                <span style={{ color: theme.primaryColor }}>
                                    {theme.heroTitle.split('?').slice(1).join(' ')}
                                </span>
                            </>
                        ) : (
                            <span style={{ color: theme.primaryColor }}>{theme.heroTitle || "Acelere seu Sonho"}</span>
                        )}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-medium"
                    >
                        {theme.heroSubTitle || `Encontre as melhores motos com garantia e procedência na ${theme.name}.`}
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <a
                            href={`/${slug}/estoque`}
                            className="bg-white text-black px-12 py-5 rounded-full text-sm font-black uppercase tracking-widest hover:scale-105 transition-transform inline-flex items-center gap-2 shadow-2xl"
                            style={{ boxShadow: `0 20px 50px ${theme.primaryColor}30` }}
                        >
                            Explorar Estoque <ArrowRight className="w-5 h-5" />
                        </a>
                    </motion.div>
                </div>
            </section>

            {/* Features Info */}
            <section className="py-24 bg-zinc-900/50">
                <div className="container px-8 mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
                    {[
                        { title: theme.feature1Title || 'Qualidade Garantida', desc: theme.feature1Desc || 'Todas as nossas motos passam por uma rigorosa vistoria técnica.' },
                        { title: theme.feature2Title || 'Financiamento Fácil', desc: theme.feature2Desc || 'As melhores taxas do mercado com aprovação rápida e sem burocracia.' },
                        { title: theme.feature3Title || 'Entrega Segura', desc: theme.feature3Desc || 'Receba sua nova conquista no conforto da sua casa com total segurança.' },
                    ].map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="space-y-4"
                        >
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white" style={{ backgroundColor: `${theme.primaryColor}20`, color: theme.primaryColor }}>
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
                                    <PackageOpen className="w-6 h-6" />
                                </motion.div>
                            </div>
                            <h3 className="text-xl font-black uppercase tracking-tighter italic">{feature.title}</h3>
                            <p className="text-white/40 text-sm font-medium leading-relaxed">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Featured Selection */}
            <section className="py-32 max-w-[1600px] px-8 mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
                    <div>
                        <h2 className="text-4xl font-black tracking-tighter uppercase italic mb-4" style={{ color: theme.primaryColor }}>
                            {theme.featuredTitle?.split('?')[0] || 'Destaques da Semana'}
                            {theme.featuredTitle?.includes('?') && (
                                <>
                                    <br />
                                    <span className="text-white">{theme.featuredTitle.split('?').slice(1).join(' ')}</span>
                                </>
                            )}
                        </h2>
                        <div className="w-20 h-2" style={{ backgroundColor: theme.primaryColor }} />
                        <p className="text-white/40 max-w-md font-medium">As melhores oportunidades selecionadas a dedo para pilotos exigentes.</p>
                    </div>
                    <a href={`/${slug}/estoque`} className="text-[10px] font-black uppercase tracking-widest border-b-2 border-white/10 hover:border-white transition-all pb-2">Ver estoque completo →</a>
                </div>

                {featured.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {featured.map((moto, i) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                key={moto.id}
                                onClick={() => handleMotoClick(moto)}
                                className="group relative rounded-[3rem] overflow-hidden bg-zinc-950 border border-white/5 aspect-[4/5] hover:border-white/20 transition-all cursor-pointer shadow-2xl"
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />
                                <img
                                    src={moto.image || `https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=2070`}
                                    alt={moto.model}
                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                />
                                <div className="absolute bottom-0 left-0 p-10 z-20 w-full group-hover:pb-12 transition-all duration-500">
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
                                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded bg-white/10" style={{ color: theme.primaryColor }}>
                                            {moto.fuelType || 'GASOLINA'}
                                        </span>
                                        <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
                                            {moto.color || 'PRETO'}
                                        </span>
                                        <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                                            {moto.year}
                                        </span>
                                    </div>
                                    <h3 className="text-3xl font-black mb-2 uppercase italic tracking-tighter leading-tight">{moto.model}</h3>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-6">{moto.km || '0'} KM</p>

                                    <div className="flex items-center justify-between">
                                        <p className="text-2xl font-black text-white italic" style={{ color: theme.primaryColor }}>
                                            R$ {new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 0 }).format(Math.floor(Number(String(moto.price).replace(/\D/g, ''))))}
                                        </p>
                                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-xl group-hover:bg-white group-hover:text-black transition-all">
                                            <ArrowRight className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 bg-zinc-900/30 rounded-[3rem] border border-dashed border-white/5 text-center">
                        <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-6 text-zinc-700">
                            <PackageOpen className="w-8 h-8" />
                        </div>
                        <p className="text-white/40 font-bold uppercase text-xs tracking-widest">Nenhuma motocicleta em destaque</p>
                    </div>
                )}
            </section>

            {/* About Teaser */}
            <section className="py-32 container px-8 mx-auto border-t border-white/5">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div className="relative aspect-video rounded-[3rem] overflow-hidden bg-zinc-900 border border-white/5 flex items-center justify-center">
                        <img
                            src={theme.aboutImage || "https://images.unsplash.com/photo-1558981453-22fab9ec0309?q=80&w=2070"}
                            className="w-full h-full object-cover grayscale opacity-50"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent" />
                    </div>
                    <div className="space-y-8">
                        <h2 className="text-5xl font-black uppercase italic tracking-tighter leading-none">
                            {theme.aboutTeaserTitle || "Paixão por Duas Rodas"}
                        </h2>
                        <p className="text-white/60 font-medium leading-relaxed">
                            {theme.aboutTeaserText || `Na curadoria da nossa loja selecionamos apenas máquinas impecáveis para garantir que sua única preocupação seja o destino.`}
                        </p>
                        <div className="p-8 bg-zinc-900/50 rounded-[2.5rem] border border-white/5 space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Onde estamos</p>
                            <p className="text-lg font-bold">{theme.address || 'Venha nos visitar em Maceió, AL'}</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
