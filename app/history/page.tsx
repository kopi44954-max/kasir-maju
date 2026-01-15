"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Calendar, DollarSign, TrendingUp, 
  ShoppingBag, ChevronRight, Search, Download 
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
        // Urutkan dari transaksi terbaru
        const sortedData = (data.transactions || []).sort((a: any, b: any) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setTransactions(sortedData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // LOGIKA PERHITUNGAN STATISTIK
  const totalOmzet = transactions.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);
  const totalProfit = transactions.reduce((acc, curr) => acc + (curr.profit || 0), 0);
  const totalSales = transactions.length;

  const filteredTransactions = transactions.filter(t => 
    t.id.toLowerCase().includes(searchTerm.toLowerCase())
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
              Internal <span className="font-black text-emerald-500">Reports.</span>
            </h1>
          </div>
          <div className="flex gap-3">
             <button className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-all">
                <Download size={20} />
             </button>
          </div>
        </header>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#111318] border border-white/5 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 text-emerald-500/10 group-hover:scale-110 transition-transform">
              <DollarSign size={80} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Total Omzet</p>
            <h2 className="text-3xl font-black text-white italic">Rp {totalOmzet.toLocaleString()}</h2>
            <div className="mt-4 flex items-center gap-2 text-emerald-500 text-xs font-bold">
              <TrendingUp size={14} /> +0.0% <span className="text-slate-600 font-medium">vs periode lalu</span>
            </div>
          </div>

          <div className="bg-[#111318] border border-emerald-500/20 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 text-blue-500/10 group-hover:scale-110 transition-transform">
              <TrendingUp size={80} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2">Total Laba Bersih</p>
            <h2 className="text-3xl font-black text-emerald-500 italic">Rp {totalProfit.toLocaleString()}</h2>
            <p className="mt-4 text-[10px] text-slate-600 font-bold uppercase tracking-tighter">Laba bersih dari selisih modal</p>
          </div>

          <div className="bg-[#111318] border border-white/5 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 text-slate-500/5 group-hover:scale-110 transition-transform">
              <ShoppingBag size={80} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Total Transaksi</p>
            <h2 className="text-3xl font-black text-white italic">{totalSales}</h2>
            <p className="mt-4 text-[10px] text-slate-600 font-bold uppercase tracking-tighter">Sukses Terproses</p>
          </div>
        </div>

        {/* SEARCH & LIST */}
        <div className="space-y-6">
          <div className="relative group max-w-md">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Cari ID Invoice..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#111318] border border-white/5 p-5 pl-16 rounded-2xl outline-none focus:border-emerald-500/30 text-white transition-all shadow-xl"
            />
          </div>

          <div className="bg-[#111318] border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <th className="p-6 px-8">Invoice</th>
                    <th className="p-6">Waktu</th>
                    <th className="p-6 text-right">Total Item</th>
                    <th className="p-6 text-right">Omzet</th>
                    <th className="p-6 text-right text-emerald-500">Laba Bersih</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {loading ? (
                    <tr><td colSpan={5} className="p-20 text-center uppercase font-bold tracking-widest">Memuat Data...</td></tr>
                  ) : filteredTransactions.length === 0 ? (
                    <tr><td colSpan={5} className="p-20 text-center text-slate-700 font-bold uppercase">Belum ada transaksi</td></tr>
                  ) : (
                    filteredTransactions.map((t) => (
                      <tr key={t.id} className="group hover:bg-white/[0.02] transition-all">
                        <td className="p-6 px-8 font-mono text-xs text-white group-hover:text-emerald-500 transition-colors">#{t.id.slice(-8)}</td>
                        <td className="p-6">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-slate-600" />
                            <span className="text-xs">{new Date(t.date).toLocaleString('id-ID')}</span>
                          </div>
                        </td>
                        <td className="p-6 text-right font-bold text-slate-500">
                          {t.items?.reduce((a: any, b: any) => a + (b.qty || 0), 0)}
                        </td>
                        <td className="p-6 text-right font-black text-white italic">
                          Rp {t.totalPrice?.toLocaleString()}
                        </td>
                        <td className="p-6 text-right font-black text-emerald-500 italic">
                          Rp {t.profit?.toLocaleString() || 0}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}