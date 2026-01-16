"use client";
import React, { useState, useEffect } from 'react';
import { Home, Receipt, Settings, Trash2, Calendar, TrendingUp, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HistoryGlass() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/pos');
      const data = await res.json();
      setTransactions(data.transactions || []);
    } catch (err) { console.error(err); }
  };

  const deleteTx = async (id: any) => {
    if (!confirm("Hapus laporan ini?")) return;
    const res = await fetch('/api/pos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'DELETE_TRANSACTION', id })
    });
    if (res.ok) setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const calculateTotal = (key: string) => transactions.reduce((sum, t) => sum + Number(t[key] || 0), 0);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-50 via-white to-slate-100 flex flex-col md:flex-row font-sans pb-24 md:pb-0">
      
      {/* SIDEBAR (Desktop) */}
      <aside className="hidden md:flex w-20 bg-white/40 backdrop-blur-xl border-r border-white/60 flex-col items-center py-8 gap-6 h-screen sticky top-0 z-20">
        <button onClick={() => window.location.href='/'} className="p-3 text-gray-400 hover:text-[#00AA5B] transition-all"><Home size={22}/></button>
        <button onClick={() => window.location.href='/history'} className="p-3 text-orange-600 bg-white/80 rounded-xl shadow-sm border border-white"><Receipt size={22}/></button>
        <button onClick={() => window.location.href='/setting'} className="p-3 text-gray-400 hover:text-blue-600 transition-all"><Settings size={22}/></button>
      </aside>

      {/* BOTTOM NAV (Mobile) */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 bg-white/60 backdrop-blur-2xl border border-white/80 h-16 rounded-2xl flex items-center justify-around z-50 shadow-2xl">
        <button onClick={() => window.location.href='/'} className="p-3 text-gray-400"><Home size={24}/></button>
        <button onClick={() => window.location.href='/history'} className="p-3 text-orange-600 bg-orange-100/50 rounded-xl"><Receipt size={24}/></button>
        <button onClick={() => window.location.href='/setting'} className="p-3 text-gray-400"><Settings size={24}/></button>
      </nav>

      <div className="flex-1 max-w-5xl mx-auto p-4 md:p-10 space-y-6 w-full">
        <header>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Riwayat Laporan</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Data penjualan real-time</p>
        </header>

        {/* STATS */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/40 backdrop-blur-md p-4 rounded-2xl border border-white shadow-sm">
            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Omzet</p>
            <p className="text-lg font-black text-slate-800">Rp{calculateTotal('total').toLocaleString()}</p>
          </div>
          <div className="bg-green-500/10 backdrop-blur-md p-4 rounded-2xl border border-white shadow-sm">
            <p className="text-[9px] font-black text-green-600/60 uppercase mb-1">Laba</p>
            <p className="text-lg font-black text-green-600">Rp{calculateTotal('profit').toLocaleString()}</p>
          </div>
        </div>

        {/* LOG LIST */}
        <div className="space-y-3">
          <h3 className="font-black text-xs uppercase tracking-widest text-slate-500 flex items-center gap-2 px-1"><Clock size={16}/> Log Terbaru</h3>
          
          <AnimatePresence>
            {[...transactions].reverse().map((t) => (
              <motion.div 
                key={t.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/40 backdrop-blur-md p-4 rounded-2xl border border-white shadow-sm flex flex-col gap-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase italic">
                      {new Date(t.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}
                    </p>
                    <p className="text-[9px] text-slate-400 font-bold">{new Date(t.date).toLocaleTimeString('id-ID')}</p>
                  </div>
                  <button onClick={() => deleteTx(t.id)} className="p-2 text-red-200 hover:text-red-500 transition-colors bg-white/50 rounded-lg border border-white">
                    <Trash2 size={16}/>
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {t.items?.map((it:any, i:number) => (
                    <span key={i} className="px-2 py-1 bg-white/80 border border-white text-[10px] font-bold rounded-lg uppercase text-slate-600 shadow-sm">
                      {it.name} <span className="text-orange-500">x{it.qty}</span>
                    </span>
                  ))}
                </div>

                <div className="pt-3 border-t border-white/60 flex justify-between items-center">
                   <span className="text-[9px] font-black text-slate-400 uppercase">Total Profit:</span>
                   <span className="font-black text-orange-600 italic text-sm">Rp{Number(t.profit || 0).toLocaleString()}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}