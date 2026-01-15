"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Loader2, Trash2, Clock, DollarSign } from 'lucide-react';

export default function Laporan() {
  const [trx, setTrx] = useState<any[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/pos');
    const data = await res.json();
    setTrx(data.transactions || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const del = async (id: any) => { if(confirm("Hapus data?")){ await fetch('/api/pos', { method:'POST', body:JSON.stringify({type:'DELETE_TRANSACTION', id}) }); load(); }};
  const delAll = async () => { if(confirm("Reset semua riwayat?")){ await fetch('/api/pos', { method:'POST', body:JSON.stringify({type:'DELETE_ALL_TRANSACTIONS'}) }); load(); }};

  const filtered = trx.filter(t => t.date.startsWith(date));
  const stats = filtered.reduce((acc, curr) => {
    acc.omzet += curr.totalPrice;
    acc.modal += curr.items.reduce((s: any, i: any) => s + (Number(i.cost || 0) * i.qty), 0);
    acc.laba = acc.omzet - acc.modal;
    return acc;
  }, { omzet: 0, modal: 0, laba: 0 });

  return (
    <div className="min-h-screen bg-[#07080A] text-slate-400 p-6 md:p-12 pb-32">
      <div className="max-w-4xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div className="space-y-2"><Link href="/" className="text-[10px] font-black uppercase text-slate-600 flex items-center gap-2"><ArrowLeft size={14}/> Kembali</Link>
          <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">Riwayat <span className="text-emerald-500">Laba.</span></h1></div>
          <div className="flex gap-4">
            <button onClick={delAll} className="text-rose-500 text-[10px] font-black uppercase p-2 border border-rose-500/20 rounded-xl">Hapus Semua</button>
            <div className="bg-[#111318] p-3 rounded-xl border border-white/5 flex items-center gap-3"><Calendar size={18} className="text-emerald-500"/><input type="date" value={date} onChange={e=>setDate(e.target.value)} className="bg-transparent text-white font-bold outline-none text-xs"/></div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#111318] p-6 rounded-3xl border border-white/5"><p className="text-[10px] font-black uppercase mb-2 opacity-50">Omzet</p><p className="text-2xl font-light text-white italic">Rp{stats.omzet.toLocaleString()}</p></div>
          <div className="bg-[#111318] p-6 rounded-3xl border border-white/5"><p className="text-[10px] font-black uppercase mb-2 opacity-50 text-rose-500">Modal</p><p className="text-2xl font-light text-rose-500 italic">Rp{stats.modal.toLocaleString()}</p></div>
          <div className="bg-emerald-600 p-6 rounded-3xl shadow-xl shadow-emerald-500/10"><p className="text-[10px] font-black uppercase mb-2 text-white/50">Laba Bersih</p><p className="text-2xl font-black text-white italic">Rp{stats.laba.toLocaleString()}</p></div>
        </div>

        <div className="space-y-4">
          {loading ? <Loader2 className="animate-spin text-emerald-500 mx-auto" /> : filtered.map((t, i) => (
            <div key={i} className="bg-[#111318] p-5 rounded-2xl border border-white/5 flex justify-between items-center group">
              <div className="flex-1">
                <p className="text-[10px] font-black text-emerald-500 uppercase flex items-center gap-2"><Clock size={12}/> {new Date(t.date).toLocaleTimeString()}</p>
                <div className="flex flex-wrap gap-2 mt-2">{t.items.map((it: any, idx: any) => (<span key={idx} className="text-[9px] bg-white/5 px-2 py-1 rounded-lg border border-white/5 font-black text-slate-400 uppercase">{it.name} x{it.qty}</span>))}</div>
              </div>
              <div className="text-right flex items-center gap-6">
                <p className="text-xl font-light text-white italic">Rp{t.totalPrice.toLocaleString()}</p>
                <button onClick={()=>del(t.id)} className="p-2 text-slate-600 hover:text-rose-500"><Trash2 size={18}/></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}