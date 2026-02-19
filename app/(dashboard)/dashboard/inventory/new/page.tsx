"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, Upload, X, ArrowLeft, Info, Plus } from 'lucide-react';
import { inventoryService } from '@/lib/services/storeService';

const STEPS = ['Informações Básicas', 'Detalhes Técnicos', 'Fotos & Galeria', 'Revisão'];

import { useStoreTheme } from '@/lib/context/ThemeContext';

export default function AddMotorcyclePage() {
    const { theme } = useStoreTheme();
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        make: '',
        model: '',
        year: '',
        price: '',
        mileage: '',
        color: '',
        cc: '',
        status: 'available'
    });

    const handleFinish = async () => {
        await inventoryService.addMotorcycle(theme.slug || 'teomotos', {
            // id is omitted
            make: formData.make,
            model: formData.model,
            year: formData.year,
            price: formData.price,
            status: formData.status as any,
            km: formData.mileage,
            color: formData.color,
            description: '',
            image: '',
            images: [],
            features: [],
            condition: 'Seminova',
            hasWarranty: false
        });
        window.location.href = '/dashboard/inventory';
    };

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-12">
            {/* Stepper Header */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    {STEPS.map((step, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${currentStep >= i ? 'bg-black text-white scale-110 shadow-lg' : 'bg-zinc-100 text-zinc-400'
                                }`}>
                                {currentStep > i ? <Check className="w-4 h-4" /> : i + 1}
                            </div>
                            <span className={`text-xs font-black uppercase tracking-widest hidden md:block ${currentStep >= i ? 'text-black' : 'text-zinc-300'
                                }`}>
                                {step}
                            </span>
                            {i < STEPS.length - 1 && <ChevronRight className="w-4 h-4 text-zinc-200 mx-2 hidden md:block" />}
                        </div>
                    ))}
                </div>
                <div className="h-1 bg-zinc-100 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-black"
                        initial={{ width: '0%' }}
                        animate={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
                    />
                </div>
            </div>

            {/* Form Content */}
            <div className="bg-white rounded-[2.5rem] border p-12 shadow-sm min-h-[500px] flex flex-col">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="flex-1"
                    >
                        {currentStep === 0 && (
                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight mb-2">Vamos começar pelo básico</h2>
                                    <p className="text-zinc-500">Identifique a motocicleta que você deseja anunciar.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Marca</label>
                                        <select
                                            value={formData.make}
                                            onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                                            className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-zinc-950/10 font-medium"
                                        >
                                            <option value="">Selecione a marca</option>
                                            <option>Honda</option>
                                            <option>Yamaha</option>
                                            <option>BMW</option>
                                            <option>Kawasaki</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Modelo</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: MT-03 ABS"
                                            value={formData.model}
                                            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                            className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-zinc-950/10 font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Ano de Fabricação</label>
                                        <input
                                            type="number"
                                            placeholder="2024"
                                            value={formData.year}
                                            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                            className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-zinc-950/10 font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Preço de Venda (R$)</label>
                                        <input
                                            type="text"
                                            placeholder="32.900"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-zinc-950/10 font-black text-xl"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 1 && (
                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight mb-2">Ficha Técnica</h2>
                                    <p className="text-zinc-500">Detalhes que fazem a diferença para o comprador.</p>
                                </div>

                                <div className="grid grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Quilometragem</label>
                                        <input
                                            type="number"
                                            placeholder="12400"
                                            value={formData.mileage}
                                            onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                                            className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-zinc-950/10 font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Cor</label>
                                        <input
                                            type="text"
                                            placeholder="Cinza"
                                            value={formData.color}
                                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                            className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-zinc-950/10 font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Cilindradas (cc)</label>
                                        <input
                                            type="number"
                                            placeholder="321"
                                            value={formData.cc}
                                            onChange={(e) => setFormData({ ...formData, cc: e.target.value })}
                                            className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-zinc-950/10 font-medium"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="space-y-8 text-center pb-8">
                                <div className="w-24 h-24 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-6 text-zinc-300">
                                    <Upload className="w-10 h-10" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black tracking-tight mb-2">Imagens que encantam</h2>
                                    <p className="text-zinc-500 max-w-md mx-auto">Fotos nítidas e bem iluminadas aumentam suas chances de venda em até 80%.</p>
                                </div>

                                <div className="border-2 border-dashed border-zinc-100 rounded-[2rem] p-12 hover:border-black/10 transition-colors cursor-pointer group">
                                    <p className="text-sm font-bold text-zinc-400 group-hover:text-black transition-colors">Arraste seus arquivos aqui ou clique para buscar</p>
                                    <p className="text-[10px] uppercase font-black tracking-widest text-zinc-200 mt-2">Suporta JPG, PNG (Max 10MB)</p>
                                </div>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight mb-2">Quase lá!</h2>
                                    <p className="text-zinc-500">Revise os detalhes antes de publicar na sua vitrine.</p>
                                </div>
                                <div className="bg-zinc-50 rounded-3xl p-8 border border-zinc-100 space-y-4">
                                    <div className="flex justify-between items-center border-b pb-4">
                                        <span className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Veículo</span>
                                        <span className="font-black text-xl">{formData.make} {formData.model}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b pb-4">
                                        <span className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Preço</span>
                                        <span className="font-black text-xl text-indigo-600">R$ {formData.price}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Km</span>
                                        <span className="font-bold">{formData.mileage} KM</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Footer Actions */}
                <div className="mt-12 pt-8 border-t flex items-center justify-between">
                    <button
                        disabled={currentStep === 0}
                        onClick={() => setCurrentStep(prev => prev - 1)}
                        className="flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-black disabled:opacity-0 transition-all font-black uppercase tracking-widest"
                    >
                        <ArrowLeft className="w-4 h-4" /> Voltar
                    </button>
                    <button
                        onClick={() => currentStep < STEPS.length - 1 ? setCurrentStep(prev => prev + 1) : handleFinish()}
                        className="bg-black text-white px-10 py-4 rounded-2xl font-black text-lg hover:scale-105 transition-transform flex items-center gap-2 shadow-xl shadow-zinc-200"
                    >
                        {currentStep === STEPS.length - 1 ? 'Finalizar Anúncio' : 'Continuar'} <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="bg-indigo-50/50 border border-indigo-100 rounded-3xl p-6 flex gap-4 text-indigo-900/60 text-sm font-medium">
                <Info className="w-5 h-5 shrink-0 text-indigo-400" />
                <p>Dica: Certifique-se de que os documentos estão em dia antes de publicar o anúncio para evitar transtornos na venda.</p>
            </div>
        </div>
    );
}
