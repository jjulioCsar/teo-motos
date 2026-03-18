"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, PackageOpen, ArrowRight, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
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
    const scrollRef = useRef<HTMLDivElement>(null);

    // Filter states
    const [search, setSearch] = useState('');
    const [selectedMakes, setSelectedMakes] = useState<string[]>([]);
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });

    // Mobile carousel state
    const [currentPage, setCurrentPage] = useState(0);
    const MOBILE_PAGE_SIZE = 4;

    const [loadError, setLoadError] = useState(false);

    useEffect(() => {
        if (!slug) return;
        let cancelled = false;
        async function loadInventory() {
            try {
                setLoading(true);
                setLoadError(false);
                // Add timeout: if Supabase doesn't respond in 15s, show error
                const timeoutPromise = new Promise<any[]>((_, reject) =>
                    setTimeout(() => reject(new Error('timeout')), 15000)
                );
                const dataPromise = inventoryService.getInventory(slug as string);
                const data = await Promise.race([dataPromise, timeoutPromise]);
                if (!cancelled) {
                    setInventory(data);
                    setFilteredInventory(data);
                }
            } catch (err) {
                console.error('Error loading inventory:', err);
                if (!cancelled) {
                    setLoadError(true);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }
        loadInventory();
        return () => { cancelled = true; };
    }, [slug]);

    useEffect(() => {
        let result = inventory;

        if (search) {
            result = result.filter(m =>
                m.model.toLowerCase().includes(search.toLowerCase()) ||
                m.make.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (selectedMakes.length > 0) {
            result = result.filter(m => selectedMakes.includes(m.make));
        }

        if (priceRange.min) {
            const minVal = parseFloat(priceRange.min);
            result = result.filter(m => {
                const price = parseFloat(String(m.price).replace(/\./g, '').replace(',', '.'));
                return !isNaN(price) && price >= minVal;
            });
        }
        if (priceRange.max) {
            const maxVal = parseFloat(priceRange.max);
            result = result.filter(m => {
                const price = parseFloat(String(m.price).replace(/\./g, '').replace(',', '.'));
                return !isNaN(price) && price <= maxVal;
            });
        }

        setFilteredInventory(result);
        setCurrentPage(0);
    }, [search, selectedMakes, priceRange, inventory]);

    const toggleMake = (make: string) => {
        setSelectedMakes(prev =>
            prev.includes(make) ? prev.filter(m => m !== make) : [...prev, make]
        );
    };

    const availableMakes = Array.from(new Set(inventory.map(m => m.make)));
    const totalMobilePages = Math.ceil(filteredInventory.length / MOBILE_PAGE_SIZE);
    const mobilePageItems = filteredInventory.slice(currentPage * MOBILE_PAGE_SIZE, (currentPage + 1) * MOBILE_PAGE_SIZE);

    // Loading state
    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-white/30" />
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Carregando estoque...</p>
            </div>
        );
    }

    // Error state
    if (loadError) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
                <div className="w-20 h-20 bg-zinc-900/50 border border-white/5 rounded-2xl flex items-center justify-center text-zinc-700">
                    <PackageOpen className="w-10 h-10" />
                </div>
                <div className="text-center">
                    <h2 className="text-2xl font-black tracking-tighter uppercase italic mb-2">Erro ao carregar</h2>
                    <p className="text-white/40 text-sm max-w-sm">Não foi possível carregar o estoque. Verifique sua conexão e tente novamente.</p>
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 rounded-xl bg-white text-black text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform"
                >
                    Tentar Novamente
                </button>
            </div>
        );
    }

    const MotoCard = ({ moto, compact = false }: { moto: any; compact?: boolean }) => (
        <Link
            href={`/${slug}/moto/${moto.slug || moto.id}`}
            className={`group relative rounded-2xl md:rounded-[2.5rem] overflow-hidden bg-zinc-900 border border-white/5 hover:border-white/20 transition-all cursor-pointer shadow-2xl block ${compact ? 'flex-shrink-0 w-[280px] snap-start' : ''}`}
        >
            <div className={`relative ${compact ? 'aspect-[4/3]' : 'aspect-[4/3]'} overflow-hidden bg-zinc-800`}>
                <img
                    src={moto.image || 'https://images.unsplash.com/photo-1558981403-c5f91cbba527?q=80&w=800'}
                    alt={moto.model}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                    decoding="async"
                />
                <div className="absolute top-4 left-4 z-20">
                    <span className="bg-black/50 backdrop-blur-xl text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/10">
                        {moto.year}
                    </span>
                </div>
            </div>

            <div className="p-5 md:p-8 space-y-4 md:space-y-6">
                <div className="space-y-1">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: theme.primaryColor }}>{moto.make}</span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">{moto.year}</span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter leading-tight">{moto.model}</h3>
                </div>

                <div className="flex flex-wrap gap-1.5 md:gap-2 text-white/40">
                    <span className="px-2 md:px-3 py-1 bg-white/5 rounded-full text-[8px] font-black uppercase tracking-widest">{moto.fuelType || 'Gasolina'}</span>
                    <span className="px-2 md:px-3 py-1 bg-white/5 rounded-full text-[8px] font-black uppercase tracking-widest">{moto.color || 'Preto'}</span>
                    <span className="px-2 md:px-3 py-1 bg-white/5 rounded-full text-[8px] font-black uppercase tracking-widest">{moto.km || '0'} KM</span>
                </div>

                <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-white/5">
                    <p className="text-lg md:text-xl font-black italic" style={{ color: theme.primaryColor }}>
                        R$ {new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 0 }).format(Math.floor(Number(String(moto.price).replace(/\D/g, ''))))}
                    </p>
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                        <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    </div>
                </div>
            </div>
        </Link>
    );

    return (
        <div className="pt-4 md:pt-8 pb-20 text-white">
            <div className="max-w-[1600px] px-4 md:px-8 mx-auto">
                {/* Header & Search */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-8 md:mb-12">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic" style={{ color: theme.primaryColor }}>ESTOQUE</h1>
                        <p className="text-white/40 text-sm">{filteredInventory.length} {filteredInventory.length === 1 ? 'moto disponível' : 'motos disponíveis'} para você.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative group flex-1 md:flex-none">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-white transition-colors" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Buscar modelo ou marca..."
                                className="bg-zinc-900 border border-white/5 rounded-2xl py-3 pl-11 pr-6 w-full md:w-80 outline-none focus:border-white/20 transition-all text-sm font-bold text-white placeholder:text-zinc-600"
                            />
                        </div>
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`flex items-center gap-2 px-4 md:px-5 py-3 rounded-2xl border transition-all text-xs md:text-sm font-black uppercase tracking-widest shrink-0 ${isFilterOpen ? 'bg-white text-black border-white' : 'bg-zinc-900 border-white/5 text-white hover:border-white/20'}`}
                        >
                            <Filter className="w-4 h-4" />
                            <span className="hidden sm:inline">Filtros</span>
                        </button>
                    </div>
                </div>

                {/* Make pills */}
                <div className="mb-8 md:mb-12">
                    <div className="flex items-center justify-between mb-4 md:mb-6">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Navegar por Marca</h3>
                        {selectedMakes.length > 0 && (
                            <button
                                onClick={() => setSelectedMakes([])}
                                className="text-[10px] font-bold text-white/40 hover:text-white transition-colors uppercase tracking-widest"
                            >
                                Limpar
                            </button>
                        )}
                    </div>
                    <div className="flex gap-2 md:gap-3 overflow-x-auto pb-4 custom-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                        {availableMakes.map((make) => (
                            <button
                                key={make}
                                onClick={() => toggleMake(make)}
                                className={`flex-shrink-0 px-5 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl border transition-all text-[10px] font-black uppercase tracking-widest ${selectedMakes.includes(make)
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
                    {/* Filter sidebar */}
                    <AnimatePresence>
                        {isFilterOpen && (
                            <motion.aside
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="lg:w-72 space-y-6 md:space-y-8 overflow-hidden"
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
                                    className="w-full bg-white/5 text-white/40 py-3 md:py-4 rounded-2xl font-black uppercase tracking-widest text-[8px] border border-white/5 hover:bg-white/10 hover:text-white transition-all"
                                >
                                    Limpar Tudo
                                </button>
                            </motion.aside>
                        )}
                    </AnimatePresence>

                    <div className="flex-1">
                        {filteredInventory.length > 0 ? (
                            <>
                                {/* Desktop grid */}
                                <div className="hidden md:grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                                    {filteredInventory.map((moto) => (
                                        <MotoCard key={moto.id} moto={moto} />
                                    ))}
                                </div>

                                {/* Mobile: paginated grid (2 cols, 2 rows = 4 per page) */}
                                <div className="md:hidden">
                                    <div className="grid grid-cols-2 gap-3">
                                        {mobilePageItems.map((moto) => (
                                            <MotoCard key={moto.id} moto={moto} />
                                        ))}
                                    </div>

                                    {/* Pagination controls */}
                                    {totalMobilePages > 1 && (
                                        <div className="flex items-center justify-center gap-4 mt-8">
                                            <button
                                                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                                disabled={currentPage === 0}
                                                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center disabled:opacity-20 hover:bg-white/10 transition-all"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </button>

                                            <div className="flex items-center gap-2">
                                                {Array.from({ length: totalMobilePages }).map((_, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => setCurrentPage(i)}
                                                        className={`w-2.5 h-2.5 rounded-full transition-all ${currentPage === i ? 'w-8 rounded-full' : 'bg-white/20'}`}
                                                        style={currentPage === i ? { backgroundColor: theme.primaryColor } : {}}
                                                    />
                                                ))}
                                            </div>

                                            <button
                                                onClick={() => setCurrentPage(p => Math.min(totalMobilePages - 1, p + 1))}
                                                disabled={currentPage === totalMobilePages - 1}
                                                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center disabled:opacity-20 hover:bg-white/10 transition-all"
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="py-20 md:py-40 text-center">
                                <div className="w-20 h-20 md:w-32 md:h-32 bg-zinc-900/50 border border-white/5 rounded-2xl md:rounded-[3rem] flex items-center justify-center mx-auto mb-6 md:mb-10 text-zinc-800">
                                    <PackageOpen className="w-10 h-10 md:w-16 md:h-16" />
                                </div>
                                <h2 className="text-2xl md:text-4xl font-black tracking-tighter uppercase italic mb-4">Nenhum resultado...</h2>
                                <p className="text-white/40 max-w-sm mx-auto font-medium leading-relaxed text-sm">
                                    Tente ajustar seus filtros ou buscar por outro termo.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
