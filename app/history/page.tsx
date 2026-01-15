"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Calendar, DollarSign, TrendingUp, 
  ShoppingBag, Search, Trash2, AlertTriangle, RefreshCcw
} from 'lucide-react';

export default function InternalReport() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/pos?type=HISTORY');
      const data = await res.json();
      const sortedData = (data.transactions || []).sort((a: any, b: any) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setTransactions(sortedData);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchHistory(); }, []);

  // FITUR HAPUS 1 PER 1
  const deleteOne = async (id: string) => {
    if (!confirm("Hapus transaksi ini secara permanen?")) return;
    try {
      await fetch('/api/pos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'DELETE_TRANSACTION', id })
      });
      fetchHistory();
    } catch (err) { alert("Gagal menghapus"); }
  };

  // FITUR HAPUS SEMUA
  const deleteAll = async () => {
    const confirm1 = confirm("PERINGATAN! Ini akan menghapus SELURUH riwayat transaksi.");
    if (confirm1) {
      const confirm2 = confirm("Apakah Anda benar-benar yakin? Data yang dihapus tidak bisa dikembalikan.");
      if (confirm2) {
        try {
          await fetch('/api/pos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'DELETE_ALL_HISTORY' })
          });
          fetchHistory();
        } catch (err) { alert("Gagal mereset data"); }
      }
    }
  };

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

          {/* TOMBOL HAPUS SEMUA */}
          <button 
            onClick={deleteAll}
            className="flex items-center gap-2 px-6 py-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all group"
          >
            <RefreshCcw size={14} className="group-hover:rotate-180 transition-transform duration-500" /> Reset Riwayat
          </button>
        </header>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#111318] border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Total Pendapatan</p>
            <h2 className="text-3xl font-black text-white italic transition-all group-hover:text-emerald-500">Rp {totalOmzet.toLocaleString()}</h2>
          </div>

          <div className="bg-[#111318] border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Estimasi Modal</p>
            <h2 className="text-3xl font-black text-white/80 italic">Rp {totalModal.toLocaleString()}</h2>
          </div>

          <div className="bg-[#111318] border border-emerald-500/20 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-2">Laba Bersih</p>
            <h2 className="text-4xl font-black text-emerald-500 italic leading-none">Rp {totalProfit.toLocaleString()}</h2>
          </div>
        </div>

        {/* LIST SECTION */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-600 flex items-center gap-2">
              <ShoppingBag size={14}/> Riwayat Transaksi ({filteredTransactions.length})
            </h3>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
              <input 
                type="text" 
                placeholder="Cari ID atau Nama Barang..." 
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#111318] border border-white/5 pl-10 pr-4 py-3 rounded-2xl text-xs outline-none focus:border-emerald-500/50 text-white transition-all shadow-xl"
              />
            </div>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-20 text-xs font-black uppercase tracking-[0.4em] text-emerald-500 animate-pulse">Memproses Data...</div>
            ) : filteredTransactions.length === 0 ? (
              <div className="bg-[#111318] border border-dashed border-white/5 p-20 rounded-[2.5rem] text-center">
                <AlertTriangle className="mx-auto text-slate-700 mb-4" size={40} />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Tidak ada riwayat ditemukan</p>
              </div>
            ) : (
              filteredTransactions.map((t) => (
                <div key={t.id} className="bg-[#111318] border border-white/5 rounded-[2rem] overflow-hidden hover:border-white/10 transition-all group relative">
                  
                  {/* TOMBOL DELETE 1 PER 1 */}
                  <button 
                    onClick={() => deleteOne(t.id)}
                    className="absolute top-6 right-6 p-3 bg-rose-500/0 text-slate-700 hover:bg-rose-500 hover:text-white rounded-xl transition-all z-10 opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>

                  <div className="p-8 flex flex-col lg:flex-row justify-between gap-8">
                    <div className="space-y-6 flex-1">
                      <div className="flex flex-wrap items-center gap-4">
                        <span className="bg-black/40 border border-white/5 px-4 py-1.5 rounded-full font-mono text-[10px] text-emerald-500 tracking-tighter">#{t.id.slice(-8)}</span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                          {new Date(t.date).toLocaleString('id-ID')}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {t.items?.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center bg-black/20 p-4 rounded-2xl border border-white/[0.03]">
                            <div>
                              <p className="text-[10px] font-black text-white uppercase tracking-tight">{item.name}</p>
                              <p className="text-[9px] text-slate-500 font-bold">Rp{Number(item.price).toLocaleString()} x {item.qty}</p>
                            </div>
                            <p className="text-[10px] font-black text-slate-400">Rp{(Number(item.price) * Number(item.qty)).toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="lg:w-72 bg-black/30 p-8 rounded-3xl flex flex-col justify-center border border-white/5 relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-3xl -mr-12 -mt-12 rounded-full"></div>
                       <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Grand Total</span>
                        <span className="text-lg font-black text-white italic">Rp{Number(t.totalPrice).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-white/5">
                        <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Laba</span>
                        <span className="text-lg font-black text-emerald-500 italic">Rp{Number(t.profit || 0).toLocaleString()}</span>
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