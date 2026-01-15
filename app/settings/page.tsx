"use client";
import React, { useState, useEffect } from 'react';
// Saya sudah menambahkan 'Home' ke dalam import di bawah ini
import { ArrowLeft, Plus, Download, Package, TrendingUp, History, Home, Settings, Receipt } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function SettingsFinal() {
  const [tab, setTab] = useState('stok');
  const [products, setProducts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [form, setForm] = useState<any>({ name:'', category:'UMUM', cost:'', price:'', stock:'' });

  useEffect(() => {
    fetch('/api/pos').then(res => res.json()).then(data => {
      setProducts(data.products || []);
      setTransactions(data.transactions || []);
    });
  }, []);

  const saveProduct = async (e: any) => {
    e.preventDefault();
    await fetch('/api/pos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'ADD_PRODUCT', data: { ...form, id: Date.now() } })
    });
    alert("Produk Berhasil Disimpan!");
    window.location.reload();
  };

  const exportExcel = () => {
    let csv = "Tanggal,ID Transaksi,Items,Total,Profit\n";
    transactions.forEach(t => {
      const items = t.items.map((i:any)=> `${i.name}(${i.qty})`).join(" | ");
      csv += `${new Date(t.date).toLocaleDateString()},${t.id},"${items}",${t.total},${t.profit}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Laporan_TokoRahma_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 md:pb-0 font-sans">
      <header className="bg-white border-b p-4 flex justify-between items-center sticky top-0 z-50">
        <button onClick={()=>window.location.href='/'} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-all">
          <ArrowLeft size={20} />
        </button>
        <div className="flex gap-2 bg-gray-100 p-1 rounded-2xl">
          <button 
            onClick={()=>setTab('stok')} 
            className={`px-6 py-2 rounded-xl font-black text-[10px] uppercase transition-all ${tab==='stok'?'bg-[#00AA5B] text-white shadow-md':'text-gray-400'}`}
          >
            Stok
          </button>
          <button 
            onClick={()=>setTab('laporan')} 
            className={`px-6 py-2 rounded-xl font-black text-[10px] uppercase transition-all ${tab==='laporan'?'bg-[#00AA5B] text-white shadow-md':'text-gray-400'}`}
          >
            Laporan
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {tab === 'stok' ? (
          <div className="space-y-6">
            {/* MODAL / FORM TAMBAH PRODUK */}
            <form onSubmit={saveProduct} className="bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-gray-100 space-y-4">
              <h2 className="font-black text-xs uppercase text-gray-400 tracking-[0.2em] mb-4">Input Data Inventaris</h2>
              <input required placeholder="NAMA PRODUK" value={form.name} onChange={e=>setForm({...form, name:e.target.value.toUpperCase()})} className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none border-none focus:ring-2 focus:ring-[#00AA5B] transition-all"/>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 ml-2">HARGA MODAL</label>
                  <input required type="number" placeholder="Rp 0" value={form.cost} onChange={e=>setForm({...form, cost:e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none border-none focus:ring-2 focus:ring-[#00AA5B] mt-1"/>
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 ml-2">HARGA JUAL</label>
                  <input required type="number" placeholder="Rp 0" value={form.price} onChange={e=>setForm({...form, price:e.target.value})} className="w-full p-4 bg-green-50 text-[#00AA5B] rounded-2xl font-black outline-none border-none focus:ring-2 focus:ring-[#00AA5B] mt-1"/>
                </div>
              </div>
              <input required type="number" placeholder="JUMLAH STOK AWAL" value={form.stock} onChange={e=>setForm({...form, stock:e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none border-none focus:ring-2 focus:ring-[#00AA5B]"/>
              <button className="w-full py-5 bg-[#00AA5B] text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-green-100 active:scale-95 transition-all">
                Simpan Produk
              </button>
            </form>

            <div className="bg-white rounded-[32px] shadow-sm overflow-hidden border border-gray-100">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 font-black text-gray-400 uppercase border-b">
                  <tr><th className="p-5">Produk</th><th className="p-5 text-center">Modal</th><th className="p-5 text-center">Jual</th><th className="p-5 text-center">Stok</th></tr>
                </thead>
                <tbody className="font-bold uppercase divide-y">
                  {products.map(p=>(
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-5 font-black text-gray-800">{p.name}</td>
                      <td className="p-5 text-center text-red-400">Rp{Number(p.cost).toLocaleString()}</td>
                      <td className="p-5 text-center text-[#00AA5B]">Rp{Number(p.price).toLocaleString()}</td>
                      <td className="p-5 text-center bg-gray-50/50">{p.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex justify-between items-center">
                <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Omzet</p><p className="text-2xl font-black text-[#00AA5B] tracking-tighter">Rp{transactions.reduce((s,t)=>s+t.total,0).toLocaleString()}</p></div>
                <TrendingUp className="text-green-200" size={40} />
              </div>
              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex justify-between items-center">
                <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Profit</p><p className="text-2xl font-black text-orange-500 tracking-tighter">Rp{transactions.reduce((s,t)=>s+t.profit,0).toLocaleString()}</p></div>
                <Package className="text-orange-100" size={40} />
              </div>
            </div>
            
            <button onClick={exportExcel} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-blue-100 active:scale-95 transition-all">
              <Download size={18}/> Export Laporan (Excel/CSV)
            </button>

            <div className="bg-white rounded-[32px] shadow-sm overflow-hidden border border-gray-100">
              <div className="p-6 border-b bg-gray-50/50"><h3 className="font-black text-xs uppercase text-gray-400">Riwayat Transaksi</h3></div>
              <table className="w-full text-left text-[11px]">
                <thead className="bg-gray-50 font-black text-gray-400 uppercase border-b">
                  <tr><th className="p-5">Waktu</th><th className="p-5">Rincian Barang</th><th className="p-5 text-right">Profit</th></tr>
                </thead>
                <tbody className="font-bold divide-y uppercase text-gray-600">
                  {transactions.map(t=>(
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-5 text-gray-400 font-medium">{new Date(t.date).toLocaleDateString()}</td>
                      <td className="p-5">
                        {t.items.map((it:any)=> (
                          <div key={it.id} className="mb-1 text-gray-800 tracking-tight">• {it.name} <span className="text-gray-400">({it.qty}x)</span></div>
                        ))}
                      </td>
                      <td className="p-5 text-right text-orange-500 font-black">Rp{t.profit.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM NAV MOBILE (Sudah Diperbaiki) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around py-4 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <button onClick={()=>window.location.href='/'} className="flex flex-col items-center gap-1 text-gray-400">
          <Home size={20}/><span className="text-[10px] font-black uppercase tracking-tighter">Kasir</span>
        </button>
        <button onClick={()=>setTab('laporan')} className={`flex flex-col items-center gap-1 ${tab==='laporan'?'text-[#00AA5B]':'text-gray-400'}`}>
          <Receipt size={20}/><span className="text-[10px] font-black uppercase tracking-tighter">Laporan</span>
        </button>
        <button onClick={()=>setTab('stok')} className={`flex flex-col items-center gap-1 ${tab==='stok'?'text-[#00AA5B]':'text-gray-400'}`}>
          <Package size={20}/><span className="text-[10px] font-black uppercase tracking-tighter">Stok</span>
        </button>
      </nav>
    </div>
  );
}