"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Calendar, Loader2, 
  Trash2, XCircle, Clock, Receipt 
} from 'lucide-react';

export default function LaporanKeuangan() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

  // 1. FUNGSI AMBIL DATA DARI API (VERCEL KV)
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/pos', { cache: 'no-store' });
      const data = await res.json();
      setTransactions(data.transactions || []);
    } catch (err) { 
      console.error("Gagal memuat data:", err); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  // 2. FUNGSI HAPUS TRANSAKSI
  const deleteOne = async (id: string) => {
    if (!confirm("Hapus transaksi ini dari riwayat?")) return;
    try {
      const res = await fetch('/api/pos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'DELETE_TRANSACTION', id })
      });
      if (res.ok) fetchData();
    } catch (err) { 
      alert("Gagal menghapus"); 
    }
  };

  // 3. FILTER DATA BERDASARKAN TANGGAL
  const filteredData = transactions.filter(t => t.date.startsWith(filterDate));

  // 4. LOGIKA PERHITUNGAN STATISTIK (OMZET, MODAL, LABA)
  const stats = filteredData.reduce((acc, curr) => {
    const omzet = Number(curr.totalPrice || 0);
    const modal = curr.items.reduce((sum: number, item: any) => {
      // Mengambil 'cost' (modal) yang disimpan dari halaman settings
      const hargaModal = Number(item.cost || item.costPrice || 0);
      return sum + (hargaModal * Number(item.qty || 0));
    }, 0);
    
    acc.omzet += omzet;
    acc.modal += modal;
    acc.laba = acc.omzet - acc.modal;
    return acc;
  }, { omzet: 0, modal: 0, laba: 0 });

  return (
    <div className="min-h-screen bg-[#07080A] text-slate-400 font-sans pb-20">
      <div className="max-w-6xl mx-auto p-6 md:p-12">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-emerald-500 transition-colors group">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform"/> Kembali ke Kasir
            </Link>
            <h1 className="text-4xl font-light text-white tracking-tighter">
              Laporan <span className="font-black text-emerald-500">Internal.</span>
            </h1>
          </div>

          <div className="flex items-center gap-4 bg-[#111318] p-3 rounded-2xl border border-white/5 shadow-2xl">
            <Calendar size={18} className="text-emerald-500" />
            <input 
              type="date" 
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="bg-transparent text-sm font-bold text-white outline-none cursor-pointer"
            />
          </div>
        </header>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-[#111318] border-l-2 border-white/5 p-8 hover:border-emerald-500 transition-all duration-500">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 mb-4">Total Pendapatan</p>
            <h2 className="text-3xl font-light tracking-tighter text-white">
              <span className="text-sm mr-1 opacity-50 font-normal">Rp</span>
              {stats.omzet.toLocaleString()}
            </h2>
          </div>

          <div className="bg-[#111318] border-l-2 border-white/5 p-8 hover:border-rose-500 transition-all duration-500">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 mb-4">Pengeluaran Modal</p>
            <h2 className="text-3xl font-light tracking-tighter text-rose-500">
              <span className="text-sm mr-1 opacity-50 font-normal">Rp</span>
              {stats.modal.toLocaleString()}
            </h2>
          </div>

          <div className="bg-[#111318] border-l-2 border-white/5 p-8 hover:border-emerald-500 transition-all duration-500">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 mb-4">Laba Bersih</p>
            <h2 className="text-3xl font-light tracking-tighter text-emerald-500">
              <span className="text-sm mr-1 opacity-50 font-normal">Rp</span>
              {stats.laba.toLocaleString()}
            </h2>
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="bg-[#111318] border border-white/5 rounded-2xl overflow-hidden">
          <div className="px-8 py-4 bg-white/[0.02] border-b border-white/5 flex justify-between items-center">
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Daftar Transaksi</span>
             <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">{filteredData.length} Records</span>
          </div>

          {loading ? (
            <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-emerald-500" /></div>
          ) : filteredData.length === 0 ? (
            <div className="py-24 text-center space-y-3">
              <Receipt className="mx-auto text-slate-800" size={40} />
              <p className="text-xs font-bold uppercase tracking-widest text-slate-700">Tidak ada transaksi tanggal ini</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {filteredData.map((t, idx) => (
                <div key={idx} className="group hover:bg-white/[0.01] transition-all p-8 flex flex-col md:flex-row items-start md:items-center gap-8">
                  
                  {/* ID & WAKTU */}
                  <div className="w-full md:w-40 shrink-0">
                    <div className="text-white font-bold text-xs mb-1 uppercase tracking-tighter">
                      <span className="text-emerald-500">ID</span> {t.id.slice(-8)}
                    </div>
                    <div className="text-[10px] font-bold text-slate-600 uppercase flex items-center gap-2">
                      <Clock size={12}/> {new Date(t.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {/* ITEM YANG DIBELI */}
                  <div className="flex-1 space-y-2">
                    {t.items.map((item: any, iIdx: number) => (
                      <div key={iIdx} className="flex justify-between items-center max-w-md">
                        <span className="text-[11px] font-bold text-slate-300 uppercase">{item.name}</span>
                        <span className="text-[10px] text-slate-500 font-black italic">{item.qty}x</span>
                      </div>
                    ))}
                  </div>

                  {/* TOTAL & ACTION */}
                  <div className="w-full md:w-48 text-left md:text-right">
                    <div className="text-[10px] font-black text-slate-600 uppercase mb-1">Total</div>
                    <div className="text-lg font-light text-white tracking-tighter">Rp {t.totalPrice.toLocaleString()}</div>
                  </div>

                  <div className="shrink-0">
                    <button 
                      onClick={() => deleteOne(t.id)}
                      className="p-3 text-slate-800 hover:text-rose-500 hover:bg-rose-500/5 rounded-xl transition-all"
                    >
                      <XCircle size={20}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}