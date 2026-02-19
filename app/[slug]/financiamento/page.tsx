"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useStoreTheme } from '@/lib/context/ThemeContext';
import { Landmark, Calculator, Receipt, Clock, CheckCircle2, ArrowRight } from 'lucide-react';

export default function FinancingPage() {
    const { theme } = useStoreTheme();

    const benefits = [
        { icon: <Landmark />, title: "Parcerias Bancárias", desc: "Trabalhamos com os principais bancos do país para garantir a menor taxa." },
        { icon: <Clock />, title: "Aprovação Rápida", desc: "Análise de crédito simplificada com retorno em até 30 minutos." },
        { icon: <CheckCircle2 />, title: "Sem Burocracia", desc: "Processo digital e ágil, focado em colocar você logo na estrada." },
        { icon: <Receipt />, title: "Parcelas Fixas", desc: "Trabalhamos com parcelamento em até 48x com taxas pré-fixadas." }
    ];

    return (
        <div className="pb-32 text-white">
            {/* Hero Section */}
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black to-transparent z-10" />
                <div className="absolute inset-0 z-0">
                    <img
                        src={theme.financingHeroImage || "https://images.unsplash.com/photo-1558981285-6f0c94958bb6?q=80&w=2070"}
                        alt="Financing Background"
                        className="w-full h-full object-cover grayscale opacity-20"
                    />
                </div>

                <div className="container relative z-20 px-8 mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-8 px-6 py-2 rounded-full border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400"
                        style={{ color: theme.primaryColor }}
                    >
                        {theme.financingTitle || "Facilidade e Agilidade"}
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85] italic mb-8"
                    >
                        {theme.financingSubtitle?.includes('?') ? (
                            <>
                                {theme.financingSubtitle.split('?')[0]} <br />
                                <span style={{ color: theme.primaryColor }}>
                                    {theme.financingSubtitle.split('?').slice(1).join(' ')}
                                </span>
                            </>
                        ) : (
                            <span style={{ color: theme.primaryColor }}>{theme.financingSubtitle || "Sua Próxima Conquista"}</span>
                        )}
                    </motion.h1>
                </div>
            </section>

            {/* Steps Section */}
            <section className="container px-8 mx-auto -mt-20 relative z-30">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {benefits.map((benefit, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-zinc-900/80 backdrop-blur-2xl border border-white/10 p-10 rounded-[3rem] space-y-6"
                        >
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white" style={{ backgroundColor: `${theme.primaryColor}20`, color: theme.primaryColor }}>
                                {benefit.icon}
                            </div>
                            <h3 className="text-xl font-bold uppercase italic tracking-tighter">{benefit.title}</h3>
                            <p className="text-white/40 text-sm font-medium leading-relaxed">{benefit.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Main Content */}
            <section className="container px-8 mx-auto py-32 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                <div className="space-y-12">
                    <div className="space-y-6">
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none mb-6" style={{ color: theme.primaryColor }}>
                            {theme.financingMainTitle?.includes('?') ? (
                                <>
                                    {theme.financingMainTitle.split('?')[0]} <br />
                                    <span className="text-white">
                                        {theme.financingMainTitle.split('?').slice(1).join(' ')}
                                    </span>
                                </>
                            ) : (
                                theme.financingMainTitle || "Condições Especiais"
                            )}
                        </h2>
                        <div className="text-white/60 text-lg font-medium leading-relaxed space-y-6">
                            {theme.financingText ? (
                                <p className="italic border-l-4 pl-8" style={{ borderColor: theme.primaryColor }}>"{theme.financingText}"</p>
                            ) : (
                                <>
                                    <p>Na {theme.name}, facilitamos o caminho entre você e sua próxima aventura. Com parcerias consolidadas com bancos como Santander, Bradesco, Itaú e BV Financeira, oferecemos taxas competitivas e parcelamentos flexíveis.</p>
                                    <p>Seja para uso profissional ou lazer, temos o plano de financiamento ideal para o seu perfil de crédito, com ou sem entrada em diversos casos.</p>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="bg-zinc-900 border border-white/5 rounded-[3rem] p-10 space-y-8">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center text-green-500">
                                <Calculator className="w-8 h-8" />
                            </div>
                            <div>
                                <h4 className="text-xl font-bold uppercase italic">Simulação em tempo real</h4>
                                <p className="text-white/40 text-sm">Fale com nossos especialistas agora.</p>
                            </div>
                        </div>
                        <a
                            href={`https://wa.me/${theme.whatsappNumber?.replace(/\D/g, '')}?text=Olá,%20gostaria%20de%20fazer%20uma%20simulação%20de%20financiamento.`}
                            target="_blank"
                            className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase tracking-widest text-center flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors"
                        >
                            Fazer Simulação Agora <ArrowRight className="w-5 h-5" />
                        </a>
                    </div>
                </div>

                <div className="relative aspect-square">
                    <div className="absolute inset-0 bg-indigo-500/20 blur-[120px] rounded-full animate-pulse" style={{ backgroundColor: `${theme.primaryColor}20` }} />
                    <img
                        src={theme.financingSecondaryImage || "https://images.unsplash.com/photo-1444491741275-3747c53c99b4?q=80&w=1974"}
                        alt="Rider"
                        className="relative z-10 w-full h-full object-cover rounded-[4rem] border border-white/10"
                    />
                </div>
            </section>
        </div>
    );
}
