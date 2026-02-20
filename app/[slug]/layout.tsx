"use client";

import React, { useState } from 'react';
import { useStoreTheme } from '@/lib/context/ThemeContext';
import WhatsAppButton from '@/components/WhatsAppButton';
import LiveEditorOverlay from '@/components/editor/LiveEditorOverlay';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Bike, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export default function StorefrontLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { theme, isEditMode, setThemeBySlug } = useStoreTheme();
    const params = useParams();
    // Fallback to 'teomotos' or theme.slug if at root
    const slug = (params?.slug as string) || theme.slug || 'teomotos';
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    React.useEffect(() => {
        if (params?.slug) {
            setThemeBySlug(params.slug as string);
        }
    }, [params?.slug, setThemeBySlug]);

    const navLinks = [
        { label: 'Estoque', href: `/${slug}/estoque` },
        { label: 'Financiamento', href: `/${slug}/financiamento` },
        { label: 'Sobre', href: `/${slug}/sobre` },
        { label: 'Contato', href: `/${slug}/contato` },
    ];

    return (
        <div className="min-h-screen bg-black text-white selection:bg-primary selection:text-primary-foreground">
            {/* Navbar */}
            <header
                className="sticky top-0 z-50 w-full border-b bg-black/50 backdrop-blur-xl"
                style={{ borderBottomColor: theme.tertiaryColor ? `${theme.tertiaryColor}20` : 'rgba(255,255,255,0.1)' }}
            >
                <div className="container flex h-16 items-center justify-between px-4 mx-auto">
                    <Link href={`/${slug}`} className="flex items-center gap-3 relative z-[60]">
                        {theme.logo ? (
                            <div className="relative h-10 w-24">
                                <Image
                                    src={theme.logo}
                                    alt={theme.name}
                                    fill
                                    className="object-contain object-left"
                                    priority
                                    unoptimized={!theme.logo.includes('unsplash.com')}
                                />
                            </div>
                        ) : (
                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center" style={{ backgroundColor: theme.primaryColor }}>
                                <Bike className="w-6 h-6 text-white" />
                            </div>
                        )}
                        <div className="text-xl font-bold tracking-tighter uppercase" style={{ color: theme.primaryColor }}>
                            {theme.name}
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex gap-10 text-[10px] font-black uppercase tracking-widest text-white/50">
                        {navLinks.map(link => (
                            <Link key={link.href} href={link.href} className="hover:text-white transition-colors">{link.label}</Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-4 relative z-[60]">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10"
                        >
                            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: '100%' }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl md:hidden pt-24 px-8"
                        >
                            <nav className="flex flex-col gap-6">
                                {navLinks.map((link, i) => (
                                    <motion.div
                                        key={link.href}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                    >
                                        <Link
                                            href={link.href}
                                            onClick={() => setIsMenuOpen(false)}
                                            className="text-4xl font-black italic uppercase tracking-tighter hover:text-indigo-400 transition-colors block"
                                            style={{ color: i === 0 ? theme.primaryColor : 'white' }}
                                        >
                                            {link.label}
                                        </Link>
                                    </motion.div>
                                ))}
                            </nav>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>
            <main>{children}</main>
            <WhatsAppButton />
            <React.Suspense fallback={null}>
                <LiveEditorOverlay />
            </React.Suspense>
            <footer
                className="border-t py-12 bg-zinc-950"
                style={{ borderTopColor: theme.tertiaryColor ? `${theme.tertiaryColor}40` : 'rgba(255,255,255,0.1)' }}
            >
                <div className="container px-4 mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-white/40 text-sm">
                    <p>© 2026 {theme.name}. Todos os direitos reservados.</p>
                    <a
                        href="https://wa.me/5582991480837"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white transition-colors flex items-center gap-2 font-medium"
                    >
                        DESENVOLVIDO POR <span className="font-bold text-white">JÚLIO CÉSAR</span>
                    </a>
                </div>
            </footer>
        </div>
    );
}
