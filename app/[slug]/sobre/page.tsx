"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useStoreTheme } from '@/lib/context/ThemeContext';
import { Shield, Users, Heart, Award } from 'lucide-react';

export default function AboutPage() {
    const { theme } = useStoreTheme();

    return (
        <div className="pb-32 text-white">
            {/* Hero Section */}
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src={theme.aboutImage || "https://images.unsplash.com/photo-1558981453-22fab9ec0309?q=80&w=2070"}
                        className="w-full h-full object-cover grayscale opacity-40"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                </div>

                <div className="container relative z-10 px-8 mx-auto text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic mb-6 leading-tight"
                    >
                        {theme.aboutSubtitle?.includes('?') ? (
                            <>
                                {theme.aboutSubtitle.split('?')[0]} <br />
                                <span style={{ color: theme.primaryColor }}>
                                    {theme.aboutSubtitle.split('?').slice(1).join(' ')}
                                </span>
                            </>
                        ) : (
                            <span style={{ color: theme.primaryColor }}>{theme.aboutSubtitle || "Nossa História"}</span>
                        )}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-white/60 text-xl max-w-2xl mx-auto font-medium"
                    >
                        {theme.aboutSubtitle?.includes('?') ? "" : (theme.aboutSubtitle || `Conheça a trajetória da ${theme.name} e nossa paixão por entregar excelência em duas rodas.`)}
                    </motion.p>
                </div>
            </section>

            {/* Content Section */}
            <section className="container px-8 mx-auto mt-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
                    <div className="space-y-8">
                        <div className="inline-block px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-[0.3em] text-white">
                            Desde 2012
                        </div>
                        <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none">
                            Mais que uma loja,<br />
                            <span style={{ color: theme.primaryColor }}>Um estilo de vida</span>
                        </h2>
                        <div className="space-y-6 text-white/60 text-lg leading-relaxed font-medium">
                            {theme.aboutParagraphs && theme.aboutParagraphs.length > 0 ? (
                                theme.aboutParagraphs.map((p: string, i: number) => (
                                    <p key={i}>{p}</p>
                                ))
                            ) : (
                                <>
                                    <p>
                                        A {theme.name} nasceu do desejo de conectar motociclistas às máquinas dos seus sonhos. Entendemos que cada moto carrega uma história e uma promessa de liberdade.
                                    </p>
                                    <p>
                                        Ao longo dos anos, nos tornamos referência em Maceió pela qualidade do nosso estoque e pela transparência em cada negociação. Cada veículo que entra em nosso showroom passa por uma curadoria rigorosa.
                                    </p>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {[
                            { icon: <Shield />, title: "Segurança", desc: "Processos 100% transparentes e documentação garantida." },
                            { icon: <Users />, title: "Comunidade", desc: "Mais que clientes, formamos uma família de apaixonados." },
                            { icon: <Heart />, title: "Paixão", desc: "Amamos o que fazemos e isso reflete em cada atendimento." },
                            { icon: <Award />, title: "Qualidade", desc: "Apenas o melhor do mercado premium entra em nosso estoque." }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="p-8 rounded-[2.5rem] bg-zinc-900/50 border border-white/5 space-y-4"
                            >
                                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white" style={{ color: theme.primaryColor }}>
                                    {item.icon}
                                </div>
                                <h3 className="text-lg font-black uppercase italic tracking-tighter">{item.title}</h3>
                                <p className="text-white/40 text-sm font-medium leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>


        </div>
    );
}
