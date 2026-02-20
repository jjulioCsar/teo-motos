"use client";

import React from 'react';
import { useStoreTheme } from '@/lib/context/ThemeContext';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { theme } = useStoreTheme();
    const pathname = usePathname();

    const menuItems = [
        { label: 'Visão Geral', icon: '🏠', href: '/dashboard' },
        { label: 'Estoque', icon: '🏍️', href: '/dashboard/inventory' },
        { label: 'Leads', icon: '👥', href: '#' },
        { label: 'Configurações', icon: '⚙️', href: '/dashboard/settings' },
    ];

    return (
        <div className="min-h-screen bg-zinc-50 flex">
            {/* Sidebar */}
            <aside className="w-72 border-r bg-white flex flex-col shadow-sm">
                <div className="p-8 border-b flex items-center gap-3">
                    {theme.logo ? (
                        <div className="relative w-10 h-10">
                            <Image
                                src={theme.logo}
                                alt={theme.name}
                                fill
                                className="object-contain"
                                unoptimized={!theme.logo.includes('unsplash.com')}
                            />
                        </div>
                    ) : (
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black italic shadow-lg" style={{ backgroundColor: theme.primaryColor }}>
                            {theme.name.slice(0, 2).toUpperCase()}
                        </div>
                    )}
                    <span className="font-black tracking-tighter text-lg uppercase italic truncate" style={{ color: theme.primaryColor }}>
                        {theme.name}
                    </span>
                </div>
                <nav className="flex-1 p-6 space-y-2">
                    {menuItems.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`flex items-center gap-4 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${pathname === item.href
                                ? 'text-white shadow-lg'
                                : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
                                }`}
                            style={pathname === item.href ? { backgroundColor: theme.primaryColor, boxShadow: `0 10px 20px ${theme.primaryColor}30` } : {}}
                        >
                            <span className="text-lg">{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </nav>
                <div className="p-6 border-t">
                    <div className="bg-zinc-950 rounded-[2rem] p-6 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" style={{ backgroundColor: `${theme.primaryColor}20` }} />
                        <p className="text-[10px] text-white/40 mb-1 font-black uppercase tracking-widest">Loja Ativa</p>
                        <p className="text-sm font-black truncate uppercase tracking-tighter">{theme.name}</p>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-20 border-b bg-white/80 backdrop-blur-md flex items-center justify-between px-10 sticky top-0 z-10">
                    <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Dashboard de Gestão</h2>
                    <div className="flex items-center gap-6">
                        {theme.slug && theme.slug !== 'default' && (
                            <Link
                                href={`/${theme.slug}?edit=true`}
                                className="text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-zinc-100 rounded-lg hover:bg-black hover:text-white transition-all flex items-center gap-2 text-zinc-600"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Voltar ao Site
                            </Link>
                        )}
                        <button className="text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-black transition-colors">Suporte</button>
                        <div className="w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200" />
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto bg-zinc-50/50">
                    {children}
                </div>
            </main>
        </div>
    );
}
