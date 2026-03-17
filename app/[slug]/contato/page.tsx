"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useStoreTheme } from '@/lib/context/ThemeContext';
import { Mail, MapPin, Clock, MessageSquare, Instagram } from 'lucide-react';

export default function ContactPage() {
    const { theme } = useStoreTheme();

    return (
        <div className="pb-20 md:pb-32 text-white">
            {/* Header */}
            <section className="py-16 md:py-24 container px-4 md:px-8 mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-4 md:mb-6 inline-block px-4 md:px-6 py-2 rounded-full border border-white/10 bg-white/5 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-white"
                >
                    {theme.contactTitle || "Fale Conosco"}
                </motion.div>
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-6xl lg:text-8xl font-black tracking-tighter uppercase italic mb-4 md:mb-6 leading-tight"
                >
                    {theme.contactSubtitle?.includes('?') ? (
                        <>
                            {theme.contactSubtitle.split('?')[0]} <br />
                            <span style={{ color: theme.primaryColor }}>
                                {theme.contactSubtitle.split('?').slice(1).join(' ')}
                            </span>
                        </>
                    ) : (
                        <span style={{ color: theme.primaryColor }}>{theme.contactSubtitle || "Vamos começar uma nova jornada?"}</span>
                    )}
                </motion.h1>
            </section>

            <section className="container px-4 md:px-8 mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-12">
                    {/* Contact Channels */}
                    <div className="lg:col-span-5 space-y-4 md:space-y-6">
                        <div className="p-6 md:p-10 rounded-2xl md:rounded-[3rem] bg-zinc-900/50 border border-white/5 space-y-6 md:space-y-8">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter mb-1 md:mb-2" style={{ color: theme.primaryColor }}>{theme.channelsTitle || "Canais Diretos"}</h2>
                                <p className="text-zinc-500 text-xs md:text-sm font-medium">{theme.channelsDescription || "Escolha a melhor forma de falar com nosso time."}</p>
                            </div>

                            <div className="space-y-3 md:space-y-4">
                                {/* WhatsApp Button */}
                                <motion.a
                                    href={`https://wa.me/${theme.whatsappNumber?.replace(/\D/g, '')}?text=${encodeURIComponent(theme.whatsappMessage || '')}`}
                                    target="_blank"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex items-center gap-3 md:gap-4 p-4 md:p-6 rounded-xl md:rounded-2xl bg-[#25D366] text-black group transition-all"
                                >
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-black/10 flex items-center justify-center shrink-0">
                                        <MessageSquare className="w-5 h-5 md:w-6 md:h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-60">WhatsApp</p>
                                        <p className="text-base md:text-lg font-black uppercase italic truncate">{theme.whatsappNumber}</p>
                                    </div>
                                    <div className="px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-black/10 text-[8px] md:text-[10px] font-black uppercase tracking-widest group-hover:bg-black/20 transition-colors shrink-0">
                                        Conversar Agora
                                    </div>
                                </motion.a>

                                {/* Instagram Button */}
                                <motion.a
                                    href={theme.instagram?.startsWith('http') ? theme.instagram : `https://instagram.com/${theme.instagram?.replace('@', '')}`}
                                    target="_blank"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex items-center gap-3 md:gap-4 p-4 md:p-6 rounded-xl md:rounded-2xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white group transition-all"
                                >
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                                        <Instagram className="w-5 h-5 md:w-6 md:h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-60">Instagram</p>
                                        <p className="text-base md:text-lg font-black uppercase italic truncate">
                                            {theme.instagram?.replace(/https?:\/\/(www\.)?instagram\.com\//, '@').split('/')[0] || theme.instagram}
                                        </p>
                                    </div>
                                    <div className="px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white/10 text-[8px] md:text-[10px] font-black uppercase tracking-widest group-hover:bg-white/20 transition-colors shrink-0">
                                        Seguir Loja
                                    </div>
                                </motion.a>

                                {theme.email && (
                                    <motion.a
                                        href={`mailto:${theme.email}`}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex items-center gap-3 md:gap-4 p-4 md:p-6 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 text-white group transition-all"
                                    >
                                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                                            <Mail className="w-5 h-5 md:w-6 md:h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0 text-left">
                                            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-40">E-mail Comercial</p>
                                            <p className="text-sm md:text-lg font-bold truncate">{theme.email}</p>
                                        </div>
                                    </motion.a>
                                )}
                            </div>
                        </div>

                        {/* Working Hours Card */}
                        <div className="p-6 md:p-10 rounded-2xl md:rounded-[3rem] bg-zinc-900/50 border border-white/5 space-y-4 md:space-y-6">
                            <div className="flex items-center gap-3 md:gap-4">
                                <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white/5 flex items-center justify-center" style={{ color: theme.primaryColor }}>
                                    <Clock className="w-4 h-4 md:w-5 md:h-5" />
                                </div>
                                <h3 className="text-lg md:text-xl font-black uppercase italic tracking-tighter" style={{ color: theme.primaryColor }}>{theme.hoursTitle || "Horários"}</h3>
                            </div>
                            <div className="space-y-2 md:space-y-3">
                                <div className="flex justify-between items-center py-2 md:py-3 border-b border-white/5">
                                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-500">Segunda à Sexta</span>
                                    <span className="font-bold text-sm md:text-base">{theme.hoursWeekdays || "08:00 - 18:00"}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 md:py-3 border-b border-white/5">
                                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-500">Sábado</span>
                                    <span className="font-bold text-sm md:text-base">{theme.hoursSaturday || "08:00 - 13:00"}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 md:py-3">
                                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-500">Domingo</span>
                                    <span className="text-red-500/50 font-black uppercase tracking-widest italic text-sm">Fechado</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Map & Address */}
                    <div className="lg:col-span-7 flex flex-col gap-6 md:gap-8">
                        <div className="p-6 md:p-10 rounded-2xl md:rounded-[3rem] bg-zinc-900/40 border border-white/5 space-y-6 md:space-y-8 flex-1 flex flex-col">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center" style={{ color: theme.primaryColor }}>
                                            <MapPin className="w-4 h-4" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{theme.addressTitle || "Localização"}</span>
                                    </div>
                                    <h2 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter leading-none mb-2 md:mb-4" style={{ color: theme.primaryColor }}>{theme.addressDescription || "Nosso Showroom"}</h2>
                                    <p className="text-sm md:text-xl font-bold max-w-md">{theme.address}</p>
                                </div>
                                <motion.a
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(theme.address || '')}`}
                                    target="_blank"
                                    whileHover={{ scale: 1.05 }}
                                    className="px-4 py-3 md:p-5 rounded-xl md:rounded-2xl bg-white text-black text-[10px] md:text-xs font-black uppercase tracking-widest text-center shrink-0 inline-block"
                                >
                                    Abrir no Maps
                                </motion.a>
                            </div>

                            <div className="flex-1 bg-black/40 rounded-xl md:rounded-[2rem] border border-white/5 overflow-hidden relative min-h-[250px] md:min-h-[400px]">
                                {theme.mapUrl ? (
                                    <iframe
                                        src={theme.mapUrl}
                                        className="w-full h-full grayscale opacity-40 hover:opacity-70 transition-opacity"
                                        style={{ border: 0, minHeight: '250px' }}
                                        allowFullScreen
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                                        <MapPin className="w-12 h-12 text-zinc-800" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-700">Mapa não configurado</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
