"use client";
import React, { useState, useEffect } from 'react';
import { Home, Receipt, Settings, Trash2, Clock, BarChart3 } from 'lucide-react';

export default function HistoryGlass() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  const fetchData = async () => {
    const res = await fetch(`/api/pos?t=${Date.now()}`, { cache: 'no-store' });
    const data = await res.json();
    setTransactions(data.transactions || []);
  };

  useEffect(() => { setIsMounted(true); fetchData(); }, []);

  const calculateTotal = (key: string) => transactions.reduce((sum, t) => sum + Number(t[key] || 0), 0);

  if (!isMounted) return null;

  return (
    <div className="h-screen bg-slate-50 flex flex-col md:flex-row font-sans overflow-hidden">
      {/* SIDEBAR - CONSISTENT */}
      <aside className="hidden md:flex w-20 bg-white border-r border-slate-200 flex-col items-center py-8 gap-6 h-full">
        <button onClick={() => window.location.href='/'} className="p-3 text-slate-400 hover:text-[#00AA5B] transition-all"><Home size={22}/></button>
        <button onClick={() => window.location.href='/history'} className="p-3 text-[#00AA5B] bg-green-50 rounded-xl"><Receipt size={22}/></button>
        <button onClick={() => window.location.href='/setting'} className="p-3 text-slate-400 hover:text-[#00AA5B] transition-all"><Settings size={22}/></button>
      </aside>

      <div className="flex-1 overflow-y-auto p-4 md:p-10 pb-24">
        <div className="max-w-4xl mx-auto space-y-6">
          <header><h1 className="text-2xl font-black text-slate-800 uppercase italic">Riwayat Penjualan</h1></header>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm"><p className="text-[10px] font-black text-slate-400 uppercase">Total Omzet</p><p className="text-2xl font-black text-slate-800 tracking-tighter">Rp{calculateTotal('total').toLocaleString()}</p></div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm"><p className="text-[10px] font-black text-green-500 uppercase">Estimasi Laba</p><p className="text-2xl font-black text-green-600 tracking-tighter">Rp{calculateTotal('profit').toLocaleString()}</p></div>
          </div>

          <div className="space-y-3">
             {[...transactions].reverse().map((t, idx) => (
                <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-200 flex flex-col gap-3">
                    <div className="flex justify-between items-center"><span className="text-[10px] font-black text-slate-400 uppercase">{new Date(t.date).toLocaleString()}</span><span className="text-[10px] font-black bg-slate-100 px-2 py-1 rounded">ID: {idx+1}</span></div>
                    <div className="flex flex-wrap gap-2">{t.items?.map((it:any, i:number) => (<span key={i} className="px-3 py-1 bg-slate-50 border border-slate-100 text-[10px] font-bold rounded-full uppercase">{it.name} x{it.qty}</span>))}</div>
                    <div className="flex justify-between border-t pt-3 items-center"><span className="text-xs font-bold text-slate-400">Profit: Rp{t.profit?.toLocaleString()}</span><span className="text-sm font-black text-green-600 italic">Total: Rp{t.total?.toLocaleString()}</span></div>
                </div>
             ))}
          </div>
        </div>
      </div>

      {/* MOBILE NAV - CONSISTENT */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center h-16 z-50">
        <button onClick={() => window.location.href='/'} className="text-slate-400 flex flex-col items-center"><Home size={20}/><span className="text-[10px] font-bold">Home</span></button>
        <button onClick={() => window.location.href='/history'} className="text-[#00AA5B] flex flex-col items-center"><Receipt size={20}/><span className="text-[10px] font-bold">Riwayat</span></button>
        <button onClick={() => window.location.href='/setting'} className="text-slate-400 flex flex-col items-center"><Settings size={20}/><span className="text-[10px] font-bold">Setelan</span></button>
      </nav>
    </div>
  );
}