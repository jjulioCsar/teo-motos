"use client";

import React, { useState, useEffect } from 'react';
import { useStoreTheme } from '@/lib/context/ThemeContext';
import { Plus, ArrowUpRight, Inbox, Eye, CheckCircle } from 'lucide-react';
import { inventoryService, leadService } from '@/lib/services/storeService';
import Link from 'next/link';

export default function DashboardPage() {
    const { theme } = useStoreTheme();
    const [stats, setStats] = useState({
        inventoryCount: 0,
        leadsCount: 0,
        views: 0,
        conversions: 0
    });
    const [recentInventory, setRecentInventory] = useState<any[]>([]);
    const [recentLeads, setRecentLeads] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!theme.slug || theme.slug === 'default') return;

        let isAborted = false;

        async function loadDashboardData() {
            try {
                const [inv, lds, dashboardStats] = await Promise.all([
                    inventoryService.getInventory(theme.slug),
                    leadService.getLeads(theme.slug),
                    inventoryService.getStats(theme.slug)
                ]);

                if (isAborted) return;

                setRecentInventory(inv.slice(0, 3));
                setRecentLeads(lds.slice(0, 4));

                if (dashboardStats) {
                    setStats(dashboardStats);
                } else {
                    // Fallback if stats fail but lists succeed
                    setStats({
                        inventoryCount: inv.length,
                        leadsCount: lds.length,
                        views: 0,
                        conversions: 0
                    });
                }
            } catch (error: any) {
                if (error.name === 'AbortError') return;
                console.error("Erro ao carregar dados do dashboard:", error);
            } finally {
                if (!isAborted) setIsLoading(false);
            }
        }

        loadDashboardData();

        return () => {
            isAborted = true;
        };
    }, [theme.slug]);

    return (
        <div className="p-10 max-w-7xl mx-auto space-y-10 text-zinc-950">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-zinc-900 uppercase italic">Painel de Controle</h1>
                    <p className="text-zinc-500 font-medium">Bem-vindo de volta à <span className="text-black font-bold">{theme.name}</span>.</p>
                </div>
                <Link
                    href="/dashboard/inventory/new"
                    className="bg-black text-white px-8 py-4 rounded-2xl font-black text-sm hover:scale-105 transition-transform flex items-center gap-2 shadow-2xl shadow-zinc-200"
                >
                    <Plus className="w-5 h-5" />
                    Adicionar Moto
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Em Estoque', value: stats.inventoryCount ?? 0, delta: '+1', icon: <Eye className="w-4 h-4" /> },
                    { label: 'Leads Pendentes', value: stats.leadsCount ?? 0, delta: (stats.leadsCount || 0) > 0 ? `+${stats.leadsCount}` : '0', icon: <Inbox className="w-4 h-4" /> },
                    { label: 'Visualizações', value: (stats.views || 0).toLocaleString(), delta: '+12%', icon: <Eye className="w-4 h-4" /> },
                    { label: 'Convertidos', value: stats.conversions ?? 0, delta: 'Meta: 10', icon: <CheckCircle className="w-4 h-4" /> },
                ].map((stat, i) => (
                    <div key={i} className={`bg-white p-8 rounded-[2.5rem] border shadow-sm group hover:shadow-xl hover:shadow-zinc-200/50 transition-all ${isLoading ? 'animate-pulse opacity-50' : ''}`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-400 group-hover:bg-zinc-900 group-hover:text-white transition-all">
                                {stat.icon}
                            </div>
                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg uppercase tracking-widest">{stat.delta}</span>
                        </div>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <p className="text-3xl font-black tracking-tighter">{isLoading ? '--' : stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Recent Activity / Inventory Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 bg-white rounded-[3rem] border shadow-sm overflow-hidden flex flex-col">
                    <div className="p-8 border-b flex items-center justify-between">
                        <h3 className="font-black text-xl tracking-tighter uppercase italic">Estoque Recente</h3>
                        <Link href="/dashboard/inventory" className="text-[10px] font-black uppercase tracking-widest bg-zinc-100 px-4 py-2 rounded-xl hover:bg-black hover:text-white transition-all">Ver tudo</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-zinc-50 text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b uppercase italic">
                                    <th className="px-8 py-5">Moto</th>
                                    <th className="px-8 py-5 text-center">Ano</th>
                                    <th className="px-8 py-5">Preço</th>
                                    <th className="px-8 py-5 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y text-sm">
                                {recentInventory.length > 0 ? (
                                    recentInventory.map((item, i) => (
                                        <tr key={item.id} className="hover:bg-zinc-50/80 transition-all group">
                                            <td className="px-8 py-6">
                                                <p className="font-black uppercase tracking-tighter text-zinc-900">{item.make} {item.model}</p>
                                                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">#{item.id.toString().slice(-6)}</p>
                                            </td>
                                            <td className="px-8 py-6 text-zinc-500 font-bold text-center">{item.year}</td>
                                            <td className="px-8 py-6 font-black text-zinc-900">R$ {item.price}</td>
                                            <td className="px-8 py-6 text-right">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${item.status === 'available' || item.status === 'Disponível' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                                                    }`}>
                                                    {item.status === 'available' ? 'Disponível' : item.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-20 text-center">
                                            <p className="text-zinc-400 font-black uppercase tracking-widest text-[10px]">Nenhuma moto em estoque</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Leads Sidebar */}
                <div className="bg-zinc-950 rounded-[3.5rem] p-10 space-y-8 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                    <h3 className="font-black text-xl tracking-tighter uppercase italic">Últimos Leads</h3>
                    <div className="space-y-6">
                        {recentLeads.length > 0 ? (
                            recentLeads.map((lead) => (
                                <div key={lead.id} className="flex items-center gap-4 group cursor-pointer">
                                    <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center text-white font-black group-hover:bg-white group-hover:text-black transition-all">
                                        {lead.initials}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-black uppercase tracking-tight">{lead.name}</p>
                                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{lead.source}</p>
                                    </div>
                                    <ArrowUpRight className="w-4 h-4 text-zinc-700 group-hover:text-white transition-colors" />
                                </div>
                            ))
                        ) : (
                            <div className="space-y-4 pt-4 opacity-30 italic font-bold text-sm">
                                <p>Nenhum lead recebido ainda.</p>
                                <p className="text-[10px] uppercase tracking-widest">Os contatos do site aparecerão aqui em tempo real.</p>
                            </div>
                        )}
                    </div>
                    <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all mt-auto">
                        Central de Mensagens
                    </button>
                </div>
            </div >
        </div >
    );
}
