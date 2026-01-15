"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Calendar, DollarSign, TrendingUp, 
  ShoppingBag, Search, Wallet, ArrowDownCircle, ArrowUpCircle 
} from 'lucide-react';

export default function InternalReport() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('/api/pos?type=HISTORY');
        const data = await res.json();
        const sortedData = (data.transactions || []).sort((a: any, b: any) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setTransactions(sortedData);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchHistory();
  }, []);

  // LOGIKA PERHITUNGAN TOTAL (FIXED)
  const totalOmzet = transactions.reduce((acc, curr) => acc + (Number(curr.totalPrice) || 0), 0);
  const totalProfit = transactions.reduce((acc, curr) => acc + (Number(curr.profit) || 0), 0);
  const totalModal = totalOmzet - totalProfit;

  const filteredTransactions = transactions.filter(t => 
    t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.items?.some((i: any) => i.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#07080A] text-slate-400 font-sans pb-20">
      <div className="max-w-6xl mx-auto p-6 md:p-12">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-emerald-500 transition-colors group">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform"/> Kembali ke Kasir
            </Link>
            <h1 className="text-4xl font-light text-white tracking-tighter">
              Laporan <span className="font-black text-emerald-500">Internal.</span>
            </h1>
          </div>
        </header>

        {/* STATS CARDS - PERBAIKAN LOGIKA VISUAL */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#111318] border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Total Pendapatan</p>
            <h2 className="text-3xl font-black text-white italic">Rp {totalOmzet.toLocaleString()}</h2>
            <div className="mt-4 flex items-center gap-2 text-emerald-500 text-[10px] font-bold uppercase">
              <ArrowUpCircle size={14} /> Total Uang Masuk
            </div>
          </div>

          <div className="bg-[#111318] border border-rose-500/10 p-8 rounded-[2.5rem] relative overflow-hidden">
            <p className="text-[10px] font-black uppercase tracking-widest text-rose-500/70 mb-2">Pengeluaran Modal</p>
            <h2 className="text-3xl font-black text-white/80 italic">Rp {totalModal.toLocaleString()}</h2>
            <div className="mt-4 flex items-center gap-2 text-rose-500 text-[10px] font-bold uppercase">
              <ArrowDownCircle size={14} /> Estimasi Harga Pokok
            </div>
          </div>

          <div className="bg-[#111318] border border-emerald-500/30 p-8 rounded-[2.5rem] shadow-[0_0_40px_rgba(16,185,129,0.05)] relative overflow-hidden">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-2">Laba Bersih</p>
            <h2 className="text-4xl font-black text-emerald-500 italic leading-none">Rp {totalProfit.toLocaleString()}</h2>
            <p className="mt-4 text-[9px] text-slate-600 font-bold uppercase tracking-widest">Keuntungan Murni</p>
          </div>
        </div>

        {/* LIST TRANSAKSI YANG DIRAPIHKAN */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Daftar Riwayat Transaksi</h3>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
              <input 
                type="text" 
                placeholder="Cari ID atau Produk..." 
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#111318] border border-white/5 pl-10 pr-4 py-2 rounded-xl text-xs outline-none focus:border-emerald-500/50 text-white w-64 transition-all"
              />
            </div>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-20 animate-pulse text-xs font-black uppercase tracking-widest">Sinkronisasi Data...</div>
            ) : filteredTransactions.map((t) => (
              <div key={t.id} className="bg-[#111318] border border-white/5 rounded-3xl overflow-hidden hover:border-white/10 transition-all">
                <div className="p-6 flex flex-col md:flex-row justify-between gap-6">
                  {/* Info Utama */}
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-4">
                      <span className="bg-white/5 px-3 py-1 rounded-lg font-mono text-[10px] text-white tracking-tighter">#{t.id.slice(-8)}</span>
                      <span className="text-[10px] text-slate-600 flex items-center gap-1 font-bold uppercase tracking-widest">
                        <Calendar size={12}/> {new Date(t.date).toLocaleString('id-ID')}
                      </span>
                    </div>
                    
                    {/* Item List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {t.items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-white/[0.02]">
                          <div>
                            <p className="text-[10px] font-black text-white uppercase tracking-tight">{item.name}</p>
                            <p className="text-[9px] text-slate-500 font-bold uppercase">Rp{Number(item.price).toLocaleString()} x {item.qty}</p>
                          </div>
                          <p className="text-[10px] font-black text-slate-400">Rp{(Number(item.price) * Number(item.qty)).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ringkasan Biaya per Transaksi */}
                  <div className="md:w-64 bg-black/20 p-6 rounded-2xl flex flex-col justify-center border border-white/5">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[9px] font-black uppercase text-slate-600 tracking-widest">Total Bayar</span>
                      <span className="text-sm font-black text-white">Rp{Number(t.totalPrice).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-white/5">
                      <span className="text-[9px] font-black uppercase text-emerald-500 tracking-widest">Laba +</span>
                      <span className="text-sm font-black text-emerald-500 italic">Rp{Number(t.profit || 0).toLocaleString()}</span>
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