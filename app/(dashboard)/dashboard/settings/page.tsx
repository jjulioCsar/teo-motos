"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Palette, Globe, Layout, Bell, Shield, Camera, Trash2, MessageCircle, CheckCircle as CheckCircleIcon, Info } from 'lucide-react';
import { useStoreTheme } from '@/lib/context/ThemeContext';
import { storeService } from '@/lib/services/storeService';

export default function SettingsPage() {
    const { theme, updateTheme } = useStoreTheme();
    const [formData, setFormData] = useState({
        primaryColor: theme.primaryColor,
        name: theme.name,
        whatsappNumber: theme.whatsappNumber,
        whatsappMessage: theme.whatsappMessage,
        isDarkMode: theme.isDarkMode,
        showFinancing: theme.showFinancing,
        logo: theme.logo
    });

    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        setFormData({
            primaryColor: theme.primaryColor,
            name: theme.name,
            whatsappNumber: theme.whatsappNumber,
            whatsappMessage: theme.whatsappMessage,
            isDarkMode: theme.isDarkMode,
            showFinancing: theme.showFinancing,
            logo: theme.logo
        });
    }, [theme]);

    const handleChange = (field: string, value: any) => {
        const newData = { ...formData, [field]: value };
        setFormData(newData);
        if (['primaryColor', 'isDarkMode', 'showFinancing'].includes(field)) {
            updateTheme({ [field]: value });
        }
    };

    const handleSave = () => {
        setIsSaving(true);
        updateTheme(formData);
        setTimeout(() => {
            setIsSaving(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        }, 800);
    };

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-12 pb-32 text-zinc-950">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-zinc-900 uppercase italic">Configurações</h1>
                    <p className="text-zinc-500 font-medium">Controle total sobre a aparência e funcionalidades da sua plataforma.</p>
                </div>
                <div className="flex items-center gap-4">
                    <AnimatePresence>
                        {showSuccess && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-xl text-xs uppercase"
                            >
                                <CheckCircleIcon className="w-4 h-4" /> Alterações Salvas
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-black text-white px-10 py-4 rounded-2xl font-black text-sm hover:scale-105 transition-all flex items-center gap-2 shadow-2xl shadow-zinc-200 active:scale-95 disabled:opacity-50"
                    >
                        {isSaving ? (
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        Salvar Configurações
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Navigation */}
                <div className="lg:col-span-3 space-y-3">
                    {[
                        { label: 'Identidade Visual', icon: Palette, active: true },
                        { label: 'Comunicação', icon: MessageCircle },
                        { label: 'Site & Domínio', icon: Globe },
                    ].map((item, i) => (
                        <button
                            key={i}
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all text-left ${item.active ? 'bg-zinc-900 text-white shadow-xl' : 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600'
                                }`}
                        >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </button>
                    ))}
                </div>

                <div className="lg:col-span-9 space-y-12">
                    <div className="bg-white rounded-[3rem] border shadow-sm p-10 space-y-12">
                        {/* Branding Section */}
                        <section className="space-y-10">
                            <div className="flex items-center justify-between border-b pb-6">
                                <h3 className="font-black text-xl italic uppercase tracking-tighter">Marca e Design</h3>
                                <Info className="w-5 h-5 text-zinc-300" />
                            </div>

                            <div className="flex flex-col md:flex-row items-center gap-10">
                                <div className="relative">
                                    <div
                                        className="w-40 h-40 rounded-[2.5rem] bg-zinc-50 border-2 border-dashed border-zinc-100 flex items-center justify-center p-6 overflow-hidden shadow-inner group cursor-pointer hover:border-zinc-300 transition-colors relative"
                                        onClick={() => document.getElementById('dashboard-logo-upload')?.click()}
                                    >
                                        {formData.logo ? (
                                            <img
                                                src={formData.logo}
                                                alt="Logo"
                                                className="w-full h-full object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
                                            />
                                        ) : (
                                            <Camera className="w-8 h-8 text-zinc-200" />
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-black uppercase tracking-widest">
                                            Alterar
                                        </div>
                                    </div>
                                    <input
                                        id="dashboard-logo-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                try {
                                                    const url = await storeService.uploadImage(file);
                                                    if (url) handleChange('logo', url);
                                                } catch (err) {
                                                    console.error(err);
                                                    alert('Erro ao fazer upload da logo');
                                                }
                                            }
                                        }}
                                    />
                                    <button
                                        onClick={() => document.getElementById('dashboard-logo-upload')?.click()}
                                        className="absolute -bottom-2 -right-2 p-4 bg-black text-white rounded-[1.5rem] shadow-2xl hover:scale-110 transition-transform"
                                    >
                                        <Camera className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="space-y-4 text-center md:text-left">
                                    <p className="font-black uppercase tracking-widest text-[11px] text-zinc-400">Logotipo da Empresa</p>
                                    <p className="text-xs text-zinc-500 max-w-sm leading-relaxed font-medium">Recomendamos fundos transparentes (PNG) com alta resolução. Este arquivo representará sua loja em toda a plataforma.</p>
                                    <div className="flex gap-4 justify-center md:justify-start">
                                        <button
                                            onClick={() => document.getElementById('dashboard-logo-upload')?.click()}
                                            className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:scale-105 transition-transform"
                                        >
                                            Alterar Imagem
                                        </button>
                                        <span className="text-zinc-200">/</span>
                                        <button
                                            onClick={() => handleChange('logo', '')}
                                            className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:scale-105 transition-transform"
                                        >
                                            Remover
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-4">Nome Social da Loja</label>
                                    <input
                                        value={formData.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                        className="w-full bg-zinc-50 border border-zinc-100 rounded-[2rem] py-5 px-8 outline-none focus:ring-4 focus:ring-zinc-950/5 font-black uppercase tracking-tighter transition-all"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-4">Cor Primária (HEX)</label>
                                    <div className="flex gap-4">
                                        <div className="flex-1 relative">
                                            <input
                                                value={formData.primaryColor}
                                                onChange={(e) => handleChange('primaryColor', e.target.value)}
                                                className="w-full bg-zinc-50 border border-zinc-100 rounded-[2rem] py-5 pl-16 pr-8 outline-none focus:ring-4 focus:ring-zinc-950/5 font-black uppercase transition-all"
                                            />
                                            <div
                                                className="absolute left-6 top-1/2 -translate-y-1/2 w-7 h-7 rounded-xl shadow-lg border border-white/20"
                                                style={{ backgroundColor: formData.primaryColor }}
                                            />
                                        </div>
                                        <input
                                            type="color"
                                            value={formData.primaryColor}
                                            onChange={(e) => handleChange('primaryColor', e.target.value)}
                                            className="w-16 h-16 rounded-[1.5rem] border-0 p-0 cursor-pointer bg-transparent active:scale-95 transition-transform overflow-hidden shadow-xl"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Communication Section */}
                        <section className="space-y-10 pt-10 border-t border-zinc-50">
                            <h3 className="font-black text-xl italic uppercase tracking-tighter">Integrações de Contato</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-4">WhatsApp para Vendas</label>
                                    <input
                                        placeholder="Ex: 82998765432"
                                        value={formData.whatsappNumber}
                                        onChange={(e) => handleChange('whatsappNumber', e.target.value)}
                                        className="w-full bg-zinc-50 border border-zinc-100 rounded-[2rem] py-5 px-8 outline-none focus:ring-4 focus:ring-zinc-950/5 font-black transition-all"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-4">Mensagem de Boas-vindas</label>
                                    <input
                                        placeholder="Olá, tenho interesse..."
                                        value={formData.whatsappMessage}
                                        onChange={(e) => handleChange('whatsappMessage', e.target.value)}
                                        className="w-full bg-zinc-50 border border-zinc-100 rounded-[2rem] py-5 px-8 outline-none focus:ring-4 focus:ring-zinc-950/5 font-bold text-sm text-zinc-500 transition-all"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* System Features */}
                        <section className="space-y-6 pt-10 border-t border-zinc-50">
                            <div className="flex items-center justify-between">
                                <h3 className="font-black text-xl italic uppercase tracking-tighter">Recursos da Plataforma</h3>
                                <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full uppercase">
                                    <LucideCheckCircle className="w-3 h-3" /> Conectado
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                {[
                                    { id: 'showFinancing', label: 'Simulador de Financiamento', desc: 'Ativa o cálculo automático de parcelas na página do produto.' },
                                    { id: 'isDarkMode', label: 'Vitrine Dark Mode (Premium)', desc: 'Força o uso do tema escuro em toda a vitrine pública.' },
                                ].map((feature) => (
                                    <div key={feature.id} className="flex items-center justify-between p-8 bg-zinc-50/50 rounded-[2.5rem] border border-zinc-100 hover:border-zinc-900/10 transition-all group">
                                        <div className="space-y-1">
                                            <p className="font-black text-zinc-900 uppercase tracking-tight">{feature.label}</p>
                                            <p className="text-[11px] text-zinc-500 font-medium">{feature.desc}</p>
                                        </div>
                                        <button
                                            onClick={() => handleChange(feature.id, !formData[feature.id as keyof typeof formData])}
                                            className={`w-16 h-10 rounded-full transition-all relative flex items-center ${formData[feature.id as keyof typeof formData] ? 'bg-zinc-950' : 'bg-zinc-200'}`}
                                        >
                                            <motion.div
                                                animate={{ x: formData[feature.id as keyof typeof formData] ? 28 : 6 }}
                                                className="w-6 h-6 rounded-full bg-white shadow-xl"
                                            />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Preview Section */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-6">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Preview Oficial do Website</p>
                            <div className="flex gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-zinc-200" />
                                <div className="w-1.5 h-1.5 rounded-full bg-zinc-200" />
                            </div>
                        </div>

                        <div className={`relative rounded-[4rem] border-[12px] border-zinc-900 h-[450px] overflow-hidden shadow-2xl transition-colors duration-700 ${formData.isDarkMode ? 'bg-black' : 'bg-white'}`}>
                            {/* Browser Header */}
                            <div className="absolute inset-x-0 top-0 h-12 bg-zinc-900 flex items-center px-8 gap-4">
                                <div className="flex gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                                </div>
                                <div className="flex-1 h-7 bg-zinc-800/50 rounded-full flex items-center px-4 text-[9px] font-bold text-zinc-500">
                                    jl-system.com.br/{formData.name.toLowerCase().replace(/ /g, '-')}
                                </div>
                            </div>

                            {/* Store Header Preview */}
                            <div className={`mt-12 p-8 border-b transition-colors ${formData.isDarkMode ? 'border-white/5 bg-zinc-950/50' : 'border-zinc-100 bg-white'}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-white shadow-xl flex items-center justify-center p-2 border border-zinc-100 overflow-hidden">
                                            {formData.logo ? (
                                                <img src={formData.logo} className="w-full h-full object-contain" />
                                            ) : (
                                                <div className="text-zinc-300">
                                                    <Camera className="w-5 h-5" />
                                                </div>
                                            )}
                                        </div>
                                        <h4 className="font-black italic text-2xl uppercase tracking-tighter" style={{ color: formData.primaryColor }}>{formData.name || 'Sua Loja'}</h4>
                                    </div>
                                    <nav className={`hidden md:flex gap-6 text-[9px] font-black uppercase tracking-widest ${formData.isDarkMode ? 'text-white/30' : 'text-zinc-400'}`}>
                                        <span className="text-white" style={{ color: formData.isDarkMode ? 'white' : 'black' }}>Home</span>
                                        <span>Estoque</span>
                                    </nav>
                                </div>
                            </div>

                            {/* Hero Content Preview */}
                            <div className="p-16 flex flex-col items-center justify-center text-center space-y-8">
                                <div className="space-y-4">
                                    <h5 className={`text-5xl font-black italic uppercase tracking-tighter leading-[0.9] ${formData.isDarkMode ? 'text-white' : 'text-zinc-950'}`}>
                                        Acelere o <br /> <span style={{ color: formData.primaryColor }}>seu sonho.</span>
                                    </h5>
                                    <p className={`text-xs font-medium max-w-sm mx-auto ${formData.isDarkMode ? 'text-white/40' : 'text-zinc-500'}`}>
                                        As melhores motos selecionadas com garantia exclusiva {formData.name}.
                                    </p>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        className="px-10 py-4 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-2xl transition-all"
                                        style={{ backgroundColor: formData.primaryColor }}
                                    >
                                        Explorar Estoque
                                    </button>
                                </div>
                            </div>

                            {/* Floating WhatsApp Preview */}
                            {formData.whatsappNumber && (
                                <div className="absolute bottom-10 right-10 w-14 h-14 bg-emerald-500 rounded-full shadow-2xl flex items-center justify-center text-white">
                                    <MessageCircle className="w-7 h-7" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-12 border-t border-zinc-100 flex justify-between items-center text-xs font-black uppercase tracking-widest">
                        <div className="flex items-center gap-4 text-red-500 hover:text-red-700 cursor-pointer transition-all group">
                            <div className="p-4 rounded-3xl bg-red-50 group-hover:bg-red-100 transition-all">
                                <Trash2 className="w-5 h-5" />
                            </div>
                            Excluir Plataforma Definitivamente
                        </div>
                        <p className="text-zinc-300">JL System v1.0.4</p>
                    </div>
                </div>
            </div >
        </div >
    );
}

const LucideCheckCircle = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
);
