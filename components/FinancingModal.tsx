"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calculator, DollarSign, Calendar, User, Phone, FileText, Send, Loader2 } from 'lucide-react';
import { storeService, leadService } from '@/lib/services/storeService';
import { useToast } from '@/lib/context/ToastContext';

interface FinancingModalProps {
    isOpen: boolean;
    onClose: () => void;
    motorcycle: {
        id: string | number;
        make: string;
        model: string;
        price: number;
        image?: string;
    };
    storeSlug: string;
    primaryColor?: string;
    whatsappNumber?: string;
}

export default function FinancingModal({ isOpen, onClose, motorcycle, storeSlug, primaryColor = '#6366f1', whatsappNumber }: FinancingModalProps) {
    const { addToast } = useToast();
    const [step, setStep] = useState<'simulation' | 'lead'>('simulation');

    // Simulation State
    const [entry, setEntry] = useState(motorcycle.price * 0.3); // 30% default
    const [months, setMonths] = useState(48);
    const [monthlyPayment, setMonthlyPayment] = useState(0);

    // Lead State
    const [name, setName] = useState('');
    const [cpf, setCpf] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);

    // Constants
    const INTEREST_RATE = 0.018; // 1.8% a.m.

    useEffect(() => {
        if (isOpen) {
            setEntry(motorcycle.price * 0.3);
            setMonths(48);
            setStep('simulation');
        }
    }, [isOpen, motorcycle.price]);

    useEffect(() => {
        const principal = motorcycle.price - entry;
        if (principal <= 0) {
            setMonthlyPayment(0);
            return;
        }
        const i = INTEREST_RATE;
        const n = months;
        const pmt = principal * (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
        setMonthlyPayment(pmt);
    }, [entry, months, motorcycle.price]);

    const handleSimulationSubmit = () => {
        if (entry >= motorcycle.price) {
            addToast('A entrada deve ser menor que o valor da moto.', 'warning');
            return;
        }
        setStep('lead');
    };

    const handleLeadSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Save Lead
            await leadService.createLead(storeSlug, {
                name,
                phone: phone.replace(/\D/g, ''),
                motorcycleId: String(motorcycle.id),
                source: 'financing_modal'
            });

            // 2. Format WhatsApp Message
            const message = `*Simulação de Financiamento*\n\n` +
                `🏍️ *Moto:* ${motorcycle.make} ${motorcycle.model}\n` +
                `💰 *Valor:* R$ ${motorcycle.price.toLocaleString('pt-BR')}\n` +
                `📉 *Entrada:* R$ ${entry.toLocaleString('pt-BR')}\n` +
                `📅 *Prazo:* ${months}x de R$ ${monthlyPayment.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}\n\n` +
                `👤 *Cliente:* ${name}\n` +
                `📄 *CPF:* ${cpf}\n` +
                `📱 *Tel:* ${phone}\n\n` +
                `_Gostaria de verificar a aprovação para esta condição._`;

            const cleanPhone = whatsappNumber?.replace(/\D/g, '');
            const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

            // 3. Redirect
            window.open(url, '_blank');
            onClose();
            addToast('Simulação enviada! Aguarde nosso retorno.', 'success');

        } catch (error) {
            console.error(error);
            addToast('Erro ao salvar simulação. Tente novamente.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Formatters
    const formatCurrency = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    // CPF Mask
    const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let v = e.target.value.replace(/\D/g, '');
        if (v.length > 11) v = v.slice(0, 11);
        v = v.replace(/(\d{3})(\d)/, '$1.$2');
        v = v.replace(/(\d{3})(\d)/, '$1.$2');
        v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        setCpf(v);
    };

    // Phone Mask
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let v = e.target.value.replace(/\D/g, '');
        if (v.length > 11) v = v.slice(0, 11);
        v = v.replace(/^(\d{2})(\d)/g, '($1) $2');
        v = v.replace(/(\d)(\d{4})$/, '$1-$2');
        setPhone(v);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ scale: 0.9, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.9, y: 20, opacity: 0 }}
                        className="relative w-full max-w-lg bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}>
                                    <Calculator className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black uppercase italic tracking-tighter text-white">Simular Financiamento</h2>
                                    <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">{motorcycle.make} {motorcycle.model}</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6">
                            <AnimatePresence mode="wait">
                                {step === 'simulation' ? (
                                    <motion.div
                                        key="sim"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="space-y-6"
                                    >
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Valor da Moto</label>
                                                <div className="bg-black/40 border border-white/10 rounded-xl p-3 text-sm font-bold text-white opacity-70">
                                                    {formatCurrency(motorcycle.price)}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Sua Entrada</label>
                                                <input
                                                    type="number"
                                                    value={entry}
                                                    onChange={(e) => setEntry(Number(e.target.value))}
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm font-bold text-white outline-none focus:border-indigo-500"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <input
                                                type="range"
                                                min={0}
                                                max={motorcycle.price * 0.9}
                                                value={entry}
                                                onChange={(e) => setEntry(Number(e.target.value))}
                                                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                                style={{ accentColor: primaryColor }}
                                            />
                                            <div className="flex justify-between text-[10px] uppercase font-bold text-zinc-600">
                                                <span>Sem Entrada</span>
                                                <span>90% do valor</span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Parcelas</label>
                                            <div className="grid grid-cols-4 gap-2">
                                                {[12, 24, 36, 48].map((m) => (
                                                    <button
                                                        key={m}
                                                        onClick={() => setMonths(m)}
                                                        className={`py-2 rounded-lg text-xs font-black transition-all border ${months === m ? 'bg-white text-black border-white' : 'bg-transparent text-zinc-500 border-white/10 hover:border-white/30'}`}
                                                    >
                                                        {m}x
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="bg-zinc-800/50 rounded-2xl p-4 text-center border border-white/5 space-y-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Valor da Parcela</p>
                                            <p className="text-3xl font-black text-white tracking-tighter" style={{ color: primaryColor }}>
                                                {formatCurrency(monthlyPayment)}
                                            </p>
                                        </div>

                                        <button
                                            onClick={handleSimulationSubmit}
                                            className="w-full py-4 rounded-xl font-black uppercase tracking-widest hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                                            style={{ backgroundColor: primaryColor, color: '#fff' }}
                                        >
                                            Continuar <Send className="w-4 h-4" />
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="lead"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-4"
                                    >
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Seu Nome Completo</label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                                <input
                                                    required
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    placeholder="Digite seu nome"
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm font-medium text-white outline-none focus:border-indigo-500"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">CPF (Apenas para análise)</label>
                                            <div className="relative">
                                                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                                <input
                                                    required
                                                    value={cpf}
                                                    onChange={handleCpfChange}
                                                    placeholder="000.000.000-00"
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm font-medium text-white outline-none focus:border-indigo-500"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">WhatsApp de Contato</label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                                <input
                                                    required
                                                    value={phone}
                                                    onChange={handlePhoneChange}
                                                    placeholder="(00) 00000-0000"
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm font-medium text-white outline-none focus:border-indigo-500"
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-4 flex gap-3">
                                            <button
                                                onClick={() => setStep('simulation')}
                                                className="flex-1 py-3 rounded-xl font-bold uppercase tracking-wide border border-white/10 hover:bg-white/5 transition-colors text-white text-xs"
                                            >
                                                Voltar
                                            </button>
                                            <button
                                                onClick={handleLeadSubmit}
                                                disabled={!name || !cpf || !phone || loading}
                                                className="flex-[2] py-3 rounded-xl font-black uppercase tracking-widest hover:brightness-110 transition-all text-white text-xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                style={{ backgroundColor: '#25D366' }} // WhatsApp Green
                                            >
                                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Solicitar Aprovação'}
                                            </button>
                                        </div>

                                        <p className="text-[9px] text-zinc-500 text-center px-4">
                                            Ao continuar, seus dados serão enviados para nossa equipe via WhatsApp para análise de crédito.
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
