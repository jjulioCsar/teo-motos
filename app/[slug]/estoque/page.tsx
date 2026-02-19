"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Grid, List as ListIcon, PackageOpen, ArrowRight, Bike } from 'lucide-react';
import { inventoryService } from '@/lib/services/storeService';
import { useStoreTheme } from '@/lib/context/ThemeContext';
import { useParams } from 'next/navigation';
import Link from 'next/link';



export default function InventoryPage() {
    const { slug } = useParams();
    const { theme } = useStoreTheme();
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [inventory, setInventory] = useState<any[]>([]);
    const [filteredInventory, setFilteredInventory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter states
    const [search, setSearch] = useState('');
    const [selectedMakes, setSelectedMakes] = useState<string[]>([]);
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });

    useEffect(() => {
        if (!slug) return;
        async function loadInventory() {
            const data = await inventoryService.getInventory(slug as string);
            setInventory(data);
            setFilteredInventory(data);
            setLoading(false);
        }
        loadInventory();
    }, [slug]);

    useEffect(() => {
        let result = inventory;

        // Search filter
        if (search) {
            result = result.filter(m =>
                m.model.toLowerCase().includes(search.toLowerCase()) ||
                m.make.toLowerCase().includes(search.toLowerCase())
            );
        }

        // Makes filter
        if (selectedMakes.length > 0) {
            result = result.filter(m => selectedMakes.includes(m.make));
        }

        // Price filter
        if (priceRange.min) {
            result = result.filter(m => parseFloat(m.price.replace(/\./g, '')) >= parseFloat(priceRange.min));
        }
        if (priceRange.max) {
            result = result.filter(m => parseFloat(m.price.replace(/\./g, '')) <= parseFloat(priceRange.max));
        }

        setFilteredInventory(result);
    }, [search, selectedMakes, priceRange, inventory]);

    const toggleMake = (make: string) => {
        setSelectedMakes(prev =>
            prev.includes(make) ? prev.filter(m => m !== make) : [...prev, make]
        );
    };

    if (loading) return null;

    const availableMakes = Array.from(new Set(inventory.map(m => m.make)));

    return (
        <div className="pt-8 pb-20 text-white">
            <div className="max-w-[1600px] px-8 mx-auto">
                {/* Header & Search */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter uppercase italic" style={{ color: theme.primaryColor }}>ESTOQUE</h1>
                        <p className="text-white/40">{filteredInventory.length} {filteredInventory.length === 1 ? 'moto disponível' : 'motos disponíveis'} para você.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-white transition-colors" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Buscar por modelo ou marca..."
                                className="bg-zinc-900 border border-white/5 rounded-2xl py-3 pl-11 pr-6 w-full md:w-80 outline-none focus:border-white/20 transition-all text-sm font-bold text-white placeholder:text-zinc-600"
                            />
                        </div>
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`flex items-center gap-2 px-5 py-3 rounded-2xl border transition-all text-sm font-black uppercase tracking-widest ${isFilterOpen ? 'bg-white text-black border-white' : 'bg-zinc-900 border-white/5 text-white hover:border-white/20'
                                }`}
                        >
                            <Filter className="w-4 h-4" />
                            Filtros
                        </button>
                    </div>
                </div>

                <div className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Navegar por Marca</h3>
                        {selectedMakes.length > 0 && (
                            <button
                                onClick={() => setSelectedMakes([])}
                                className="text-[10px] font-bold text-white/40 hover:text-white transition-colors uppercase tracking-widest"
                            >
                                Limpar Marcas
                            </button>
                        )}
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar">
                        {availableMakes.map((make) => (
                            <button
                                key={make}
                                onClick={() => toggleMake(make)}
                                className={`flex-shrink-0 px-8 py-4 rounded-2xl border transition-all text-[10px] font-black uppercase tracking-widest ${selectedMakes.includes(make)
                                    ? 'bg-white text-black border-white'
                                    : 'bg-zinc-900/50 border-white/5 text-zinc-500 hover:text-white hover:border-white/20'
                                    }`}
                            >
                                {make}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    <AnimatePresence>
                        {isFilterOpen && (
                            <motion.aside
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="lg:w-72 space-y-8"
                            >
                                <div className="space-y-4">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-white/40">Marca</h3>
                                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                        {availableMakes.length > 0 ? (
                                            availableMakes.map(make => (
                                                <label key={make} className="flex items-center gap-3 cursor-pointer group">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedMakes.includes(make)}
                                                        onChange={() => toggleMake(make)}
                                                        className="w-4 h-4 rounded border-white/10 bg-zinc-900 text-indigo-600 focus:ring-0"
                                                    />
                                                    <span className={`text-sm font-bold transition-colors ${selectedMakes.includes(make) ? 'text-white' : 'text-white/40 group-hover:text-white'}`}>{make}</span>
                                                </label>
                                            ))
                                        ) : (
                                            <p className="text-[10px] text-zinc-500 uppercase font-black">Nenhuma marca</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-white/40">Faixa de Preço</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="number"
                                            value={priceRange.min}
                                            onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                                            placeholder="Min"
                                            className="bg-zinc-900 border border-white/5 rounded-xl p-3 outline-none text-xs focus:border-white/20 font-bold text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        />
                                        <input
                                            type="number"
                                            value={priceRange.max}
                                            onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                                            placeholder="Max"
                                            className="bg-zinc-900 border border-white/5 rounded-xl p-3 outline-none text-xs focus:border-white/20 font-bold text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        setSearch('');
                                        setSelectedMakes([]);
                                        setPriceRange({ min: '', max: '' });
                                    }}
                                    className="w-full bg-white/5 text-white/40 py-4 rounded-2xl font-black uppercase tracking-widest text-[8px] border border-white/5 hover:bg-white/10 hover:text-white transition-all"
                                >
                                    Limpar Tudo
                                </button>
                            </motion.aside>
                        )}
                    </AnimatePresence>

                    <div className="flex-1">
                        {filteredInventory.length > 0 ? (
                            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                                {filteredInventory.map((moto) => (
                                    <Link
                                        href={`/${slug}/moto/${moto.id}`}
                                        key={moto.id}
                                        className="group relative rounded-[2.5rem] overflow-hidden bg-zinc-900 border border-white/5 hover:border-white/20 transition-all cursor-pointer shadow-2xl block"
                                    >
                                        <div className="relative aspect-[4/3] overflow-hidden">
                                            <img
                                                src={moto.image || 'https://images.unsplash.com/photo-1558981403-c5f91cbba527?q=80&w=2070'}
                                                alt={moto.model}
                                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                            <div className="absolute top-6 left-6 z-20">
                                                <span className="bg-black/50 backdrop-blur-xl text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/10">
                                                    {moto.year}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-8 space-y-6">
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400" style={{ color: theme.primaryColor }}>{moto.make}</span>
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">{moto.year}</span>
                                                </div>
                                                <h3 className="text-2xl font-black uppercase italic tracking-tighter leading-tight">{moto.model}</h3>
                                            </div>

                                            <div className="flex flex-wrap gap-2 text-white/40">
                                                <span className="px-3 py-1 bg-white/5 rounded-full text-[8px] font-black uppercase tracking-widest">{moto.fuelType || 'Gasolina'}</span>
                                                <span className="px-3 py-1 bg-white/5 rounded-full text-[8px] font-black uppercase tracking-widest">{moto.color || 'Preto'}</span>
                                                <span className="px-3 py-1 bg-white/5 rounded-full text-[8px] font-black uppercase tracking-widest">{moto.km || '0'} KM</span>
                                            </div>

                                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                                <p className="text-xl font-black italic" style={{ color: theme.primaryColor }}>
                                                    R$ {new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 0 }).format(Math.floor(Number(String(moto.price).replace(/\D/g, ''))))}
                                                </p>
                                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                                                    <ArrowRight className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="py-40 text-center">
                                <div className="w-32 h-32 bg-zinc-900/50 border border-white/5 rounded-[3rem] flex items-center justify-center mx-auto mb-10 text-zinc-800">
                                    <PackageOpen className="w-16 h-16" />
                                </div>
                                <h2 className="text-4xl font-black tracking-tighter uppercase italic mb-4">Nenhum resultado...</h2>
                                <p className="text-white/40 max-w-sm mx-auto font-medium leading-relaxed">
                                    Tente ajustar seus filtros ou buscar por outro termo para encontrar a sua máquina.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
