"use client";
import React, { useState, useEffect } from 'react';
import { Home, Receipt, Settings, Trash2, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HistoryGlass() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/pos?t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      setTransactions(data.transactions || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchData();
  }, []);

  const deleteTx = async (id: any) => {
    if (!confirm("Hapus laporan ini?")) return;
    const res = await fetch('/api/pos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'DELETE_TRANSACTION', id })
    });
    if (res.ok) fetchData();
  };

  const calculateTotal = (key: string) => transactions.reduce((sum, t) => sum + Number(t[key] || 0), 0);

  if (!isMounted) return null;

  return (
    <div className="h-screen bg-slate-50 flex flex-col md:flex-row font-sans overflow-hidden">
      <aside className="hidden md:flex w-20 bg-white border-r border-slate-200 flex-col items-center py-8 gap-6 h-full">
        <button onClick={() => window.location.href='/'} className="p-3 text-slate-400 hover:text-[#00AA5B] transition-all"><Home size={22}/></button>
        <button onClick={() => window.location.href='/history'} className="p-3 text-orange-600 bg-orange-50 rounded-xl"><Receipt size={22}/></button>
        <button onClick={() => window.location.href='/setting'} className="p-3 text-slate-400 hover:text-[#00AA5B] transition-all"><Settings size={22}/></button>
      </aside>

      <div className="flex-1 overflow-y-auto p-4 md:p-10 pb-24 md:pb-10">
        <div className="max-w-4xl mx-auto space-y-6">
          <header><h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Riwayat Laporan</h1><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Data penjualan real-time</p></header>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm"><p className="text-[9px] font-black text-slate-400 uppercase mb-1">Omzet</p><p className="text-xl font-black text-slate-800">Rp{calculateTotal('total').toLocaleString()}</p></div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-green-500"><p className="text-[9px] font-black text-green-600 uppercase mb-1">Laba Bersih</p><p className="text-xl font-black text-green-600">Rp{calculateTotal('profit').toLocaleString()}</p></div>
          </div>

          <div className="space-y-3">
            <h3 className="font-black text-xs uppercase text-slate-500 flex items-center gap-2 px-1"><Clock size={16}/> Log Penjualan Terbaru</h3>
            <AnimatePresence>
              {[...transactions].reverse().map((t) => (
                <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3 hover:border-orange-200 transition-all">
                  <div className="flex justify-between items-start">
                    <div><p className="text-[10px] font-black text-slate-400 uppercase italic">{new Date(t.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}</p><p className="text-[9px] text-slate-400 font-bold">{new Date(t.date).toLocaleTimeString('id-ID')}</p></div>
                    <button onClick={() => deleteTx(t.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all rounded-lg"><Trash2 size={16}/></button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">{t.items?.map((it:any, i:number) => (<span key={i} className="px-2 py-1 bg-slate-50 border border-slate-100 text-[10px] font-bold rounded-lg uppercase text-slate-600">{it.name} <span className="text-orange-500 ml-1">x{it.qty}</span></span>))}</div>
                  <div className="pt-3 border-t border-slate-50 flex justify-between items-center"><span className="text-[9px] font-black text-slate-400 uppercase">Profit Transaksi:</span><span className="font-black text-orange-600 italic text-sm">Rp{Number(t.profit || 0).toLocaleString()}</span></div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}