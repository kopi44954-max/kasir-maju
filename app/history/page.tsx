"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Calendar, Loader2, 
  Trash2, XCircle, Clock, Hash, Receipt, TrendingUp, ChevronRight
} from 'lucide-react';

export default function LaporanKeuangan() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]); // Tambahan untuk mapping cost
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/pos', { cache: 'no-store' });
      const data = await res.json();
      setTransactions(data.transactions || []);
      setProducts(data.products || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const deleteOne = async (id: string) => {
    if (!confirm("Hapus transaksi ini?")) return;
    try {
      const res = await fetch('/api/pos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'DELETE_TRANSACTION', id })
      });
      if (res.ok) fetchData();
    } catch (err) { alert("Gagal menghapus"); }
  };

  // Filter data berdasarkan tanggal yang dipilih
  const filteredData = transactions.filter(t => {
    // Menyesuaikan format tanggal dari DD/MM/YYYY atau ISO ke YYYY-MM-DD
    const parts = t.date.split(',')[0].split('/'); 
    if(parts.length === 3) {
        const formattedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        return formattedDate === filterDate;
    }
    return t.date.startsWith(filterDate);
  });

  const stats = filteredData.reduce((acc, curr) => {
    const omzet = curr.totalPrice || 0;
    // Ambil laba langsung dari data transaksi yang sudah dihitung API
    const laba = curr.profit || 0;
    acc.omzet += omzet;
    acc.laba += laba;
    acc.modal += (omzet - laba);
    return acc;
  }, { omzet: 0, modal: 0, laba: 0 });

  return (
    <div className="min-h-screen bg-[#07080A] text-slate-400 font-sans pb-20 selection:bg-emerald-500/30">
      <div className="max-w-6xl mx-auto p-6 md:p-12">
        
        {/* HEADER SECTION */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-emerald-500 transition-colors group">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform"/> Kembali ke Kasir
            </Link>
            <h1 className="text-4xl font-light text-white tracking-tighter">
              Laporan <span className="font-black text-emerald-500">Internal.</span>
            </h1>
          </div>

          <div className="flex items-center gap-4 bg-[#111318] p-1.5 rounded-2xl border border-white/5 shadow-2xl">
            <div className="flex items-center px-4 gap-3">
              <Calendar size={15} className="text-emerald-500" />
              <input 
                type="date" 
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="bg-transparent text-sm font-bold text-white outline-none py-2 cursor-pointer"
              />
            </div>
          </div>
        </header>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {[
            { label: "Pendapatan", value: stats.omzet, color: "text-white" },
            { label: "Pengeluaran Modal", value: stats.modal, color: "text-rose-500/80" },
            { label: "Laba Bersih", value: stats.laba, color: "text-emerald-500" }
          ].map((item, i) => (
            <div key={i} className="bg-[#111318] border-l-2 border-white/5 p-8 hover:border-emerald-500 transition-all duration-500 group">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 mb-4 group-hover:text-emerald-500 transition-colors">{item.label}</p>
              <h2 className={`text-3xl font-light tracking-tighter ${item.color}`}>
                <span className="text-sm mr-1 opacity-50 font-normal">Rp</span>
                {item.value.toLocaleString()}
              </h2>
            </div>
          ))}
        </div>

        {/* DATA TABLE */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-8 py-4 bg-white/[0.02] rounded-t-xl border-x border-t border-white/5">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Daftar Transaksi</span>
            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">{filteredData.length} Records</span>
          </div>

          <div className="bg-[#111318] border border-white/5 rounded-b-xl overflow-hidden">
            {loading ? (
              <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-emerald-500" /></div>
            ) : filteredData.length === 0 ? (
              <div className="py-24 text-center space-y-3">
                <Receipt className="mx-auto text-slate-800" size={40} />
                <p className="text-xs font-bold uppercase tracking-widest text-slate-700">Data Tidak Ditemukan</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {filteredData.slice().reverse().map((t, idx) => {
                  return (
                    <div key={idx} className="group hover:bg-white/[0.01] transition-all">
                      <div className="flex flex-col md:flex-row items-start md:items-center p-8 gap-8">
                        
                        <div className="w-full md:w-40 shrink-0">
                          <div className="flex items-center gap-2 text-white font-bold text-xs mb-1.5 uppercase tracking-tighter">
                            <span className="text-emerald-500">ID</span> {t.id.slice(-8)}
                          </div>
                          <div className="text-[10px] font-bold text-slate-600 uppercase flex items-center gap-2">
                            <Clock size={12}/> {t.date.split(',')[1] || t.date}
                          </div>
                        </div>

                        <div className="flex-1 space-y-3 border-l md:border-l-0 md:pl-0 pl-6 border-white/5">
                          {t.items.map((item: any, iIdx: number) => (
                            <div key={iIdx} className="flex justify-between items-center max-w-md">
                              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-tight">{item.name}</span>
                              <div className="flex items-center gap-4">
                                <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">Rp {item.price.toLocaleString()}</span>
                                <span className="text-[10px] font-black text-emerald-500 w-8 text-right italic">{item.qty}x</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="w-full md:w-48 text-left md:text-right space-y-1">
                          <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Total Transaksi</div>
                          <div className="text-lg font-light text-white tracking-tighter">Rp {t.totalPrice.toLocaleString()}</div>
                          <div className="text-[11px] font-bold text-emerald-500 pt-1">
                            Laba + Rp {(t.profit || 0).toLocaleString()}
                          </div>
                        </div>

                        <div className="shrink-0 md:pl-4">
                          <button 
                            onClick={() => deleteOne(t.id)}
                            className="p-3 text-slate-800 hover:text-rose-500 hover:bg-rose-500/5 rounded-xl transition-all"
                          >
                            <Trash2 size={18}/>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}