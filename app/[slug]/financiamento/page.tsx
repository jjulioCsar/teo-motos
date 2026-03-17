"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStoreTheme } from '@/lib/context/ThemeContext';
import { inventoryService } from '@/lib/services/storeService';
import { useParams } from 'next/navigation';
import { Landmark, Calculator, Receipt, Clock, CheckCircle2, Send, User, FileText, Phone, Bike, DollarSign, Loader2 } from 'lucide-react';

export default function FinancingPage() {
    const { theme } = useStoreTheme();
    const { slug } = useParams();
    const [motos, setMotos] = useState<any[]>([]);

    useEffect(() => {
        if (!slug) return;
        inventoryService.getInventory(slug as string).then(setMotos);
    }, [slug]);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        cpf: '',
        phone: '',
        motoInteresse: '',
        entrada: '',
        parcelas: '48',
        renda: '',
    });
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    const handleCpf = (val: string) => {
        let v = val.replace(/\D/g, '').slice(0, 11);
        v = v.replace(/(\d{3})(\d)/, '$1.$2');
        v = v.replace(/(\d{3})(\d)/, '$1.$2');
        v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        setFormData(p => ({ ...p, cpf: v }));
    };

    const handlePhone = (val: string) => {
        let v = val.replace(/\D/g, '').slice(0, 11);
        v = v.replace(/^(\d{2})(\d)/g, '($1) $2');
        v = v.replace(/(\d)(\d{4})$/, '$1-$2');
        setFormData(p => ({ ...p, phone: v }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);

        const selectedMoto = motos.find(m => m.id === formData.motoInteresse);
        const motoName = selectedMoto ? `${selectedMoto.make} ${selectedMoto.model} (${selectedMoto.year})` : 'Não especificou';
        const motoLink = selectedMoto ? `${typeof window !== 'undefined' ? window.location.origin : ''}/${slug}/moto/${selectedMoto.slug || selectedMoto.id}` : '';

        const message = `*SIMULAÇÃO DE FINANCIAMENTO*\n\n` +
            `👤 *Nome:* ${formData.name}\n` +
            `📄 *CPF:* ${formData.cpf}\n` +
            `📱 *Telefone:* ${formData.phone}\n\n` +
            `🏍️ *Moto de Interesse:* ${motoName}\n` +
            (motoLink ? `🔗 ${motoLink}\n` : '') +
            `💵 *Entrada Disponível:* R$ ${formData.entrada || '0'}\n` +
            `📅 *Parcelas Desejadas:* ${formData.parcelas}x\n` +
            `💰 *Renda Mensal:* R$ ${formData.renda || 'Não informado'}\n\n` +
            `_Solicitação enviada pelo site ${theme.name}_`;

        const cleanPhone = theme.whatsappNumber?.replace(/\D/g, '') || '';
        const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

        window.open(url, '_blank');
        setSent(true);
        setSending(false);
    };

    const benefits = [
        { icon: <Landmark />, title: "Parcerias Bancárias", desc: "Trabalhamos com os principais bancos do país para garantir a menor taxa." },
        { icon: <Clock />, title: "Aprovação Rápida", desc: "Análise de crédito simplificada com retorno em até 30 minutos." },
        { icon: <CheckCircle2 />, title: "Sem Burocracia", desc: "Processo digital e ágil, focado em colocar você logo na estrada." },
        { icon: <Receipt />, title: "Parcelas Fixas", desc: "Trabalhamos com parcelamento em até 48x com taxas pré-fixadas." }
    ];

    return (
        <div className="pb-32 text-white">
            {/* Hero Section */}
            <section className="relative h-[50vh] md:h-[60vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black to-transparent z-10" />
                <div className="absolute inset-0 z-0">
                    <img
                        src={theme.financingHeroImage || "https://images.unsplash.com/photo-1558981285-6f0c94958bb6?q=80&w=2070"}
                        alt="Financing Background"
                        className="w-full h-full object-cover grayscale opacity-20"
                        loading="lazy"
                    />
                </div>

                <div className="container relative z-20 px-6 md:px-8 mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-6 md:mb-8 inline-block px-4 md:px-6 py-2 rounded-full border border-white/10 bg-white/5 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em]"
                        style={{ color: theme.primaryColor }}
                    >
                        {theme.financingTitle || "Facilidade e Agilidade"}
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85] italic mb-8"
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

            {/* Benefits Cards */}
            <section className="container px-4 md:px-8 mx-auto -mt-16 md:-mt-20 relative z-30">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                    {benefits.map((benefit, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-zinc-900/80 backdrop-blur-2xl border border-white/10 p-5 md:p-10 rounded-2xl md:rounded-[3rem] space-y-3 md:space-y-6"
                        >
                            <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${theme.primaryColor}20`, color: theme.primaryColor }}>
                                {benefit.icon}
                            </div>
                            <h3 className="text-xs md:text-xl font-bold uppercase italic tracking-tighter">{benefit.title}</h3>
                            <p className="text-white/40 text-[10px] md:text-sm font-medium leading-relaxed hidden md:block">{benefit.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Main Content: Form + Image */}
            <section className="container px-4 md:px-8 mx-auto py-16 md:py-32 grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-start">
                <div className="space-y-8 md:space-y-12">
                    <div className="space-y-4 md:space-y-6">
                        <h2 className="text-3xl md:text-6xl font-black tracking-tighter uppercase italic leading-none" style={{ color: theme.primaryColor }}>
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
                        <div className="text-white/60 text-sm md:text-lg font-medium leading-relaxed">
                            {theme.financingText ? (
                                <p className="italic border-l-4 pl-6 md:pl-8" style={{ borderColor: theme.primaryColor }}>"{theme.financingText}"</p>
                            ) : (
                                <p>Na {theme.name}, facilitamos o caminho entre você e sua próxima aventura. Com parcerias consolidadas com bancos, oferecemos taxas competitivas e parcelamentos flexíveis.</p>
                            )}
                        </div>
                    </div>

                    {/* FINANCING FORM */}
                    <div className="bg-zinc-900 border border-white/5 rounded-2xl md:rounded-[3rem] p-5 md:p-10 space-y-5 md:space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 md:w-16 md:h-16 bg-white/5 rounded-2xl flex items-center justify-center text-green-500 shrink-0">
                                <Calculator className="w-6 h-6 md:w-8 md:h-8" />
                            </div>
                            <div>
                                <h4 className="text-base md:text-xl font-bold uppercase italic">Solicitar Simulação</h4>
                                <p className="text-white/40 text-xs">Preencha seus dados e receba uma proposta.</p>
                            </div>
                        </div>

                        {sent ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-8 space-y-4"
                            >
                                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                                </div>
                                <h3 className="text-xl font-black uppercase italic">Solicitação Enviada!</h3>
                                <p className="text-white/40 text-sm">Nossa equipe entrará em contato em breve.</p>
                                <button
                                    onClick={() => { setSent(false); setFormData({ name: '', cpf: '', phone: '', motoInteresse: '', entrada: '', parcelas: '48', renda: '' }); }}
                                    className="text-xs font-bold text-white/40 underline hover:text-white transition-colors"
                                >
                                    Enviar nova simulação
                                </button>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1 mb-1 block">Nome Completo *</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                        <input
                                            required
                                            value={formData.name}
                                            onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                                            placeholder="Seu nome"
                                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm font-medium text-white outline-none focus:border-indigo-500 transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1 mb-1 block">CPF *</label>
                                        <div className="relative">
                                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                            <input
                                                required
                                                value={formData.cpf}
                                                onChange={e => handleCpf(e.target.value)}
                                                placeholder="000.000.000-00"
                                                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm font-medium text-white outline-none focus:border-indigo-500 transition-colors"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1 mb-1 block">WhatsApp *</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                            <input
                                                required
                                                value={formData.phone}
                                                onChange={e => handlePhone(e.target.value)}
                                                placeholder="(00) 00000-0000"
                                                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm font-medium text-white outline-none focus:border-indigo-500 transition-colors"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1 mb-1 block">Moto de Interesse</label>
                                    <div className="relative">
                                        <Bike className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                        <select
                                            value={formData.motoInteresse}
                                            onChange={e => setFormData(p => ({ ...p, motoInteresse: e.target.value }))}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm font-medium text-white outline-none focus:border-indigo-500 transition-colors appearance-none"
                                        >
                                            <option value="">Selecione uma moto...</option>
                                            {motos.map(m => (
                                                <option key={m.id} value={m.id} className="bg-zinc-900 text-white">
                                                    {m.make} {m.model} ({m.year}) - R$ {new Intl.NumberFormat('pt-BR').format(Number(String(m.price).replace(/\D/g, '')))}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3 md:gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1 mb-1 block">Entrada</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                            <input
                                                type="text"
                                                value={formData.entrada}
                                                onChange={e => setFormData(p => ({ ...p, entrada: e.target.value.replace(/\D/g, '') }))}
                                                placeholder="0"
                                                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-2 text-sm font-medium text-white outline-none focus:border-indigo-500 transition-colors"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1 mb-1 block">Parcelas</label>
                                        <select
                                            value={formData.parcelas}
                                            onChange={e => setFormData(p => ({ ...p, parcelas: e.target.value }))}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-3 text-sm font-medium text-white outline-none focus:border-indigo-500 transition-colors appearance-none"
                                        >
                                            <option value="12">12x</option>
                                            <option value="24">24x</option>
                                            <option value="36">36x</option>
                                            <option value="48">48x</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1 mb-1 block">Renda</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                            <input
                                                type="text"
                                                value={formData.renda}
                                                onChange={e => setFormData(p => ({ ...p, renda: e.target.value.replace(/\D/g, '') }))}
                                                placeholder="0"
                                                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-2 text-sm font-medium text-white outline-none focus:border-indigo-500 transition-colors"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={sending}
                                    className="w-full py-4 rounded-xl font-black uppercase tracking-widest text-white text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all disabled:opacity-50 mt-2"
                                    style={{ backgroundColor: '#25D366' }}
                                >
                                    {sending ? (
                                        <><Loader2 className="w-5 h-5 animate-spin" /> Enviando...</>
                                    ) : (
                                        <>Enviar via WhatsApp <Send className="w-4 h-4" /></>
                                    )}
                                </button>

                                <p className="text-[9px] text-zinc-600 text-center">
                                    Seus dados serão enviados para nossa equipe via WhatsApp para análise de crédito.
                                </p>
                            </form>
                        )}
                    </div>
                </div>

                <div className="relative aspect-square hidden lg:block">
                    <div className="absolute inset-0 blur-[120px] rounded-full animate-pulse" style={{ backgroundColor: `${theme.primaryColor}20` }} />
                    <img
                        src={theme.financingSecondaryImage || "https://images.unsplash.com/photo-1444491741275-3747c53c99b4?q=80&w=1974"}
                        alt="Rider"
                        className="relative z-10 w-full h-full object-cover rounded-[4rem] border border-white/10"
                        loading="lazy"
                    />
                </div>
            </section>
        </div>
    );
}
