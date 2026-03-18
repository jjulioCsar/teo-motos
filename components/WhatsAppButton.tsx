"use client";

import React from 'react';
import { useStoreTheme } from '@/lib/context/ThemeContext';
import WhatsAppIcon from '@/components/icons/WhatsAppIcon';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { motion } from 'framer-motion';

export default function WhatsAppButton() {
    const { theme, isEditMode } = useStoreTheme();

    if (!theme.whatsappNumber) return null;

    const handleClick = () => {
        const message = theme.whatsappMessage || 'Olá! Tenho interesse em uma moto.';
        const url = buildWhatsAppUrl(message);
        window.open(url, '_blank');
    };

    return (
        <motion.button
            onClick={handleClick}
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`fixed bottom-8 ${isEditMode ? 'right-28' : 'right-8'} z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl flex items-center justify-center group overflow-hidden transition-all duration-500`}
        >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <WhatsAppIcon className="w-8 h-8 relative z-10" />

            <div className="absolute right-full mr-4 bg-white text-zinc-900 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl border border-zinc-100">
                Fale Conosco agora
            </div>
        </motion.button>
    );
}
