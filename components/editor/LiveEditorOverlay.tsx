"use client";

import React, { useState, useEffect } from 'react';
import { useStoreTheme } from '@/lib/context/ThemeContext';
import { storeService, inventoryService, Motorcycle } from '@/lib/services/storeService';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings,
    X,
    Palette,
    MessageCircle,
    Eye,
    Save,
    Globe,
    Layout,
    Plus,
    Trash2,
    Image as ImageIcon,
    Bike,
    FileText,
    Share2,
    Instagram,
    Edit3,
    Wallet,
    Upload,
    Loader2,
    ShieldCheck,
    Star
} from 'lucide-react';

import { useToast } from '@/lib/context/ToastContext';
import ImageCropperModal from '../ImageCropperModal';

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export default function LiveEditorOverlay() {
    const params = useParams();
    // Default to 'teomotos' if slug is missing (e.g. at root path)
    const slug = (params?.slug as string) || 'teomotos';

    const { theme, updateTheme, isEditMode, setEditMode } = useStoreTheme();
    const { addToast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'design' | 'content' | 'inventory' | 'config'>('design');
    const [inventory, setInventory] = useState<Motorcycle[]>([]);
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isAddingMoto, setIsAddingMoto] = useState(false);

    // Auto-open editor if ?edit=true is present
    useEffect(() => {
        if (searchParams?.get('edit') === 'true' && isEditMode) {
            setIsOpen(true);
            // Clean up the URL after opening
            const newParams = new URLSearchParams(searchParams.toString());
            newParams.delete('edit');
            const cleanUrl = `${window.location.pathname}${newParams.toString() ? '?' + newParams.toString() : ''}`;
            window.history.replaceState({}, '', cleanUrl);
        }
    }, [searchParams, isEditMode]);

    // Cropper State
    const [cropFile, setCropFile] = useState<File | null>(null);
    const [cropAspectRatio, setCropAspectRatio] = useState(16 / 9);
    const [cropCallback, setCropCallback] = useState<(url: string) => void>(() => { });

    const [newMoto, setNewMoto] = useState<Omit<Motorcycle, 'id' | 'storeSlug'>>({
        make: '',
        model: '',
        year: '2024',
        price: '',
        image: '',
        images: [],
        status: 'available',
        km: '',
        color: '',
        fuelType: '',
        condition: 'Seminova',
        hasWarranty: false,
        is_featured: false
    });

    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        if (theme.slug) {
            async function loadInv() {
                const data = await inventoryService.getInventory(theme.slug);
                setInventory(data);
            }
            loadInv();
        }
    }, [theme.slug, isOpen]);

    const handleAddMoto = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!theme.slug) return;

        // Ensure the primary image is also in the images array if not already
        const finalImages = [...(newMoto.images || [])];
        if (newMoto.image && !finalImages.includes(newMoto.image)) {
            finalImages.unshift(newMoto.image);
        }

        try {
            if (editingId) {
                await inventoryService.updateMotorcycle(editingId, {
                    ...newMoto,
                    images: finalImages
                });
                addToast('Motocicleta atualizada com sucesso!', 'success');
            } else {
                await inventoryService.addMotorcycle(theme.slug, {
                    ...newMoto,
                    images: finalImages
                });
                addToast('Motocicleta adicionada com sucesso!', 'success');
            }

            // Refresh inventory
            const updated = await inventoryService.getInventory(theme.slug);
            setInventory(updated);

            setIsAddingMoto(false);
            setEditingId(null);
            setNewMoto({
                make: '',
                model: '',
                year: '2024',
                price: '',
                image: '',
                images: [],
                status: 'available',
                km: '',
                color: '',
                fuelType: '',
                condition: 'Seminova',
                hasWarranty: false,
                is_featured: false
            });
        } catch (error) {
            console.error("Erro ao salvar moto:", error);
            addToast('Erro ao salvar motocicleta.', 'error');
        }
    };

    const handleEditMoto = (moto: Motorcycle) => {
        setEditingId(moto.id);
        setNewMoto({
            make: moto.make,
            model: moto.model,
            year: moto.year,
            price: moto.price,
            image: moto.image,
            images: moto.images || [],
            status: moto.status,
            km: moto.km || '',
            color: moto.color || '',
            fuelType: moto.fuelType || '',
            condition: moto.condition || 'Seminova',
            hasWarranty: moto.hasWarranty || false,
            is_featured: moto.is_featured || false
        });
        setIsAddingMoto(true);
    };

    const handleDeleteMoto = async (id: string | number) => {
        if (!theme.slug) return;
        try {
            await inventoryService.deleteMotorcycle(id.toString());
            const updated = await inventoryService.getInventory(theme.slug);
            setInventory(updated);
            addToast('Motocicleta removida com sucesso!', 'success');
        } catch (error) {
            console.error("Erro ao deletar moto:", error);
            addToast('Erro ao remover motocicleta.', 'error');
        }
    };

    if (!isEditMode) return null;

    return (
        <>
            {/* Control Toggle */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-8 right-8 bg-indigo-600 text-white p-4 rounded-2xl shadow-2xl hover:scale-110 transition-all z-[100] border border-white/10"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Settings className="w-6 h-6" />}
            </button>

            {/* Editor Sidebar */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ x: 400 }}
                        animate={{ x: 0 }}
                        exit={{ x: 400 }}
                        className="fixed inset-0 md:inset-auto md:right-4 md:top-4 md:bottom-4 w-full md:w-[400px] bg-zinc-950/95 backdrop-blur-2xl border-l md:border border-white/10 md:rounded-[2.5rem] shadow-2xl z-[90] flex flex-col overflow-hidden"
                    >
                        <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">Live Editor</h2>
                                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Loja de Motos <span className="text-white">{theme.slug}</span></p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        setEditMode(false);
                                        setIsOpen(false);
                                    }}
                                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-all flex items-center gap-1 group"
                                    title="Sair do Modo Gestão"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity">Sair</span>
                                </button>
                                <button onClick={() => setIsOpen(false)} className="md:hidden p-2 text-white bg-white/10 rounded-full">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex p-2 bg-white/5 border-b border-white/5">
                            {[
                                { id: 'design', label: 'Estilo', icon: <Palette className="w-3 h-3" /> },
                                { id: 'content', label: 'Início', icon: <Layout className="w-3 h-3" /> },
                                { id: 'inventory', label: 'Estoque', icon: <Bike className="w-3 h-3" /> },
                                { id: 'config', label: 'Infos', icon: <Share2 className="w-3 h-3" /> },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
                                >
                                    {tab.icon} {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-10">
                            <AnimatePresence mode="wait">
                                {activeTab === 'design' && (
                                    <motion.div key="design" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-8">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-1">Logo da Loja</label>
                                                <div className="flex gap-2">
                                                    <div className="flex-1 relative">
                                                        <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                                        <input
                                                            type="text"
                                                            value={theme.logo || ''}
                                                            onChange={(e) => updateTheme({ logo: e.target.value })}
                                                            placeholder="URL da Logo"
                                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-xs font-bold text-white transition-all focus:border-indigo-500 outline-none"
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={() => document.getElementById('logo-upload')?.click()}
                                                        className="px-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-white hover:text-black transition-all"
                                                        title="Upload do Computador"
                                                    >
                                                        <Upload className="w-4 h-4" />
                                                    </button>
                                                    <input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            try {
                                                                const url = await storeService.uploadImage(file);
                                                                if (url) updateTheme({ logo: url });
                                                            } catch (err) {
                                                                console.error(err);
                                                                alert('Erro ao fazer upload da logo');
                                                            }
                                                        }
                                                    }} />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-3">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-1">Primária</label>
                                                    <input
                                                        type="color"
                                                        value={theme.primaryColor}
                                                        onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                                                        className="w-full h-10 rounded-lg bg-transparent border border-white/10 cursor-pointer p-0 overflow-hidden outline-none"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-1">Secundária</label>
                                                    <input
                                                        type="color"
                                                        value={theme.secondaryColor || '#4f46e5'}
                                                        onChange={(e) => updateTheme({ secondaryColor: e.target.value })}
                                                        className="w-full h-10 rounded-lg bg-transparent border border-white/10 cursor-pointer p-0 overflow-hidden outline-none"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-1">Accent</label>
                                                    <input
                                                        type="color"
                                                        value={theme.tertiaryColor || '#ffffff'}
                                                        onChange={(e) => updateTheme({ tertiaryColor: e.target.value })}
                                                        className="w-full h-10 rounded-lg bg-transparent border border-white/10 cursor-pointer p-0 overflow-hidden outline-none"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-1">Nome da Concessionária</label>
                                                <input
                                                    type="text"
                                                    value={theme.name}
                                                    onChange={(e) => updateTheme({ name: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 text-sm font-bold text-white transition-all focus:border-indigo-500 outline-none"
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}



                                {activeTab === 'content' && (
                                    <motion.div key="content" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-10">
                                        {/* Hero Section Styling */}
                                        <div className="space-y-6">
                                            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-white/10 pb-2">Hero / Banner Principal</h3>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-1">Título do Hero</label>
                                                <input
                                                    type="text"
                                                    value={theme.heroTitle || ''}
                                                    onChange={(e) => updateTheme({ heroTitle: e.target.value })}
                                                    placeholder="Sua próxima aventura começa aqui."
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 text-sm font-bold text-white transition-all focus:border-indigo-500 outline-none"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-1">Subtítulo Hero</label>
                                                <textarea
                                                    rows={2}
                                                    value={theme.heroSubTitle}
                                                    onChange={(e) => updateTheme({ heroSubTitle: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 text-xs font-medium text-white/70 leading-relaxed transition-all focus:border-indigo-500 outline-none"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-1 flex items-center gap-2"><ImageIcon className="w-3 h-3" /> Imagem de Fundo (Hero)</label>
                                                <div
                                                    className="aspect-[21/9] rounded-2xl bg-white/5 border border-white/10 overflow-hidden relative group cursor-pointer"
                                                    onClick={() => document.getElementById('hero-image-upload')?.click()}
                                                >
                                                    <img src={theme.heroImage || 'https://images.unsplash.com/photo-1558981403-c5f91cbba527?q=80&w=2070'} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Trocar Background</span>
                                                    </div>
                                                </div>

                                                <input
                                                    id="hero-image-upload"
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            setCropFile(file);
                                                            setCropAspectRatio(21 / 9);
                                                            setCropCallback(() => (url: string) => updateTheme({ heroImage: url }));
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-white/10 pb-2">Página Sobre Nós</h3>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-1 flex items-center gap-2"><ImageIcon className="w-3 h-3" /> Foto da Página</label>
                                                <div
                                                    className="aspect-video rounded-2xl bg-white/5 border border-white/10 overflow-hidden relative group cursor-pointer"
                                                    onClick={() => document.getElementById('about-image-upload')?.click()}
                                                >
                                                    {theme.aboutImage ? (
                                                        <img src={theme.aboutImage} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
                                                    ) : (
                                                        <div className="w-full h-full bg-white/5 flex flex-col items-center justify-center gap-2">
                                                            <Upload className="w-6 h-6 text-zinc-600" />
                                                            <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600">Upload de Foto</span>
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Trocar Foto</span>
                                                    </div>
                                                </div>
                                                <input id="about-image-upload" type="file" accept="image/*" className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            setCropFile(file);
                                                            setCropAspectRatio(16 / 9);
                                                            setCropCallback(() => (url: string) => updateTheme({ aboutImage: url }));
                                                        }
                                                    }}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-1">Mini-Banner de Topo (Badge)</label>
                                                <input
                                                    type="text"
                                                    value={theme.navbarCta || ''}
                                                    onChange={(e) => updateTheme({ navbarCta: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 text-xs font-bold text-white transition-all focus:border-indigo-500 outline-none"
                                                    placeholder="Destaque pequeno (ex: Seleção Premium)"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-1 flex items-center gap-2"><Edit3 className="w-3 h-3" /> Call-to-action</label>
                                                <textarea
                                                    rows={3}
                                                    value={theme.aboutText || ''}
                                                    onChange={(e) => updateTheme({ aboutText: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 text-xs font-medium text-white/70 transition-all focus:border-indigo-500 outline-none"
                                                />
                                            </div>

                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-1 flex items-center gap-2"><Edit3 className="w-3 h-3" /> Parágrafos Sobre Nós</label>

                                                <div className="space-y-2">
                                                    {(theme.aboutParagraphs || []).map((p, i) => (
                                                        <div key={i} className="flex gap-2 items-start bg-white/5 p-3 rounded-xl border border-white/5 group">
                                                            <p className="text-xs text-zinc-300 flex-1">{p}</p>
                                                            <button
                                                                onClick={() => {
                                                                    const newParagraphs = theme.aboutParagraphs?.filter((_, idx) => idx !== i);
                                                                    updateTheme({ aboutParagraphs: newParagraphs });
                                                                }}
                                                                className="text-zinc-600 hover:text-red-500 transition-colors"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="flex gap-2">
                                                    <input
                                                        id="new-paragraph-input"
                                                        type="text"
                                                        placeholder="Digite um novo parágrafo..."
                                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs font-medium text-white transition-all focus:border-indigo-500 outline-none"
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                const val = e.currentTarget.value;
                                                                if (val) {
                                                                    updateTheme({ aboutParagraphs: [...(theme.aboutParagraphs || []), val] });
                                                                    e.currentTarget.value = '';
                                                                }
                                                            }
                                                        }}
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            const input = document.getElementById('new-paragraph-input') as HTMLInputElement;
                                                            if (input.value) {
                                                                updateTheme({ aboutParagraphs: [...(theme.aboutParagraphs || []), input.value] });
                                                                input.value = '';
                                                            }
                                                        }}
                                                        className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-xl transition-colors"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>


                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'inventory' && (
                                    <motion.div key="inventory" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Motos no Estoque ({inventory.length})</h3>
                                            <button
                                                onClick={() => setIsAddingMoto(true)}
                                                className="bg-white text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-transform"
                                            >
                                                <Plus className="w-3 h-3" /> Adicionar
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            {inventory.map(moto => (
                                                <div key={moto.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-xl bg-zinc-900 overflow-hidden border border-white/10 flex items-center justify-center">
                                                            {moto.image ? (
                                                                <img src={moto.image} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <Bike className="w-6 h-6 text-zinc-800" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-black uppercase tracking-tight text-white">{moto.make} {moto.model}</p>
                                                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">R$ {moto.price}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <button onClick={() => handleEditMoto(moto)} className="p-2 text-zinc-600 hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all">
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleDeleteMoto(moto.id)} className="p-2 text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'config' && (
                                    <motion.div key="config" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-8">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-1">WhatsApp (Número Limpo)</label>
                                                <input
                                                    type="text"
                                                    value={theme.whatsappNumber}
                                                    onChange={(e) => updateTheme({ whatsappNumber: e.target.value })}
                                                    placeholder="5582998765432"
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 text-xs font-bold text-white transition-all focus:border-indigo-500 outline-none"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-1">Mensagem Padrão WhatsApp</label>
                                                <input
                                                    type="text"
                                                    value={theme.whatsappMessage}
                                                    onChange={(e) => updateTheme({ whatsappMessage: e.target.value })}
                                                    placeholder="Olá, gostaria de saber mais sobre..."
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 text-xs font-bold text-white transition-all focus:border-indigo-500 outline-none"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-1">Endereço da Loja</label>

                                                <div className="flex gap-2 mb-2">
                                                    <input
                                                        type="text"
                                                        placeholder="CEP (00000-000)"
                                                        maxLength={9}
                                                        className="w-1/3 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs font-bold text-white transition-all focus:border-indigo-500 outline-none"
                                                        onChange={async (e) => {
                                                            const cep = e.target.value.replace(/\D/g, '');
                                                            if (cep.length === 8) {
                                                                e.target.style.opacity = '0.5';
                                                                try {
                                                                    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                                                                    const data = await res.json();
                                                                    if (!data.erro) {
                                                                        const formattedAddress = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}, ${data.cep}`;
                                                                        updateTheme({ address: formattedAddress });
                                                                    } else {
                                                                        addToast('CEP não encontrado!', 'warning');
                                                                    }
                                                                } catch (err) {
                                                                    console.error('Erro ao buscar CEP', err);
                                                                }
                                                                e.target.style.opacity = '1';
                                                            }
                                                        }}
                                                    />
                                                    <input
                                                        type="text"
                                                        value={theme.address}
                                                        onChange={(e) => updateTheme({ address: e.target.value })}
                                                        className="w-2/3 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs font-bold text-white transition-all focus:border-indigo-500 outline-none"
                                                        placeholder="Endereço completo"
                                                    />
                                                </div>
                                                <p className="text-[8px] text-zinc-600 italic">Digite o CEP para buscar automaticamente.</p>
                                            </div>

                                            <div className="pt-6 border-t border-white/10 space-y-4">
                                                <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 border-b border-indigo-500/30 pb-2">Backup & Dados</h3>
                                                <button
                                                    onClick={() => {
                                                        const url = `/api/backup?slug=${theme.slug}`;
                                                        window.open(url, '_blank');
                                                    }}
                                                    className="w-full py-4 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-xl flex items-center justify-center gap-3 group transition-all"
                                                >
                                                    <Save className="w-4 h-4 text-indigo-400 group-hover:text-indigo-300" />
                                                    <div className="text-left">
                                                        <p className="text-xs font-black text-indigo-300 uppercase tracking-wide">Baixar Backup Completo</p>
                                                        <p className="text-[9px] text-indigo-400/60 font-medium">Salvar cópia de segurança (JSON)</p>
                                                    </div>
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        const url = `/api/download-source`;
                                                        window.open(url, '_blank');
                                                    }}
                                                    className="w-full py-4 bg-zinc-800/50 hover:bg-zinc-800 border border-white/10 rounded-xl flex items-center justify-center gap-3 group transition-all"
                                                >
                                                    <Layout className="w-4 h-4 text-zinc-400 group-hover:text-white" />
                                                    <div className="text-left">
                                                        <p className="text-xs font-black text-zinc-300 uppercase tracking-wide group-hover:text-white">Baixar Site (Código)</p>
                                                        <p className="text-[9px] text-zinc-500 font-medium">Para Deploy na Netlify/Vercel (ZIP)</p>
                                                    </div>
                                                </button>
                                            </div>

                                            <div className="pt-6 border-t border-white/10 space-y-6">
                                                <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-4">Página de Início</h3>

                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-1">Título Destaques</label>
                                                        <input
                                                            type="text"
                                                            value={theme.featuredTitle}
                                                            onChange={(e) => updateTheme({ featuredTitle: e.target.value })}
                                                            placeholder="Destaques da Semana"
                                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none focus:border-indigo-500"
                                                        />
                                                    </div>

                                                    <div className="pt-4 border-t border-white/5 space-y-4">
                                                        <h4 className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Diferenciais (3 Blocos)</h4>
                                                        <div className="space-y-4">
                                                            {[1, 2, 3].map(num => (
                                                                <div key={num} className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                                                                    <p className="text-[8px] font-black text-indigo-300 uppercase">Bloco {num}</p>
                                                                    <input
                                                                        type="text"
                                                                        value={theme[`feature${num}Title` as keyof typeof theme] as string}
                                                                        onChange={(e) => updateTheme({ [`feature${num}Title`]: e.target.value })}
                                                                        placeholder="Título"
                                                                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-[10px] font-bold text-white outline-none"
                                                                    />
                                                                    <textarea
                                                                        rows={2}
                                                                        value={theme[`feature${num}Desc` as keyof typeof theme] as string}
                                                                        onChange={(e) => updateTheme({ [`feature${num}Desc`]: e.target.value })}
                                                                        placeholder="Descrição"
                                                                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-[10px] font-medium text-white/50 outline-none"
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="pt-4 border-t border-white/5 space-y-4">
                                                        <h4 className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Teaser "Sobre" (Home)</h4>
                                                        <div className="space-y-2">
                                                            <input
                                                                type="text"
                                                                value={theme.aboutTeaserTitle}
                                                                onChange={(e) => updateTheme({ aboutTeaserTitle: e.target.value })}
                                                                placeholder="Paixão por Duas Rodas"
                                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none focus:border-indigo-500"
                                                            />
                                                            <textarea
                                                                rows={3}
                                                                value={theme.aboutTeaserText}
                                                                onChange={(e) => updateTheme({ aboutTeaserText: e.target.value })}
                                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs font-medium text-white/70 outline-none focus:border-indigo-500"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-6 border-t border-white/10 space-y-6">
                                                <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-4">Página de Financiamento</h3>

                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-1">Título da Seção (Badge)</label>
                                                        <input
                                                            type="text"
                                                            value={theme.financingTitle}
                                                            onChange={(e) => updateTheme({ financingTitle: e.target.value })}
                                                            placeholder="Facilidade e Agilidade"
                                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none focus:border-indigo-500"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-1">Hero Subtítulo (Use ? para quebrar e colorir)</label>
                                                        <input
                                                            type="text"
                                                            value={theme.financingSubtitle}
                                                            onChange={(e) => updateTheme({ financingSubtitle: e.target.value })}
                                                            placeholder="Sua Moto Nova?Mais Perto?Que Nunca"
                                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none focus:border-indigo-500"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-1 flex items-center gap-2"><ImageIcon className="w-3 h-3" /> Imagem Hero (Background)</label>
                                                        <div
                                                            className="aspect-[21/9] rounded-2xl bg-white/5 border border-white/10 overflow-hidden relative group cursor-pointer"
                                                            onClick={() => document.getElementById('fin-hero-upload')?.click()}
                                                        >
                                                            <img src={theme.financingHeroImage || 'https://images.unsplash.com/photo-1558981285-6f0c94958bb6?q=80&w=2070'} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
                                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                <span className="text-[10px] font-black uppercase tracking-widest">Trocar Background</span>
                                                            </div>
                                                        </div>
                                                        <input id="fin-hero-upload" type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                try {
                                                                    const url = await storeService.uploadImage(file);
                                                                    if (url) updateTheme({ financingHeroImage: url });
                                                                } catch (err) {
                                                                    console.error(err);
                                                                }
                                                            }
                                                        }} />
                                                    </div>

                                                    <div className="space-y-2 pt-4 border-t border-white/5">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-1">Título Conteúdo (Use ? para quebrar e colorir)</label>
                                                        <input
                                                            type="text"
                                                            value={theme.financingMainTitle}
                                                            onChange={(e) => updateTheme({ financingMainTitle: e.target.value })}
                                                            placeholder="Condições que?Cabem no seu Bolso"
                                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none focus:border-indigo-500"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-1">Texto Institucional Financiamento</label>
                                                        <textarea
                                                            rows={4}
                                                            value={theme.financingText}
                                                            onChange={(e) => updateTheme({ financingText: e.target.value })}
                                                            placeholder="Descreva as facilidades de financiamento..."
                                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-[10px] font-medium text-white/70 outline-none focus:border-indigo-500"
                                                        />
                                                    </div>

                                                    <div className="space-y-2 pt-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-1 flex items-center gap-2"><ImageIcon className="w-3 h-3" /> Foto Lateral Financiamento</label>
                                                        <div
                                                            className="aspect-square rounded-2xl bg-white/5 border border-white/10 overflow-hidden relative group cursor-pointer"
                                                            onClick={() => document.getElementById('fin-secondary-upload')?.click()}
                                                        >
                                                            <img src={theme.financingSecondaryImage || 'https://images.unsplash.com/photo-1444491741275-3747c53c99b4?q=80&w=1974'} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
                                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                <span className="text-[10px] font-black uppercase tracking-widest">Trocar Foto</span>
                                                            </div>
                                                        </div>
                                                        <input id="fin-secondary-upload" type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                try {
                                                                    const url = await storeService.uploadImage(file);
                                                                    if (url) updateTheme({ financingSecondaryImage: url });
                                                                } catch (err) {
                                                                    console.error(err);
                                                                }
                                                            }
                                                        }} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-6 border-t border-white/10 space-y-6">
                                                <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-4">Página de Contato</h3>

                                                <div className="grid grid-cols-1 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-1">Título da Seção</label>
                                                        <input
                                                            type="text"
                                                            value={theme.contactTitle}
                                                            onChange={(e) => updateTheme({ contactTitle: e.target.value })}
                                                            placeholder="Fale Conosco"
                                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none focus:border-indigo-500"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-1">Subtítulo (Use ? para quebrar linha e colorir)</label>
                                                        <input
                                                            type="text"
                                                            value={theme.contactSubtitle}
                                                            onChange={(e) => updateTheme({ contactSubtitle: e.target.value })}
                                                            placeholder="Vamos Começar uma?Nova Jornada?"
                                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none focus:border-indigo-500"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="pt-4 border-t border-white/5 space-y-4">
                                                    <h4 className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Canais e Redes Sociais</h4>
                                                    <div className="space-y-4">
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-1">E-mail Comercial</label>
                                                            <input
                                                                type="email"
                                                                value={theme.email}
                                                                onChange={(e) => updateTheme({ email: e.target.value })}
                                                                placeholder="contato@loja.com.br"
                                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none focus:border-indigo-500"
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-1">Instagram (@usuario)</label>
                                                                <input
                                                                    type="text"
                                                                    value={theme.instagram}
                                                                    onChange={(e) => updateTheme({ instagram: e.target.value })}
                                                                    placeholder="@lojamotos"
                                                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none focus:border-indigo-500"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-1">Facebook (link)</label>
                                                                <input
                                                                    type="text"
                                                                    value={theme.facebook}
                                                                    onChange={(e) => updateTheme({ facebook: e.target.value })}
                                                                    placeholder="facebook.com/loja"
                                                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none focus:border-indigo-500"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="pt-4 border-t border-white/5 space-y-4">
                                                    <h4 className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Canais de Atendimento</h4>
                                                    <div className="space-y-4">
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-1">Título Canais</label>
                                                            <input
                                                                type="text"
                                                                value={theme.channelsTitle}
                                                                onChange={(e) => updateTheme({ channelsTitle: e.target.value })}
                                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none focus:border-indigo-500"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-1">Descrição Canais</label>
                                                            <textarea
                                                                rows={2}
                                                                value={theme.channelsDescription}
                                                                onChange={(e) => updateTheme({ channelsDescription: e.target.value })}
                                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs font-medium text-white/70 outline-none focus:border-indigo-500"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="pt-4 border-t border-white/5 space-y-4">
                                                    <h4 className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Endereço e Horários</h4>
                                                    <div className="space-y-4">
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-1">Título Endereço</label>
                                                            <input
                                                                type="text"
                                                                value={theme.addressTitle}
                                                                onChange={(e) => updateTheme({ addressTitle: e.target.value })}
                                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none focus:border-indigo-500"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-1">Título Horários</label>
                                                            <input
                                                                type="text"
                                                                value={theme.hoursTitle}
                                                                onChange={(e) => updateTheme({ hoursTitle: e.target.value })}
                                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none focus:border-indigo-500"
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div className="space-y-2">
                                                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-1">Horário (Seg-Sex)</label>
                                                                <input
                                                                    type="text"
                                                                    value={theme.hoursWeekdays}
                                                                    onChange={(e) => updateTheme({ hoursWeekdays: e.target.value })}
                                                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none focus:border-indigo-500"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-1">Horário (Sáb)</label>
                                                                <input
                                                                    type="text"
                                                                    value={theme.hoursSaturday}
                                                                    onChange={(e) => updateTheme({ hoursSaturday: e.target.value })}
                                                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none focus:border-indigo-500"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-1">Google Maps (Localização)</label>
                                                    <button
                                                        onClick={() => {
                                                            if (theme.address) {
                                                                // Use Name + Address for better precision (Business Profile)
                                                                const query = encodeURIComponent(`${theme.name} - ${theme.address}`);
                                                                const embedUrl = `https://maps.google.com/maps?q=${query}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
                                                                updateTheme({ mapUrl: embedUrl });
                                                                addToast('Mapa gerado com sucesso!', 'success');
                                                            } else {
                                                                addToast('Preencha o endereço primeiro!', 'warning');
                                                            }
                                                        }}
                                                        className="text-[9px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-wider"
                                                    >
                                                        Gerar (Nome + Endereço)
                                                    </button>
                                                </div>
                                                <textarea
                                                    rows={3}
                                                    value={theme.mapUrl}
                                                    onChange={(e) => {
                                                        let val = e.target.value;

                                                        // Smart extract: if user pastes full iframe, extract src
                                                        if (val.includes('<iframe')) {
                                                            const match = val.match(/src="([^"]+)"/);
                                                            if (match && match[1]) {
                                                                val = match[1];
                                                            }
                                                        }

                                                        updateTheme({ mapUrl: val });
                                                    }}
                                                    placeholder="Cole aqui o link 'Embed' ou o código HTML do Google Maps..."
                                                    className={`w-full bg-white/5 border rounded-xl py-4 px-4 text-[10px] font-mono outline-none ${theme.mapUrl?.includes('maps.app.goo.gl') || (theme.mapUrl?.includes('google.com/maps') && !theme.mapUrl.includes('embed') && !theme.mapUrl.includes('output=embed'))
                                                        ? 'border-red-500/50 text-red-300'
                                                        : 'border-white/10 text-zinc-500'
                                                        }`}
                                                />
                                                {theme.mapUrl?.includes('maps.app.goo.gl') && (
                                                    <p className="text-[9px] text-red-400 font-bold bg-red-500/10 p-2 rounded-lg">
                                                        ⚠️ Você colou um Link de Compartilhamento. O site precisa do Link de Incorporação (Embed).
                                                        <br />
                                                        <span className="font-normal opacity-80">Clique em "Gerar do Endereço" acima ou vá no Google Maps {'>'} Compartilhar {'>'} Incorporar um mapa.</span>
                                                    </p>
                                                )}
                                                {!theme.mapUrl?.includes('maps.app.goo.gl') && (
                                                    <p className="text-[8px] text-zinc-600 italic">Dica: Clique em "Gerar do Endereço" para criar o mapa automaticamente.</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-1">Email Público</label>
                                                <input
                                                    type="text"
                                                    value={theme.email || ''}
                                                    onChange={(e) => updateTheme({ email: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 text-xs font-bold text-white transition-all focus:border-indigo-500 outline-none"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-1 flex items-center gap-2"><Instagram className="w-3 h-3" /> Instagram Link</label>
                                                <input
                                                    type="text"
                                                    value={theme.instagram}
                                                    onChange={(e) => updateTheme({ instagram: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 text-[10px] font-mono text-zinc-500 outline-none"
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="p-8 border-t border-white/5 flex gap-4">
                            <button onClick={() => setEditMode(false)} className="flex-1 py-4 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all text-white flex items-center justify-center gap-2">
                                <Eye className="w-4 h-4" /> Visualizar
                            </button>
                            <button onClick={() => setIsOpen(false)} className="flex-1 py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
                                <Save className="w-4 h-4" /> Concluir
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence >

            {/* Add Motorcycle Modal */}
            <AnimatePresence>
                {
                    isAddingMoto && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-end md:items-center justify-center p-0 md:p-6">
                            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-4xl bg-zinc-950 border-t md:border border-white/10 rounded-t-[2rem] md:rounded-[3rem] p-6 md:p-10 shadow-2xl space-y-6 md:space-y-8 overflow-y-auto max-h-[90vh] md:max-h-[95vh]">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">
                                        {editingId ? 'Editar Motocicleta' : 'Nova Motocicleta'}
                                    </h2>
                                    <button onClick={() => { setIsAddingMoto(false); setEditingId(null); }} className="text-zinc-500 hover:text-white"><X /></button>
                                </div>

                                <form onSubmit={handleAddMoto} className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Marca</label>
                                                <input required value={newMoto.make} onChange={e => setNewMoto({ ...newMoto, make: e.target.value })} className="w-full bg-white/5 border border-white/5 rounded-xl py-4 px-4 text-sm font-bold text-white outline-none focus:border-indigo-500" placeholder="Honda" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Modelo</label>
                                                <input required value={newMoto.model} onChange={e => setNewMoto({ ...newMoto, model: e.target.value })} className="w-full bg-white/5 border border-white/5 rounded-xl py-4 px-4 text-sm font-bold text-white outline-none focus:border-indigo-500" placeholder="CB 650R" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Ano</label>
                                                <input type="number" value={newMoto.year} onChange={e => setNewMoto({ ...newMoto, year: e.target.value })} className="w-full bg-white/5 border border-white/5 rounded-xl py-4 px-4 text-sm font-bold text-white outline-none focus:border-indigo-500" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Preço (R$)</label>
                                                <input required value={newMoto.price} onChange={e => setNewMoto({ ...newMoto, price: e.target.value })} className="w-full bg-white/5 border border-white/5 rounded-xl py-4 px-4 text-sm font-bold text-white outline-none focus:border-indigo-500" placeholder="45.900" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="space-y-2">
                                                <label className="text-[8px] font-black uppercase tracking-widest text-zinc-600">KM</label>
                                                <input value={newMoto.km} onChange={e => setNewMoto({ ...newMoto, km: e.target.value })} className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-3 text-xs font-bold text-white outline-none focus:border-indigo-500" placeholder="0" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[8px] font-black uppercase tracking-widest text-zinc-600">Cor</label>
                                                <input value={newMoto.color} onChange={e => setNewMoto({ ...newMoto, color: e.target.value })} className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-3 text-xs font-bold text-white outline-none focus:border-indigo-500" placeholder="Preto" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[8px] font-black uppercase tracking-widest text-zinc-600">Combust.</label>
                                                <input value={newMoto.fuelType} onChange={e => setNewMoto({ ...newMoto, fuelType: e.target.value })} className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-3 text-xs font-bold text-white outline-none focus:border-indigo-500" placeholder="Flex" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 pt-2">
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-1">Condição</label>
                                                <div className="flex gap-2 p-1 bg-white/5 border border-white/5 rounded-2xl">
                                                    {['Nova', 'Seminova', 'Repasse'].map((option) => (
                                                        <button
                                                            key={option}
                                                            type="button"
                                                            onClick={() => setNewMoto({ ...newMoto, condition: option as any })}
                                                            className={`flex-1 py-3 px-2 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all ${newMoto.condition === option
                                                                ? 'bg-white text-black shadow-lg scale-[1.02]'
                                                                : 'text-zinc-500 hover:text-white hover:bg-white/5'
                                                                }`}
                                                        >
                                                            {option}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-1">Opções</label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setNewMoto({ ...newMoto, hasWarranty: !newMoto.hasWarranty })}
                                                        className={`p-1 rounded-2xl border transition-all flex items-center gap-2 group ${newMoto.hasWarranty ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-white/5 border-white/5'}`}
                                                    >
                                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${newMoto.hasWarranty ? 'bg-indigo-500 text-white' : 'bg-zinc-900 text-zinc-700'}`}>
                                                            <ShieldCheck className="w-4 h-4" />
                                                        </div>
                                                        <div className="text-left">
                                                            <p className={`text-[8px] font-black uppercase tracking-tighter ${newMoto.hasWarranty ? 'text-indigo-400' : 'text-zinc-500'}`}>
                                                                Garantia
                                                            </p>
                                                        </div>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => setNewMoto({ ...newMoto, is_featured: !newMoto.is_featured })}
                                                        className={`p-1 rounded-2xl border transition-all flex items-center gap-2 group ${newMoto.is_featured ? 'bg-amber-500/10 border-amber-500/30' : 'bg-white/5 border-white/5'}`}
                                                    >
                                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${newMoto.is_featured ? 'bg-amber-500 text-black' : 'bg-zinc-900 text-zinc-700'}`}>
                                                            <Star className="w-4 h-4" />
                                                        </div>
                                                        <div className="text-left">
                                                            <p className={`text-[8px] font-black uppercase tracking-tighter ${newMoto.is_featured ? 'text-amber-400' : 'text-zinc-500'}`}>
                                                                Destaque
                                                            </p>
                                                        </div>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 flex items-center justify-between">
                                                Galeria de Imagens
                                                <span className="text-[8px] font-medium text-white/20 italic">A primeira será a principal</span>
                                            </label>

                                            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                                                {/* Show current images */}
                                                {(newMoto.images || []).map((img, i) => (
                                                    <div key={i} className="aspect-square rounded-xl bg-white/5 border border-white/10 relative group overflow-hidden">
                                                        <img src={img} className="w-full h-full object-cover" />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const filtered = newMoto.images?.filter((_, idx) => idx !== i);
                                                                setNewMoto({ ...newMoto, images: filtered, image: filtered?.[0] || '' });
                                                            }}
                                                            className="absolute inset-0 bg-red-600/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                                        >
                                                            <Trash2 className="w-4 h-4 text-white" />
                                                        </button>
                                                    </div>
                                                ))}

                                                {/* Add Button */}
                                                {(newMoto.images?.length || 0) < 8 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => document.getElementById('moto-gallery-upload')?.click()}
                                                        className="aspect-square rounded-xl bg-white/5 border-2 border-dashed border-white/10 flex items-center justify-center hover:border-indigo-500/50 transition-all"
                                                    >
                                                        <Plus className="w-5 h-5 text-white/20" />
                                                    </button>
                                                )}
                                            </div>

                                            <input
                                                id="moto-gallery-upload"
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                className="hidden"
                                                onChange={async (e) => {
                                                    const files = Array.from(e.target.files || []);
                                                    for (const file of files) {
                                                        try {
                                                            const url = await storeService.uploadImage(file);
                                                            if (url) {
                                                                setNewMoto(prev => {
                                                                    const newImages = [...(prev.images || []), url];
                                                                    return {
                                                                        ...prev,
                                                                        images: newImages,
                                                                        image: prev.image || newImages[0]
                                                                    };
                                                                });
                                                            }
                                                        } catch (err) {
                                                            console.error('Upload failed for file:', file.name, err);
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>

                                        <button type="submit" className="w-full bg-white text-black py-6 rounded-[2rem] font-black uppercase tracking-widest mt-4 hover:scale-[1.02] transition-transform shadow-2xl flex items-center justify-center gap-3">
                                            Adicionar ao Estoque <Plus className="w-5 h-5" />
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )
                }
            </AnimatePresence >
            {/* Cropper Modal */}
            < ImageCropperModal
                isOpen={!!cropFile
                }
                onClose={() => setCropFile(null)}
                imageFile={cropFile}
                aspectRatio={cropAspectRatio}
                onCropComplete={cropCallback}
            />
        </>
    );
}
