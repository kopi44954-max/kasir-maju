"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Loader2, Trash2, Clock, Receipt, TrendingUp } from 'lucide-react';

export default function RiwayatTransaksi() {
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

  const del = async (id: any) => { if(confirm("Hapus transaksi ini?")){ await fetch('/api/pos', { method:'POST', body:JSON.stringify({type:'DELETE_TRANSACTION', id}) }); load(); }};
  const delAll = async () => { if(confirm("Hapus semua riwayat?")){ await fetch('/api/pos', { method:'POST', body:JSON.stringify({type:'DELETE_ALL_TRANSACTIONS'}) }); load(); }};

  const filtered = trx.filter(t => t.date.startsWith(date));
  const stats = filtered.reduce((acc, curr) => {
    acc.omzet += curr.totalPrice;
    acc.modal += curr.items.reduce((s: any, i: any) => s + (Number(i.cost || 0) * i.qty), 0);
    acc.laba = acc.omzet - acc.modal;
    return acc;
  }, { omzet: 0, modal: 0, laba: 0 });

  return (
    <div className="min-h-screen bg-[#F0F3F7] pb-24">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="flex flex-col gap-6 mb-8">
          <Link href="/" className="flex items-center gap-2 text-[#00AA5B] font-bold text-sm">
            <ArrowLeft size={18}/> Kembali ke Kasir
          </Link>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div>
              <h1 className="text-2xl font-bold text-[#212121]">Riwayat Transaksi</h1>
              <p className="text-xs text-gray-500 mt-1">Pantau performa penjualan harian Anda</p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
               <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium outline-none focus:border-[#00AA5B]"/>
               <button onClick={delAll} className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg border border-red-100 transition-colors"><Trash2 size={20}/></button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Omzet</p>
            <p className="text-xl font-bold text-[#212121]">Rp{stats.omzet.toLocaleString()}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-red-400">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Modal</p>
            <p className="text-xl font-bold text-red-500">Rp{stats.modal.toLocaleString()}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-[#00AA5B]/20 shadow-md shadow-green-100 border-l-4 border-l-[#00AA5B]">
            <p className="text-[10px] font-bold text-[#00AA5B] uppercase tracking-wider mb-1">Estimasi Laba</p>
            <p className="text-xl font-bold text-[#00AA5B]">Rp{stats.laba.toLocaleString()}</p>
          </div>
        </div>

        <div className="space-y-3">
          {loading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#00AA5B]" size={40}/></div> : 
           filtered.length === 0 ? <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300 text-gray-400 font-medium">Belum ada transaksi di tanggal ini</div> :
           filtered.map((t, i) => (
            <div key={i} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between gap-4 hover:border-[#00AA5B]/30 transition-all group">
              <div className="flex gap-4 items-start">
                <div className="p-3 bg-gray-50 rounded-lg text-gray-400 group-hover:text-[#00AA5B] transition-colors"><Receipt size={24}/></div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-[#212121]">{new Date(t.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-green-50 text-[#00AA5B] rounded font-bold uppercase tracking-tighter">Sukses</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {t.items.map((it: any, idx: any) => (
                      <span key={idx} className="text-[10px] bg-gray-50 text-gray-600 px-2 py-1 rounded-md border border-gray-100 font-medium">{it.name} (x{it.qty})</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-between md:flex-col md:items-end border-t md:border-t-0 pt-3 md:pt-0">
                <p className="text-lg font-bold text-[#212121]">Rp{t.totalPrice.toLocaleString()}</p>
                <button onClick={()=>del(t.id)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}