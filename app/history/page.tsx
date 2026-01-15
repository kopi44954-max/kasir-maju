"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trash2, TrendingUp, Receipt, Loader2 } from 'lucide-react';

export default function LaporanPage() {
  const [data, setData] = useState<any>({ transactions: [] });
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/pos');
      const d = await res.json();
      setData(d);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchHistory(); }, []);

  const totalOmzet = data.transactions.reduce((acc:any, t:any) => acc + (t.totalPrice || 0), 0);
  const totalLaba = data.transactions.reduce((acc:any, t:any) => acc + (t.profit || 0), 0);

  return (
    <div className="min-h-screen bg-[#0A0C10] text-slate-300 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <Link href="/" className="flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-emerald-500 transition-all uppercase tracking-widest"><ArrowLeft size={16}/> KEMBALI</Link>
          <h1 className="text-xl font-black italic text-white uppercase tracking-tighter">Financial <span className="text-emerald-500">Report</span></h1>
        </header>

        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="bg-[#0F1218] border border-white/5 p-6 rounded-3xl">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Penjualan</p>
            <p className="text-2xl font-black text-white italic">Rp {totalOmzet.toLocaleString()}</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl shadow-[0_0_40px_rgba(16,185,129,0.1)]">
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1 flex items-center gap-2"><TrendingUp size={12}/> Laba Bersih</p>
            <p className="text-2xl font-black text-emerald-400 italic">Rp {totalLaba.toLocaleString()}</p>
          </div>
        </div>

        <div className="space-y-3">
          {data.transactions.slice().reverse().map((t: any) => (
            <div key={t.id} className="bg-[#0F1218] border border-white/5 p-5 rounded-2xl flex justify-between items-center">
              <div>
                <p className="text-[10px] font-mono text-slate-600 mb-1">{t.date}</p>
                <p className="text-xs font-bold text-white uppercase tracking-tighter">{t.id}</p>
              </div>
              <div className="text-right flex items-center gap-6">
                <div>
                  <p className="text-[9px] font-bold text-slate-600 uppercase">Profit</p>
                  <p className="text-sm font-black text-emerald-500 italic">+Rp {t.profit?.toLocaleString()}</p>
                </div>
                <button onClick={async () => { if(confirm('Hapus log?')) { await fetch('/api/pos', { method: 'POST', body: JSON.stringify({ type: 'DELETE_TRANSACTION', id: t.id }) }); fetchHistory(); } }} className="text-slate-800 hover:text-rose-500 transition-colors"><Trash2 size={16}/></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}