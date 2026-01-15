"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Loader2, Trash2, Clock, Receipt, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export default function LaporanKeuangan() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/pos', { cache: 'no-store' });
      const data = await res.json();
      setTransactions(data.transactions || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const deleteOne = async (id: string) => {
    if (!confirm("Hapus data selamanya?")) return;
    await fetch('/api/pos', { method: 'POST', body: JSON.stringify({ type: 'DELETE_TRANSACTION', id }) });
    fetchData();
  };

  const filteredData = transactions.filter(t => t.date.startsWith(filterDate));
  const stats = filteredData.reduce((acc, curr) => {
    acc.omzet += Number(curr.totalPrice);
    acc.modal += curr.items.reduce((s: number, i: any) => s + (Number(i.cost || i.costPrice || 0) * i.qty), 0);
    acc.laba = acc.omzet - acc.modal;
    return acc;
  }, { omzet: 0, modal: 0, laba: 0 });

  return (
    <div className="min-h-screen bg-[#07080A] text-slate-400 font-sans pb-20">
      <div className="max-w-5xl mx-auto p-6 md:p-12">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-emerald-500 transition-all mb-4">
              <ArrowLeft size={14}/> Back To Store
            </Link>
            <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">Revenue<span className="text-emerald-500">Report.</span></h1>
          </div>
          <div className="bg-[#111318] p-4 rounded-[24px] border border-white/5 flex items-center gap-4 shadow-xl">
            <Calendar size={20} className="text-emerald-500"/>
            <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="bg-transparent text-white font-bold outline-none uppercase text-sm"/>
          </div>
        </header>

        {/* CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#111318] p-8 rounded-[32px] border border-white/5 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
            <TrendingUp className="absolute right-6 top-6 text-emerald-500/10" size={60}/>
            <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-50">Omzet</p>
            <h2 className="text-3xl font-light text-white italic tracking-tighter">Rp{stats.omzet.toLocaleString()}</h2>
          </div>
          <div className="bg-[#111318] p-8 rounded-[32px] border border-white/5 relative overflow-hidden group hover:border-rose-500/30 transition-all">
            <TrendingDown className="absolute right-6 top-6 text-rose-500/10" size={60}/>
            <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-50">Modal</p>
            <h2 className="text-3xl font-light text-rose-500 italic tracking-tighter">Rp{stats.modal.toLocaleString()}</h2>
          </div>
          <div className="bg-[#111318] p-8 rounded-[32px] border border-white/5 relative overflow-hidden group hover:border-emerald-500 transition-all shadow-2xl shadow-emerald-500/5 bg-gradient-to-br from-[#111318] to-[#15201a]">
            <DollarSign className="absolute right-6 top-6 text-emerald-500/20" size={60}/>
            <p className="text-[10px] font-black uppercase tracking-widest mb-2 text-emerald-500">Net Profit</p>
            <h2 className="text-3xl font-black text-emerald-500 italic tracking-tighter">Rp{stats.laba.toLocaleString()}</h2>
          </div>
        </div>

        {/* LIST */}
        <div className="space-y-4">
          {loading ? <Loader2 className="animate-spin text-emerald-500 mx-auto mt-20" size={32}/> : 
           filteredData.length === 0 ? <div className="text-center py-20 uppercase font-black tracking-widest opacity-20 text-sm">No Transactions Found</div> :
           filteredData.map((t, i) => (
            <div key={i} className="bg-[#111318] p-6 rounded-[24px] border border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 hover:bg-white/[0.03] transition-all group">
              <div className="text-left w-full md:w-32">
                <p className="text-[10px] font-black text-emerald-500 uppercase">{t.id.slice(-8)}</p>
                <div className="flex items-center gap-2 text-slate-500 mt-1">
                   <Clock size={12}/> <span className="text-[10px] font-bold">{new Date(t.date).toLocaleTimeString()}</span>
                </div>
              </div>
              <div className="flex-1 flex flex-wrap gap-2 justify-start w-full">
                {t.items.map((it: any, idx: number) => (
                  <span key={idx} className="text-[9px] bg-white/5 px-3 py-1.5 rounded-full border border-white/5 font-black uppercase text-slate-400">{it.name} x{it.qty}</span>
                ))}
              </div>
              <div className="text-right w-full md:w-auto flex items-center justify-between md:justify-end gap-6 border-t md:border-0 pt-4 md:pt-0 border-white/5">
                <p className="text-lg font-light text-white italic tracking-tighter">Rp{t.totalPrice.toLocaleString()}</p>
                <button onClick={() => deleteOne(t.id)} className="p-3 text-slate-800 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"><Trash2 size={18}/></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}