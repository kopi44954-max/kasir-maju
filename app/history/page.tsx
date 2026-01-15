"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Trash2, RefreshCcw, Loader2, Calendar } from 'lucide-react';

export default function HistoryPage() {
  const [data, setData] = useState<any>({ transactions: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadData = async () => {
    setLoading(true);
    const res = await fetch('/api/pos');
    const json = await res.json();
    setData(json);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const stats = (data.transactions || []).reduce((acc: any, curr: any) => {
    acc.omzet += Number(curr.totalPrice || 0);
    acc.profit += Number(curr.profit || 0);
    return acc;
  }, { omzet: 0, profit: 0 });

  const filtered = (data.transactions || []).filter((t: any) => 
    t.id.toLowerCase().includes(search.toLowerCase()) || 
    t.items.some((i: any) => i.name.toLowerCase().includes(search.toLowerCase()))
  ).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="min-h-screen bg-[#07080A] text-slate-400 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="space-y-4">
            <Link href="/" className="text-xs font-bold uppercase text-slate-500 hover:text-emerald-500 flex items-center gap-2"><ArrowLeft size={16}/> Kembali</Link>
            <h1 className="text-4xl font-light text-white tracking-tighter">Laporan <span className="font-black text-emerald-500">Internal.</span></h1>
          </div>
          <button onClick={async () => {if(confirm('Reset semua riwayat?')){await fetch('/api/pos',{method:'POST', body:JSON.stringify({type:'DELETE_ALL_HISTORY'})}); loadData();}}} className="bg-rose-500/10 text-rose-500 border border-rose-500/20 px-6 py-3 rounded-2xl text-[10px] font-black uppercase hover:bg-rose-500 hover:text-white transition-all">
            <RefreshCcw size={14} className="inline mr-2"/> Reset Riwayat
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#111318] p-8 rounded-4xl border border-white/5">
            <p className="text-[10px] font-black uppercase text-slate-500 mb-2">Pendapatan</p>
            <h2 className="text-3xl font-black text-white italic">Rp {stats.omzet.toLocaleString()}</h2>
          </div>
          <div className="bg-[#111318] p-8 rounded-4xl border border-white/5">
            <p className="text-[10px] font-black uppercase text-slate-500 mb-2">Modal</p>
            <h2 className="text-3xl font-black text-white/50 italic">Rp {(stats.omzet - stats.profit).toLocaleString()}</h2>
          </div>
          <div className="bg-[#111318] p-8 rounded-4xl border border-emerald-500/20 shadow-xl">
            <p className="text-[10px] font-black uppercase text-emerald-500 mb-2">Laba Bersih</p>
            <h2 className="text-4xl font-black text-emerald-500 italic leading-none text-glow">Rp {stats.profit.toLocaleString()}</h2>
          </div>
        </div>

        <div className="space-y-6">
          <input placeholder="Cari transaksi..." className="w-full max-w-md bg-[#111318] p-5 px-8 rounded-2xl border border-white/5 text-white outline-none focus:border-emerald-500/30" onChange={e => setSearch(e.target.value)} />
          
          <div className="space-y-4">
            {loading ? <Loader2 className="animate-spin mx-auto text-emerald-500" /> : filtered.length === 0 ? <p className="text-center py-20 text-slate-700 font-black uppercase tracking-widest">Tidak ada riwayat</p> : filtered.map((t: any) => (
              <div key={t.id} className="bg-[#111318] p-8 rounded-4xl border border-white/5 group relative">
                <button onClick={async () => {if(confirm('Hapus item ini?')){await fetch('/api/pos',{method:'POST', body:JSON.stringify({type:'DELETE_TRANSACTION', id:t.id})}); loadData();}}} className="absolute top-6 right-6 p-3 text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={18}/></button>
                <div className="flex flex-col lg:flex-row justify-between gap-8">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-lg font-mono text-[10px] font-bold">#{t.id.slice(-6)}</span>
                      <span className="text-[10px] font-bold text-slate-600 flex items-center gap-1"><Calendar size={12}/> {new Date(t.date).toLocaleString()}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {t.items.map((item: any, idx: number) => (
                        <div key={idx} className="bg-black/20 p-3 rounded-xl border border-white/5 flex justify-between items-center text-[11px]">
                          <span className="text-white font-bold uppercase">{item.name} <span className="text-slate-600 ml-2">x{item.qty}</span></span>
                          <span className="text-slate-500">Rp{(item.price * item.qty).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="lg:w-64 bg-black/40 p-6 rounded-3xl border border-white/5 flex flex-col justify-center text-right">
                    <p className="text-[10px] font-black uppercase text-slate-600 mb-1">Total</p>
                    <p className="text-xl font-black text-white italic mb-3">Rp{t.totalPrice.toLocaleString()}</p>
                    <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase text-emerald-500">Laba +</span>
                      <span className="text-emerald-500 font-black italic">Rp{(t.profit || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}