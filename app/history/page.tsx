"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Calendar, Search, Trash2, 
  RefreshCcw, ShoppingBag, AlertCircle, Loader2 
} from 'lucide-react';

export default function InternalReport() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/pos');
      const data = await res.json();
      const sorted = (data.transactions || []).sort((a: any, b: any) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setTransactions(sorted);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchHistory(); }, []);

  const deleteOne = async (id: string) => {
    if (!confirm("Hapus transaksi ini?")) return;
    await fetch('/api/pos', {
      method: 'POST',
      body: JSON.stringify({ type: 'DELETE_TRANSACTION', id })
    });
    fetchHistory();
  };

  const deleteAll = async () => {
    if (confirm("Hapus SEMUA riwayat? Tindakan ini tidak bisa dibatalkan.")) {
      await fetch('/api/pos', {
        method: 'POST',
        body: JSON.stringify({ type: 'DELETE_ALL_HISTORY' })
      });
      fetchHistory();
    }
  };

  // Logika Hitung
  const stats = transactions.reduce((acc, curr) => {
    acc.omzet += Number(curr.totalPrice || 0);
    acc.profit += Number(curr.profit || 0);
    return acc;
  }, { omzet: 0, profit: 0 });

  const filtered = transactions.filter(t => 
    t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.items?.some((i: any) => i.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#07080A] text-slate-400 font-sans pb-20">
      <div className="max-w-6xl mx-auto p-6 md:p-12">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold uppercase text-slate-500 hover:text-emerald-500 transition-all group">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform"/> Kembali ke Kasir
            </Link>
            <h1 className="text-4xl font-light text-white tracking-tighter">
              Laporan <span className="font-black text-emerald-500">Internal.</span>
            </h1>
          </div>

          <button onClick={deleteAll} className="flex items-center gap-2 px-6 py-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-[10px] font-black uppercase hover:bg-rose-600 hover:text-white transition-all">
            <RefreshCcw size={14} /> Reset Riwayat
          </button>
        </header>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#111318] border border-white/5 p-8 rounded-[2rem]">
            <p className="text-[10px] font-black uppercase text-slate-500 mb-2">Pendapatan</p>
            <h2 className="text-3xl font-black text-white italic text-emerald-500">Rp {stats.omzet.toLocaleString()}</h2>
          </div>
          <div className="bg-[#111318] border border-white/5 p-8 rounded-[2rem]">
            <p className="text-[10px] font-black uppercase text-slate-500 mb-2">Pengeluaran Modal</p>
            <h2 className="text-3xl font-black text-white italic">Rp {(stats.omzet - stats.profit).toLocaleString()}</h2>
          </div>
          <div className="bg-[#111318] border border-emerald-500/20 p-8 rounded-[2rem] shadow-xl">
            <p className="text-[10px] font-black uppercase text-emerald-500 mb-2 tracking-[0.2em]">Laba Bersih</p>
            <h2 className="text-4xl font-black text-emerald-500 italic leading-none">Rp {stats.profit.toLocaleString()}</h2>
          </div>
        </div>

        {/* SEARCH & LIST */}
        <div className="space-y-6">
          <div className="relative group max-w-md">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Cari transaksi..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#111318] border border-white/5 p-5 pl-14 rounded-2xl outline-none focus:border-emerald-500/30 text-white transition-all shadow-xl"
            />
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-20"><Loader2 className="animate-spin mx-auto text-emerald-500" /></div>
            ) : filtered.length === 0 ? (
              <div className="bg-[#111318] p-20 rounded-[2rem] text-center border border-dashed border-white/5">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-600 text-emerald-500">Tidak ada data transaksi</p>
              </div>
            ) : (
              filtered.map((t) => (
                <div key={t.id} className="group relative bg-[#111318] border border-white/5 rounded-[2rem] p-8 hover:border-white/10 transition-all overflow-hidden">
                  
                  {/* TOMBOL HAPUS SATUAN */}
                  <button 
                    onClick={() => deleteOne(t.id)}
                    className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-500 hover:bg-rose-600 hover:text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all z-10 border border-rose-500/20"
                  >
                    <Trash2 size={14} /> <span className="text-[10px] font-black uppercase tracking-widest">Hapus</span>
                  </button>

                  <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-1 space-y-6">
                      <div className="flex items-center gap-3">
                        <span className="bg-black/40 px-3 py-1 rounded-lg text-emerald-500 font-mono text-[10px]">#{t.id.slice(-6)}</span>
                        <span className="text-[10px] font-bold uppercase text-slate-600 flex items-center gap-1">
                          <Calendar size={12}/> {new Date(t.date).toLocaleString('id-ID')}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {t.items?.map((item: any, i: number) => (
                          <div key={i} className="bg-black/20 p-4 rounded-2xl border border-white/[0.02] flex justify-between items-center">
                            <div>
                              <p className="text-[10px] font-black text-white uppercase">{item.name}</p>
                              <p className="text-[9px] font-bold text-slate-500">Rp{Number(item.price).toLocaleString()} x{item.qty}</p>
                            </div>
                            <p className="text-[10px] font-black text-slate-400">Rp{(item.price * item.qty).toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="lg:w-64 bg-black/40 p-8 rounded-[2rem] flex flex-col justify-center border border-white/5 shadow-inner">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-black uppercase text-slate-600">Total</span>
                        <span className="text-xl font-black text-white italic">Rp{t.totalPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-white/5">
                        <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Laba</span>
                        <span className="text-xl font-black text-emerald-500 italic">Rp{(t.profit || 0).toLocaleString()}</span>
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