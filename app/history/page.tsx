"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Trash2, RefreshCcw, Loader2, Calendar, TrendingUp, DollarSign, Wallet } from 'lucide-react';

export default function HistoryPage() {
  const [data, setData] = useState<any>({ transactions: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/pos');
      const json = await res.json();
      setData(json);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const stats = (data.transactions || []).reduce((acc: any, curr: any) => {
    acc.omzet += Number(curr.totalPrice || 0);
    acc.profit += Number(curr.profit || 0);
    return acc;
  }, { omzet: 0, profit: 0 });

  const filtered = (data.transactions || [])
    .filter((t: any) => 
      t.id.toLowerCase().includes(search.toLowerCase()) || 
      t.items.some((i: any) => i.name.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-slate-400 font-sans pb-20 selection:bg-emerald-500/30">
      <div className="max-w-6xl mx-auto p-6 md:p-12">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8">
          <div className="text-center md:text-left">
            <Link href="/" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-600 hover:text-emerald-500 transition-all mb-4">
              <ArrowLeft size={14}/> Kembali ke Kasir
            </Link>
            <h1 className="text-5xl font-black text-white tracking-tighter italic">
              INSIGHT<span className="text-emerald-500 not-italic">.</span>
            </h1>
            <p className="text-xs font-bold text-slate-700 uppercase tracking-[0.3em] mt-1">Laporan Arus Kas Internal</p>
          </div>
          
          <button 
            onClick={async () => { if(confirm('Hapus semua riwayat?')) { await fetch('/api/pos', { method: 'POST', body: JSON.stringify({ type: 'DELETE_ALL_HISTORY' }) }); loadData(); } }}
            className="flex items-center gap-2 px-6 py-3 bg-rose-500/5 border border-rose-500/10 rounded-2xl text-rose-500 text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-xl shadow-rose-500/5"
          >
            <RefreshCcw size={14}/> Reset Riwayat
          </button>
        </header>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-[#121214] p-8 rounded-4xl border border-white/[0.03] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><DollarSign size={80}/></div>
            <p className="text-[10px] font-black uppercase text-slate-600 mb-2 tracking-widest">Pendapatan Kotor</p>
            <h2 className="text-3xl font-black text-white italic transition-colors group-hover:text-emerald-500">Rp {stats.omzet.toLocaleString()}</h2>
          </div>

          <div className="bg-[#121214] p-8 rounded-4xl border border-white/[0.03] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Wallet size={80}/></div>
            <p className="text-[10px] font-black uppercase text-slate-600 mb-2 tracking-widest">Estimasi Modal</p>
            <h2 className="text-3xl font-black text-white/40 italic">Rp {(stats.omzet - stats.profit).toLocaleString()}</h2>
          </div>

          <div className="bg-[#121214] p-10 rounded-4xl border border-emerald-500/20 shadow-2xl shadow-emerald-500/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-emerald-500"><TrendingUp size={80}/></div>
            <p className="text-[10px] font-black uppercase text-emerald-500 mb-2 tracking-widest">Laba Bersih</p>
            <h2 className="text-5xl font-black text-emerald-500 italic leading-none drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">Rp {stats.profit.toLocaleString()}</h2>
          </div>
        </div>

        {/* SEARCH & LIST */}
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-white/5 pb-6">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-700 flex items-center gap-2">
              <Calendar size={14}/> Riwayat Transaksi
            </h3>
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700" size={14}/>
              <input 
                placeholder="Cari ID / Barang..." 
                className="w-full bg-[#121214] border border-white/5 py-3 pl-10 pr-4 rounded-xl text-xs text-white outline-none focus:border-emerald-500/30 transition-all"
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-6">
            {loading ? (
              <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-emerald-500" size={32}/></div>
            ) : filtered.length === 0 ? (
              <div className="py-32 text-center bg-[#121214] rounded-4xl border border-dashed border-white/5 uppercase font-black text-[10px] text-slate-800 tracking-widest">Data Tidak Ditemukan</div>
            ) : (
              filtered.map((t: any) => (
                <div key={t.id} className="group relative bg-[#121214] border border-white/[0.02] rounded-4xl p-8 hover:border-white/10 hover:bg-white/[0.01] transition-all">
                  
                  <button 
                    onClick={async () => { if(confirm('Hapus item ini?')) { await fetch('/api/pos', { method: 'POST', body: JSON.stringify({ type: 'DELETE_TRANSACTION', id: t.id }) }); loadData(); } }}
                    className="absolute top-6 right-6 p-3 bg-rose-500/10 text-rose-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white"
                  >
                    <Trash2 size={16}/>
                  </button>

                  <div className="flex flex-col lg:flex-row justify-between gap-10">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-6">
                        <span className="px-3 py-1 bg-black rounded-lg text-emerald-500 font-mono text-[10px] border border-white/5 font-bold italic tracking-tighter">#{t.id.slice(-8)}</span>
                        <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{new Date(t.date).toLocaleString('id-ID')}</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {t.items.map((item: any, i: number) => (
                          <div key={i} className="flex justify-between items-center bg-black/30 p-4 rounded-2xl border border-white/[0.02]">
                            <div>
                              <p className="text-[10px] font-black text-white uppercase leading-none mb-1">{item.name}</p>
                              <p className="text-[9px] font-bold text-slate-600">Rp{Number(item.price).toLocaleString()} x {item.qty}</p>
                            </div>
                            <p className="text-[10px] font-black text-slate-400 font-mono italic">Rp{(item.price * item.qty).toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="lg:w-72 flex flex-col justify-center bg-black/40 p-8 rounded-[2.5rem] border border-white/[0.03] shadow-inner">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Total Bill</span>
                        <span className="text-2xl font-black text-white italic tracking-tighter">Rp{t.totalPrice.toLocaleString()}</span>
                      </div>
                      <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Net Profit</span>
                        <span className="text-xl font-black text-emerald-500 italic tracking-tighter shadow-emerald-500/20">Rp{t.profit.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}