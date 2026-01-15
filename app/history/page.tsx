"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trash2, TrendingUp, DollarSign } from 'lucide-react';

export default function History() {
  const [data, setData] = useState<any>({ transactions: [] });

  const fetchData = async () => {
    const res = await fetch('/api/pos');
    const d = await res.json();
    setData(d);
  };

  useEffect(() => { fetchData(); }, []);

  const totalOmzet = data.transactions.reduce((acc:any, t:any) => acc + (t.totalPrice || 0), 0);
  const totalLaba = data.transactions.reduce((acc:any, t:any) => acc + (t.profit || 0), 0);

  return (
    <div className="min-h-screen bg-[#0A0C10] text-slate-400 p-8">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <Link href="/" className="p-3 bg-white/5 rounded-xl hover:text-white"><ArrowLeft size={20}/></Link>
          <h1 className="text-xl font-black text-white italic tracking-widest uppercase">Financial <span className="text-emerald-500">Report</span></h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-[#0F1218] border border-white/5 p-8 rounded-[32px]">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-2">Total Omzet</p>
            <p className="text-3xl font-black text-white italic tracking-tighter">Rp {totalOmzet.toLocaleString()}</p>
          </div>
          <div className="bg-emerald-500/5 border border-emerald-500/20 p-8 rounded-[32px] shadow-[0_0_50px_rgba(16,185,129,0.05)]">
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-2 flex items-center gap-2"><TrendingUp size={14}/> Laba Bersih</p>
            <p className="text-3xl font-black text-emerald-400 italic tracking-tighter">Rp {totalLaba.toLocaleString()}</p>
          </div>
        </div>

        <div className="space-y-4">
          {data.transactions.slice().reverse().map((t: any) => (
            <div key={t.id} className="bg-[#0F1218] border border-white/5 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 group hover:border-emerald-500/30 transition-all">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-black text-white uppercase">{t.id}</span>
                  <span className="text-[10px] font-mono text-slate-700">{t.date}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {t.items?.map((it:any, i:number) => (
                    <span key={i} className="text-[9px] font-bold text-slate-500 bg-white/5 px-2 py-1 rounded-md">{it.name} (x{it.qty})</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-8 border-t md:border-0 border-white/5 pt-4 md:pt-0 w-full md:w-auto">
                <div className="text-right">
                  <p className="text-[9px] font-black text-slate-600 uppercase">Omzet</p>
                  <p className="text-sm font-bold text-white tracking-tighter">Rp {t.totalPrice.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-emerald-600 uppercase">Laba</p>
                  <p className="text-sm font-black text-emerald-500 italic tracking-tighter">+Rp {t.profit?.toLocaleString()}</p>
                </div>
                <button onClick={async () => { if(confirm('Hapus?')) { await fetch('/api/pos', { method: 'POST', body: JSON.stringify({ type: 'DELETE_TRANSACTION', id: t.id }) }); fetchData(); } }} className="p-2 text-slate-800 hover:text-rose-500 transition-colors"><Trash2 size={18}/></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}