"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, CheckCircle, Smartphone } from 'lucide-react';
import { useStoreTheme } from '@/lib/context/ThemeContext';
import { leadService } from '@/lib/services/storeService';

interface FinancingModalProps {
    isOpen: boolean;
    onClose: () => void;
    moto: {
        id: string;
        make: string;
        model: string;
        price: string;
    };
}

export default function FinancingModal({ isOpen, onClose, moto }: FinancingModalProps) {
    const { theme } = useStoreTheme();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        cpf: '',
        birthDate: '',
        phone: '',
        downPayment: ''
    });

    if (!isOpen) return null;

    const formatCurrency = (value: string) => {
        return value.replace(/\D/g, '')
            .replace(/(\d)(\d{2})$/, '$1,$2')
            .replace(/(?=(\d{3})+(\D))\B/g, '.');
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Build WhatsApp Message
            const message = `*SIMULAÇÃO DE FINANCIAMENTO*\n\n` +
                `🏍️ *Moto:* ${moto.make} ${moto.model}\n` +
                `💰 *Preço:* R$ ${moto.price}\n\n` +
                `👤 *Nome:* ${formData.name}\n` +
                `📄 *CPF:* ${formData.cpf}\n` +
                `📅 *Nasc.:* ${formData.birthDate}\n` +
                `📱 *Tel:* ${formData.phone}\n` +
                `💵 *Entrada:* R$ ${formData.downPayment || '0,00'}`;

            const phone = theme.whatsappNumber || '5582999999999';
            const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

            // 2. Track Lead
            await leadService.createLead(theme.slug, {
                name: formData.name,
                phone: formData.phone,
                motorcycleId: moto.id,
                source: "Simulação Financiamento"
            });

            // 3. Redirect
            window.open(whatsappUrl, '_blank');
            onClose();

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999]"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 m-auto max-w-md h-fit bg-zinc-900 border border-white/10 rounded-3xl p-8 z-[10000] shadow-2xl"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-zinc-500" />
                        </button>

                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-400">
                                <Smartphone className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-black uppercase italic tracking-tighter">Simular Financiamento</h2>
                            <p className="text-sm text-white/40 mt-2">
                                Preencha os dados abaixo para receber uma simulação exclusiva via WhatsApp.
                            </p>
                        </div>

                        <form onSubmit={handleSend} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-white/60 mb-1 block uppercase tracking-wider">Nome Completo</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 transition-colors"
                                    placeholder="Seu nome"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-white/60 mb-1 block uppercase tracking-wider">CPF</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.cpf}
                                        onChange={e => {
                                            const v = e.target.value.replace(/\D/g, '').slice(0, 11);
                                            setFormData({ ...formData, cpf: v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') });
                                        }}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 transition-colors"
                                        placeholder="000.000.000-00"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-white/60 mb-1 block uppercase tracking-wider">Data Nasc.</label>
                                    <input
                                        required
                                        type="date"
                                        value={formData.birthDate}
                                        onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-white/60 mb-1 block uppercase tracking-wider">WhatsApp</label>
                                    <input
                                        required
                                        type="tel"
                                        value={formData.phone}
                                        onChange={e => {
                                            const v = e.target.value.replace(/\D/g, '').slice(0, 11);
                                            setFormData({ ...formData, phone: v.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3') });
                                        }}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 transition-colors"
                                        placeholder="(00) 00000-0000"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-white/60 mb-1 block uppercase tracking-wider">Entrada (Opcional)</label>
                                    <input
                                        type="text"
                                        value={formData.downPayment}
                                        onChange={e => {
                                            const v = e.target.value.replace(/\D/g, '');
                                            setFormData({ ...formData, downPayment: formatCurrency(v) });
                                        }}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 transition-colors"
                                        placeholder="R$ 0,00"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-4 font-black uppercase tracking-widest flex items-center justify-center gap-2 mt-4 hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                {loading ? 'Enviando...' : (
                                    <>
                                        Solicitar Simulação <MessageCircle className="w-5 h-5" />
                                    </>
                                )}
                            </button>

                            <p className="text-[10px] text-center text-white/30 uppercase font-bold tracking-widest">
                                Seus dados estão seguros e serão usados apenas para simulação.
                            </p>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
