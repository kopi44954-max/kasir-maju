"use client";
import React, { useState, useEffect } from 'react';
import { Home, Receipt, Settings, Trash2, Clock, AlertTriangle } from 'lucide-react';

export default function HistoryGlass() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/pos?t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      setTransactions(data.transactions || []);
    } catch (err) {
      console.error("Gagal mengambil data:", err);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchData();
  }, []);

  // Fungsi Hapus Satu Per Satu
  const deleteTransaction = async (timestamp: string) => {
    if (!confirm("Hapus riwayat transaksi ini?")) return;
    try {
      await fetch('/api/pos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'DELETE_TRANSACTION', id: timestamp })
      });
      fetchData(); // Refresh data
    } catch (err) {
      alert("Gagal menghapus");
    }
  };

  // Fungsi Hapus Semua Riwayat
  const clearAllHistory = async () => {
    if (!confirm("PERINGATAN: Semua riwayat penjualan akan dihapus permanen! Lanjutkan?")) return;
    try {
      await fetch('/api/pos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'CLEAR_HISTORY' })
      });
      fetchData(); // Refresh data
    } catch (err) {
      alert("Gagal membersihkan riwayat");
    }
  };

  const calculateTotal = (key: string) => transactions.reduce((sum, t) => sum + Number(t[key] || 0), 0);

  if (!isMounted) return null;

  return (
    <div className="h-screen bg-slate-50 flex flex-col md:flex-row font-sans overflow-hidden">
      {/* SIDEBAR - CONSISTENT */}
      <aside className="hidden md:flex w-20 bg-white border-r border-slate-200 flex-col items-center py-8 gap-6 h-full">
        <button onClick={() => window.location.href='/'} className="p-3 text-slate-400 hover:text-[#00AA5B] transition-all"><Home size={22}/></button>
        <button onClick={() => window.location.href='/history'} className="p-3 text-[#00AA5B] bg-green-50 rounded-xl"><Receipt size={22}/></button>
        <button onClick={() => window.location.href='/setting'} className="p-3 text-slate-400 hover:text-[#00AA5B] transition-all"><Settings size={22}/></button>
      </aside>

      <div className="flex-1 overflow-y-auto p-4 md:p-10 pb-24">
        <div className="max-w-4xl mx-auto space-y-6">
          <header className="flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-black text-slate-800 uppercase italic">Riwayat Penjualan</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Data laporan transaksi masuk</p>
            </div>
            {transactions.length > 0 && (
              <button 
                onClick={clearAllHistory}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-500 rounded-xl text-[10px] font-black uppercase hover:bg-red-500 hover:text-white transition-all border border-red-100"
              >
                <AlertTriangle size={14}/> Bersihkan Semua
              </button>
            )}
          </header>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase">Total Omzet</p>
              <p className="text-2xl font-black text-slate-800 tracking-tighter">Rp{calculateTotal('total').toLocaleString()}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm border-l-4 border-l-green-500">
              <p className="text-[10px] font-black text-green-500 uppercase">Estimasi Laba</p>
              <p className="text-2xl font-black text-green-600 tracking-tighter">Rp{calculateTotal('profit').toLocaleString()}</p>
            </div>
          </div>

          <div className="space-y-3">
             {transactions.length === 0 ? (
               <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                 <Clock className="mx-auto text-slate-200 mb-2" size={40}/>
                 <p className="text-slate-400 font-bold text-sm uppercase">Belum ada transaksi</p>
               </div>
             ) : (
               [...transactions].reverse().map((t, idx) => (
                <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-200 flex flex-col gap-3 group hover:border-green-200 transition-all">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase">{new Date(t.date).toLocaleString('id-ID')}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black bg-slate-100 px-2 py-1 rounded text-slate-500">ID: {t.date ? new Date(t.date).getTime().toString().slice(-6) : idx+1}</span>
                          <button 
                            onClick={() => deleteTransaction(t.date)} 
                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 size={16}/>
                          </button>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {t.items?.map((it:any, i:number) => (
                          <span key={i} className="px-3 py-1 bg-slate-50 border border-slate-100 text-[10px] font-bold rounded-full uppercase text-slate-600">
                            {it.name} <span className="text-green-600 ml-1">x{it.qty}</span>
                          </span>
                        ))}
                    </div>
                    <div className="flex justify-between border-t border-slate-50 pt-3 items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Profit: <span className="text-slate-700 font-black">Rp{t.profit?.toLocaleString()}</span></span>
                        <span className="text-sm font-black text-green-600 italic uppercase">Rp{t.total?.toLocaleString()}</span>
                    </div>
                </div>
               ))
             )}
          </div>
        </div>
      </div>

      {/* MOBILE NAV - CONSISTENT */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center h-16 z-50">
        <button onClick={() => window.location.href='/'} className="text-slate-400 flex flex-col items-center"><Home size={20}/><span className="text-[10px] font-bold">Home</span></button>
        <button onClick={() => window.location.href='/history'} className="text-[#00AA5B] flex flex-col items-center"><Receipt size={20}/><span className="text-[10px] font-bold">Riwayat</span></button>
        <button onClick={() => window.location.href='/setting'} className="text-slate-400 flex flex-col items-center"><Settings size={20}/><span className="text-[10px] font-bold">Setelan</span></button>
      </nav>
    </div>
  );
}