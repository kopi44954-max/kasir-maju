"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trash2, Calendar, ShoppingBag, Receipt, Loader2 } from 'lucide-react';

export default function HistoryPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/pos', { cache: 'no-store' });
      const data = await res.json();
      // Ambil data transaksi dan urutkan dari yang terbaru
      setTransactions(data.transactions?.reverse() || []);
    } catch (err) {
      console.error("Gagal ambil riwayat");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const deleteTransaction = async (id: string) => {
    if (!confirm("Hapus catatan transaksi ini?")) return;
    try {
      await fetch('/api/pos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'DELETE_TRANSACTION', id })
      });
      fetchHistory();
    } catch (err) {
      alert("Gagal menghapus");
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0C10] text-slate-300 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 transition-all">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-xl font-black text-white uppercase tracking-widest italic">Riwayat <span className="text-emerald-500">Transaksi</span></h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Log Aktivitas Penjualan</p>
            </div>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl">
             <span className="text-[10px] font-black text-emerald-500 uppercase">Total: {transactions.length} Trx</span>
          </div>
        </div>

        {/* LIST TRANSAKSI */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-emerald-500 mb-4" />
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Sinkronisasi Data...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-20 bg-white/[0.02] rounded-3xl border border-dashed border-white/10">
            <Receipt size={48} className="mx-auto text-slate-800 mb-4" />
            <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Belum ada transaksi</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((t) => (
              <div key={t.id} className="group bg-[#0F1218] border border-white/5 rounded-2xl p-6 hover:border-emerald-500/30 transition-all relative overflow-hidden">
                {/* Efek Garis Samping */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-600 opacity-20 group-hover:opacity-100 transition-all"></div>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-white tracking-tighter">{t.id}</span>
                      <span className="text-[10px] text-slate-500 font-mono">[{t.date}]</span>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {t.items?.map((item: any, idx: number) => (
                        <span key={idx} className="text-[10px] bg-white/5 border border-white/5 px-2 py-1 rounded-md text-slate-400">
                          {item.name} <span className="text-emerald-500 font-bold">x{item.qty}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                    <div className="text-right">
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Bayar</p>
                      <p className="text-lg font-black text-emerald-500 italic tracking-tighter">Rp{t.totalPrice?.toLocaleString() || t.total?.toLocaleString()}</p>
                    </div>
                    <button 
                      onClick={() => deleteTransaction(t.id)}
                      className="p-3 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}