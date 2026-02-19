"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, MoreHorizontal, Edit, Trash2, ExternalLink, Filter, PackageOpen } from 'lucide-react';
import { inventoryService } from '@/lib/services/storeService';

import { useStoreTheme } from '@/lib/context/ThemeContext';

export default function DashboardInventory() {
    const { theme } = useStoreTheme();
    const [inventory, setInventory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            const data = await inventoryService.getInventory(theme.slug || 'teomotos');
            setInventory(data);
            setLoading(false);
        }
        loadData();
    }, [theme.slug]);

    const handleDelete = async (id: number | string) => {
        if (!confirm('Tem certeza que deseja excluir?')) return;
        await inventoryService.deleteMotorcycle(id);
        // Optimistic update or re-fetch
        setInventory(prev => prev.filter(item => item.id !== id));
    };

    if (loading) return null;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 text-zinc-950">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-zinc-900 uppercase italic">Gerenciar Estoque</h1>
                    <p className="text-zinc-500 font-medium">Adicione, edite ou remova motos da sua vitrine pública.</p>
                </div>
                <a
                    href="/dashboard/inventory/new"
                    className="bg-black text-white px-8 py-3 rounded-2xl font-black text-sm hover:scale-105 transition-transform flex items-center gap-2 shadow-xl shadow-zinc-200"
                >
                    <Plus className="w-5 h-5" />
                    Nova Motocicleta
                </a>
            </div>

            <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
                {inventory.length > 0 ? (
                    <>
                        <div className="p-8 border-b flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar por marca, modelo, ano..."
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-3 pl-14 pr-6 outline-none focus:ring-2 focus:ring-zinc-950/10 transition-all text-sm font-medium"
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-zinc-100 text-sm font-bold text-zinc-600 hover:bg-zinc-50 transition-all">
                                    <Filter className="w-4 h-4" /> Filtros
                                </button>
                                <select className="bg-zinc-50 border border-zinc-100 rounded-2xl px-6 py-3 text-sm font-black text-zinc-900 outline-none appearance-none cursor-pointer text-center">
                                    <option>Mais Recentes</option>
                                    <option>Preço (Maior)</option>
                                    <option>Preço (Menor)</option>
                                </select>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-zinc-50/50 text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100">
                                        <th className="px-10 py-5">Moto</th>
                                        <th className="px-10 py-5">Ano / KM</th>
                                        <th className="px-10 py-5">Preço</th>
                                        <th className="px-10 py-5">Status</th>
                                        <th className="px-10 py-5 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 text-sm">
                                    {inventory.map((item) => (
                                        <tr key={item.id} className="group hover:bg-zinc-50/80 transition-all">
                                            <td className="px-10 py-6">
                                                <div>
                                                    <p className="font-black text-zinc-900 uppercase text-base tracking-tighter">{item.make} {item.model}</p>
                                                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">#{item.id}</p>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6 text-zinc-500 font-bold">
                                                {item.year} <span className="mx-2 text-zinc-200">|</span> {item.mileage || item.km} km
                                            </td>
                                            <td className="px-10 py-6 font-black text-zinc-900 text-base">
                                                R$ {item.price}
                                            </td>
                                            <td className="px-10 py-6">
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${item.status === 'Disponível' || item.status === 'available' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                    item.status === 'Reservada' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                                        'bg-zinc-100 text-zinc-500'
                                                    }`}>
                                                    {item.status === 'available' ? 'Disponível' : item.status}
                                                </span>
                                            </td>
                                            <td className="px-10 py-6 text-right space-x-1">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                    <button className="p-3 rounded-2xl text-zinc-400 hover:text-black hover:bg-white hover:shadow-md transition-all"><Edit className="w-4 h-4" /></button>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="p-3 rounded-2xl text-zinc-300 hover:text-red-500 hover:bg-red-50 hover:shadow-md transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-3 rounded-2xl text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 hover:shadow-md transition-all"><ExternalLink className="w-4 h-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-8 bg-zinc-50/50 border-t flex items-center justify-between text-xs text-zinc-500 font-bold uppercase tracking-widest">
                            <p>Total de {inventory.length} motocicletas</p>
                            <div className="flex gap-4">
                                <button className="px-6 py-2.5 rounded-xl border border-zinc-100 bg-white disabled:opacity-50 hover:shadow-sm transition-all uppercase font-black">Anterior</button>
                                <button className="px-6 py-2.5 rounded-xl border border-zinc-100 bg-white hover:shadow-sm transition-all uppercase font-black">Próxima</button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="p-24 text-center space-y-6">
                        <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mx-auto text-zinc-200">
                            <PackageOpen className="w-10 h-10" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black tracking-tighter uppercase italic">Seu estoque está vazio</h3>
                            <p className="text-zinc-500 font-medium">Comece adicionando sua primeira moto para aparecer na vitrine.</p>
                        </div>
                        <a
                            href="/dashboard/inventory/new"
                            className="inline-flex items-center gap-2 bg-black text-white px-8 py-3 rounded-2xl font-black text-sm hover:scale-105 transition-transform shadow-xl shadow-zinc-200"
                        >
                            <Plus className="w-4 h-4" /> Criar Primeiro Anúncio
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
