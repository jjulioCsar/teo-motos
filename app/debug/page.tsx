"use client";

import React, { useState } from 'react';
import { storeService } from '@/lib/services/storeService';

export default function DebugPage() {
    const [email, setEmail] = useState('');
    const [slug, setSlug] = useState('');
    const [manualName, setManualName] = useState('');
    const [manualSlug, setManualSlug] = useState('');
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<any>(null);

    const checkEmail = async () => {
        try {
            setError(null);
            setResult(null);
            console.log('Testing email:', email);
            const data = await storeService.getStoreByEmail(email);
            setResult(data || "Nenhuma loja encontrada com este email");
        } catch (err: any) {
            console.error(err);
            setError(`Erro no email: ${err.message || JSON.stringify(err)}`);
        }
    };

    const checkSlug = async () => {
        try {
            setError(null);
            setResult(null);
            console.log('Testing slug:', slug);
            const data = await storeService.getStoreBySlug(slug);
            setResult(data || "Nenhuma loja encontrada com este slug");
        } catch (err: any) {
            console.error(err);
            setError(`Erro no slug: ${err.message || JSON.stringify(err)}`);
        }
    };

    const testWrite = async () => {
        if (!manualSlug || !manualName) {
            alert("Preencha Slug e Nome para criar.");
            return;
        }
        try {
            setError(null);
            setResult(null);
            console.log('Creating store manually:', manualSlug);

            await storeService.saveStore(manualSlug, {
                name: manualName,
                primaryColor: '#6366f1',
                secondaryColor: '#4f46e5',
                tertiaryColor: '#ef4444',
                whatsappNumber: '5582999999999',
                whatsappMessage: 'Olá! Vim pelo site.',
                isDarkMode: true
            });

            setResult(`SUCESSO TOTAL! Loja '${manualName}' criada. Acesse: localhost:3000/${manualSlug}`);
        } catch (err: any) {
            console.error(err);
            setError(`Erro na criação: ${err.message || JSON.stringify(err)}`);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-10 font-mono">
            <h1 className="text-2xl mb-8 font-bold text-red-500">Ferramenta: Criar Loja Manualmente</h1>
            <p className="mb-8 text-zinc-400">Use esta página para forçar a criação da sua loja se o onboarding estiver travando.</p>

            <div className="grid grid-cols-2 gap-10">
                <div className="space-y-4 p-5 border border-white/20 rounded-xl bg-zinc-900/50">
                    <h2 className="text-xl font-bold text-blue-400">1. Buscar Loja Existente</h2>
                    <input
                        className="w-full bg-black p-3 border border-white/10 rounded-lg text-white"
                        placeholder="Digite o slug (ex: teomotos)..."
                        value={slug}
                        onChange={e => setSlug(e.target.value)}
                    />
                    <button onClick={checkSlug} className="bg-blue-600 px-6 py-2 rounded-lg text-white w-full hover:bg-blue-700 font-bold">Verificar se Existe</button>
                    {result && <pre className="text-xs text-green-400 overflow-auto max-h-40">{JSON.stringify(result, null, 2)}</pre>}
                </div>

                <div className="space-y-4 p-5 border border-green-500/30 rounded-xl bg-green-900/10">
                    <h2 className="text-xl font-bold text-green-400">2. Criar Nova Loja (Forçar)</h2>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-zinc-500">Slug (URL)</label>
                        <input
                            className="w-full bg-black p-3 border border-white/10 rounded-lg text-white"
                            placeholder="ex: teomotos-oficial"
                            value={manualSlug}
                            onChange={e => setManualSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-zinc-500">Nome da Loja</label>
                        <input
                            className="w-full bg-black p-3 border border-white/10 rounded-lg text-white"
                            placeholder="ex: Téo Motos"
                            value={manualName}
                            onChange={e => setManualName(e.target.value)}
                        />
                    </div>
                    <button onClick={testWrite} className="bg-green-600 px-6 py-3 rounded-lg text-white w-full hover:bg-green-700 font-bold shadow-lg shadow-green-900/20">
                        CRIAR LOJA AGORA
                    </button>
                </div>
            </div>

            <div className="mt-10 p-5 bg-zinc-900 border border-white/20 rounded-xl overflow-auto max-h-[300px]">
                <h3 className="text-lg font-bold mb-2">Logs do Sistema:</h3>
                {error && <div className="p-4 bg-red-900/20 border border-red-500/50 text-red-200 rounded-lg mb-4">{error}</div>}
                {result && typeof result === 'string' && result.includes('SUCESSO') && (
                    <div className="p-4 bg-green-900/20 border border-green-500/50 text-green-200 rounded-lg text-xl font-bold animate-pulse">
                        {result}
                    </div>
                )}
            </div>
        </div>
    );
}
