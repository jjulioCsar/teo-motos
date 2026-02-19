"use client";

import React, { useState, useEffect } from 'react';
import { Calculator, DollarSign, Calendar, Percent } from 'lucide-react';

interface SimulatorProps {
    initialPrice?: number;
    primaryColor?: string;
}

export default function FinancingSimulator({ initialPrice = 25000, primaryColor = '#6366f1' }: SimulatorProps) {
    const [price, setPrice] = useState(initialPrice);
    const [entry, setEntry] = useState(initialPrice * 0.3); // 30% default entry
    const [months, setMonths] = useState(48);
    const [monthlyPayment, setMonthlyPayment] = useState(0);

    // Interest rate (mock) - 1.8% per month
    const INTEREST_RATE = 0.018;

    useEffect(() => {
        const principal = price - entry;
        if (principal <= 0) {
            setMonthlyPayment(0);
            return;
        }

        // Formula: PMT = P * i * (1+i)^n / ((1+i)^n - 1)
        const i = INTEREST_RATE;
        const n = months;
        const pmt = principal * (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);

        setMonthlyPayment(pmt);
    }, [price, entry, months]);

    return (
        <div className="bg-zinc-900/50 border border-white/10 rounded-[2rem] p-8 space-y-8">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center" style={{ color: primaryColor }}>
                    <Calculator className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">Simulador de Financiamento</h3>
                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Faça uma simulação agora</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Vehicle Price */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Valor da Moto</label>
                    <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(Number(e.target.value))}
                            className="w-full bg-black/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white font-bold outline-none focus:border-indigo-500 transition-colors"
                        />
                    </div>
                </div>

                {/* Entry Payment */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Entrada (R$)</label>
                    <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <input
                            type="number"
                            value={entry}
                            onChange={(e) => setEntry(Number(e.target.value))}
                            max={price - 1000}
                            className="w-full bg-black/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white font-bold outline-none focus:border-indigo-500 transition-colors"
                        />
                    </div>
                    <input
                        type="range"
                        min="0"
                        max={price * 0.9}
                        value={entry}
                        onChange={(e) => setEntry(Number(e.target.value))}
                        className="w-full accent-indigo-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                        style={{ accentColor: primaryColor }}
                    />
                </div>

                {/* Terms */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Parcelas: {months}x</label>
                    <div className="grid grid-cols-4 gap-2">
                        {[12, 24, 36, 48].map((m) => (
                            <button
                                key={m}
                                onClick={() => setMonths(m)}
                                className={`py-2 rounded-lg text-xs font-black transition-all ${months === m ? 'bg-white text-black' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
                                style={months === m ? { backgroundColor: primaryColor, color: 'white' } : {}}
                            >
                                {m}x
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="pt-8 border-t border-white/10 text-center space-y-2">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Valor da Parcela Estimada</p>
                <div className="text-4xl font-black text-white tracking-tighter">
                    {monthlyPayment.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    <span className="text-sm font-bold text-white/30 ml-2">/mês</span>
                </div>
                <p className="text-[10px] text-white/20 italic pt-2">
                    *Valores aproximados. Sujeito a análise de crédito e alterações sem aviso prévio. Taxas podem variar.
                </p>
            </div>
        </div>
    );
}
