"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, FileText, Loader2, DollarSign, Calendar, Wallet, Cake } from 'lucide-react';
import { leadService } from '@/lib/services/storeService';
import { useToast } from '@/lib/context/ToastContext';
import { getSessionWhatsAppNumber } from '@/lib/whatsapp';
import WhatsAppIcon from '@/components/icons/WhatsAppIcon';

interface FinancingModalProps {
    isOpen: boolean;
    onClose: () => void;
    motorcycle: {
        id: string | number;
        make: string;
        model: string;
        year?: string;
        price: number | string;
        slug?: string;
        image?: string;
    };
    storeSlug: string;
    primaryColor?: string;
    whatsappNumber?: string;
}

export default function FinancingModal({ isOpen, onClose, motorcycle, storeSlug, primaryColor = '#6366f1', whatsappNumber }: FinancingModalProps) {
    const { addToast } = useToast();

    // Form State — same fields as the financing page
    const [name, setName] = useState('');
    const [cpf, setCpf] = useState('');
    const [phone, setPhone] = useState('');
    const [dataNascimento, setDataNascimento] = useState('');
    const [entrada, setEntrada] = useState('');
    const [parcelas, setParcelas] = useState('48');
    const [renda, setRenda] = useState('');
    const [possuiCnh, setPossuiCnh] = useState('');
    const [loading, setLoading] = useState(false);

    // Validation — normalize price to number (comes as string from DB)
    const motoPrice = typeof motorcycle.price === 'string'
        ? Number(String(motorcycle.price).replace(/\D/g, ''))
        : motorcycle.price;
    const entradaNum = Number(entrada.replace(/\D/g, '') || '0');
    const entryExceedsPrice = motoPrice > 0 && entradaNum > 0 && entradaNum >= motoPrice;

    // Date of birth validation
    const dobError = (() => {
        if (!dataNascimento || dataNascimento.length < 10) return '';
        const [d, m, y] = dataNascimento.split('/');
        const dob = new Date(Number(y), Number(m) - 1, Number(d));
        if (isNaN(dob.getTime())) return 'Data inválida';
        const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        if (age < 18) return 'Você precisa ter pelo menos 18 anos';
        if (age > 120) return 'Data inválida';
        return '';
    })();

    useEffect(() => {
        if (isOpen) {
            setName('');
            setCpf('');
            setPhone('');
            setDataNascimento('');
            setEntrada('');
            setParcelas('48');
            setRenda('');
            setPossuiCnh('');
        }
    }, [isOpen]);

    const formatCurrency = (val: number | string) => {
        const num = typeof val === 'string' ? Number(String(val).replace(/\D/g, '')) : val;
        return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    // Date of birth mask
    const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let v = e.target.value.replace(/\D/g, '').slice(0, 8);
        if (v.length >= 5) v = v.replace(/(\d{2})(\d{2})(\d)/, '$1/$2/$3');
        else if (v.length >= 3) v = v.replace(/(\d{2})(\d)/, '$1/$2');
        setDataNascimento(v);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (entryExceedsPrice || dobError) return;
        setLoading(true);

        try {
            // 1. Build moto link FIRST (before any async that might delay window.open)
            const motoLink = typeof window !== 'undefined'
                ? `${window.location.origin}/${storeSlug}/moto/${motorcycle.slug || motorcycle.id}`
                : '';

            // 2. Format WhatsApp Message
            const message = `*SOLICITACAO DE FINANCIAMENTO*\n\n` +
                `*Nome:* ${name}\n` +
                `*CPF:* ${cpf}\n` +
                `*Data de Nascimento:* ${dataNascimento}\n` +
                `*Telefone:* ${phone}\n\n` +
                `*Moto de Interesse:* ${motorcycle.make} ${motorcycle.model}${motorcycle.year ? ` (${motorcycle.year})` : ''}\n` +
                (motoLink ? `Link: ${motoLink}\n` : '') +
                `*Entrada Disponivel:* R$ ${entrada || '0'}\n` +
                `*Parcelas Desejadas:* ${parcelas}x\n` +
                `*Renda Mensal:* R$ ${renda || 'Nao informado'}\n` +
                `*Possui CNH:* ${possuiCnh === 'sim' ? 'Sim' : 'Nao'}\n\n` +
                `_Solicitacao enviada pelo site_`;

            // 3. Build WhatsApp URL — always use the session seller numbers (hardcoded, validated format)
            const url = `https://wa.me/${getSessionWhatsAppNumber()}?text=${encodeURIComponent(message)}`;

            // 4. Open WhatsApp IMMEDIATELY (before async calls to avoid popup blockers)
            window.open(url, '_blank');
            onClose();
            addToast('Solicitação enviada! Aguarde nosso retorno.', 'success');

            // 5. Save Lead in background (non-blocking — don't let this fail prevent the WhatsApp redirect)
            leadService.createLead(storeSlug, {
                name,
                phone: phone.replace(/\D/g, ''),
                motorcycleId: String(motorcycle.id),
                source: 'financing_modal'
            }).catch(err => console.error('Lead save failed (non-blocking):', err));

        } catch (error) {
            console.error(error);
            addToast('Erro ao enviar solicitação. Tente novamente.', 'error');
        } finally {
            setLoading(false);
        }
    };

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
                        className="relative w-full max-w-lg bg-zinc-900 border border-white/10 rounded-t-3xl md:rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}>
                                    <WhatsAppIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black uppercase italic tracking-tighter text-white">Solicitar Financiamento</h2>
                                    <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">{motorcycle.make} {motorcycle.model} — {formatCurrency(motoPrice)}</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body - Same fields as financing page */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <p className="text-xs text-white/40 font-medium">
                                Preencha seus dados abaixo para solicitar financiamento desta moto.
                            </p>

                            {/* Nome */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Nome Completo</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                    <input
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Digite seu nome completo"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm font-medium text-white outline-none focus:border-white/30 transition-colors"
                                    />
                                </div>
                            </div>

                            {/* CPF */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">CPF</label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                    <input
                                        required
                                        value={cpf}
                                        onChange={handleCpfChange}
                                        placeholder="000.000.000-00"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm font-medium text-white outline-none focus:border-white/30 transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Telefone */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">WhatsApp</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                    <input
                                        required
                                        value={phone}
                                        onChange={handlePhoneChange}
                                        placeholder="(00) 00000-0000"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm font-medium text-white outline-none focus:border-white/30 transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Data de Nascimento */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Data de Nascimento *</label>
                                <div className="relative">
                                    <Cake className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                    <input
                                        required
                                        value={dataNascimento}
                                        onChange={handleDobChange}
                                        placeholder="DD/MM/AAAA"
                                        className={`w-full bg-black/40 border rounded-xl py-3 pl-10 pr-4 text-sm font-medium text-white outline-none transition-colors ${dobError ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-white/30'}`}
                                    />
                                </div>
                                {dobError && (
                                    <p className="text-[10px] text-red-400 font-bold ml-1">{dobError}</p>
                                )}
                            </div>

                            {/* Entrada Disponível */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Entrada Disponível (R$)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                    <input
                                        value={entrada}
                                        onChange={(e) => setEntrada(e.target.value.replace(/\D/g, ''))}
                                        placeholder="Ex: 3000"
                                        className={`w-full bg-black/40 border rounded-xl py-3 pl-10 pr-4 text-sm font-medium text-white outline-none transition-colors ${entryExceedsPrice ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-white/30'}`}
                                    />
                                </div>
                                {entryExceedsPrice && (
                                    <p className="text-[10px] text-red-400 font-bold ml-1">A entrada não pode ser maior que o valor da moto ({formatCurrency(motoPrice)})</p>
                                )}
                            </div>

                            {/* Parcelas */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Parcelas Desejadas</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                    <select
                                        value={parcelas}
                                        onChange={(e) => setParcelas(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm font-medium text-white outline-none focus:border-white/30 transition-colors appearance-none"
                                    >
                                        <option value="12">12x</option>
                                        <option value="24">24x</option>
                                        <option value="36">36x</option>
                                        <option value="48">48x</option>
                                    </select>
                                </div>
                            </div>

                            {/* Renda Mensal */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Renda Mensal (R$)</label>
                                <div className="relative">
                                    <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                    <input
                                        value={renda}
                                        onChange={(e) => setRenda(e.target.value.replace(/\D/g, ''))}
                                        placeholder="Ex: 2500"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm font-medium text-white outline-none focus:border-white/30 transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Possui CNH */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Possui CNH? *</label>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setPossuiCnh('sim')}
                                        className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all border ${
                                            possuiCnh === 'sim'
                                                ? 'bg-green-500/20 border-green-500/50 text-green-400'
                                                : 'bg-black/40 border-white/10 text-white/50 hover:border-white/30'
                                        }`}
                                    >
                                        Sim
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPossuiCnh('nao')}
                                        className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all border ${
                                            possuiCnh === 'nao'
                                                ? 'bg-red-500/20 border-red-500/50 text-red-400'
                                                : 'bg-black/40 border-white/10 text-white/50 hover:border-white/30'
                                        }`}
                                    >
                                        Não
                                    </button>
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={!name || !cpf || !phone || !dataNascimento || !possuiCnh || loading || entryExceedsPrice || !!dobError}
                                    className="w-full py-4 rounded-xl font-black uppercase tracking-widest hover:brightness-110 transition-all text-white text-sm flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ backgroundColor: '#25D366' }}
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <WhatsAppIcon className="w-5 h-5" />
                                            Enviar via WhatsApp
                                        </>
                                    )}
                                </button>
                            </div>

                            <p className="text-[9px] text-zinc-500 text-center px-4">
                                Ao continuar, seus dados serão enviados para nossa equipe via WhatsApp para análise de crédito.
                            </p>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
