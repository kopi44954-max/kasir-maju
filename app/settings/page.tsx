"use client";
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Download, Package, TrendingUp, History } from 'lucide-react';

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
      body: JSON.stringify({ type: 'ADD_PRODUCT', data: { ...form, id: Date.now() } })
    });
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
    <div className="min-h-screen bg-[#F8F9FA] pb-24 md:pb-0">
      <header className="bg-white border-b p-4 flex justify-between items-center sticky top-0 z-50">
        <button onClick={()=>window.location.href='/'} className="p-2 bg-gray-100 rounded-full"><ArrowLeft/></button>
        <div className="flex gap-2">
          <button onClick={()=>setTab('stok')} className={`px-4 py-2 rounded-xl font-bold text-xs uppercase ${tab==='stok'?'bg-[#00AA5B] text-white':'text-gray-400'}`}>Stok</button>
          <button onClick={()=>setTab('laporan')} className={`px-4 py-2 rounded-xl font-bold text-xs uppercase ${tab==='laporan'?'bg-[#00AA5B] text-white':'text-gray-400'}`}>Laporan</button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {tab === 'stok' ? (
          <div className="space-y-6">
            <form onSubmit={saveProduct} className="bg-white p-6 rounded-3xl shadow-sm space-y-4">
              <h2 className="font-black text-sm uppercase text-gray-400">Tambah Produk Baru</h2>
              <input required placeholder="NAMA PRODUK" value={form.name} onChange={e=>setForm({...form, name:e.target.value.toUpperCase()})} className="w-full p-3 bg-gray-50 rounded-xl font-bold outline-none border-none focus:ring-2 focus:ring-[#00AA5B]"/>
              <div className="grid grid-cols-2 gap-4">
                <input required type="number" placeholder="HARGA MODAL (RP)" value={form.cost} onChange={e=>setForm({...form, cost:e.target.value})} className="p-3 bg-gray-50 rounded-xl font-bold outline-none border-none"/>
                <input required type="number" placeholder="HARGA JUAL (RP)" value={form.price} onChange={e=>setForm({...form, price:e.target.value})} className="p-3 bg-green-50 text-[#00AA5B] rounded-xl font-bold outline-none border-none"/>
              </div>
              <input required type="number" placeholder="STOK AWAL" value={form.stock} onChange={e=>setForm({...form, stock:e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl font-bold outline-none border-none"/>
              <button className="w-full py-4 bg-[#00AA5B] text-white rounded-2xl font-black uppercase">Simpan ke Inventaris</button>
            </form>

            <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 font-black text-gray-400 uppercase">
                  <tr><th className="p-4">Produk</th><th className="p-4">Modal</th><th className="p-4">Jual</th><th className="p-4">Stok</th></tr>
                </thead>
                <tbody className="font-bold uppercase divide-y">
                  {products.map(p=>(
                    <tr key={p.id}><td className="p-4">{p.name}</td><td className="p-4 text-red-400">Rp{Number(p.cost).toLocaleString()}</td><td className="p-4 text-[#00AA5B]">Rp{Number(p.price).toLocaleString()}</td><td className="p-4">{p.stock}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-3xl shadow-sm"><p className="text-[10px] font-black text-gray-400 uppercase">Total Omzet</p><p className="text-xl font-black text-[#00AA5B]">Rp{transactions.reduce((s,t)=>s+t.total,0).toLocaleString()}</p></div>
              <div className="bg-white p-6 rounded-3xl shadow-sm"><p className="text-[10px] font-black text-gray-400 uppercase">Total Profit</p><p className="text-xl font-black text-orange-500">Rp{transactions.reduce((s,t)=>s+t.profit,0).toLocaleString()}</p></div>
            </div>
            <button onClick={exportExcel} className="w-full py-3 bg-blue-500 text-white rounded-2xl font-black uppercase flex items-center justify-center gap-2"><Download size={18}/> Export ke Excel (.CSV)</button>
            <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
              <table className="w-full text-left text-[10px]">
                <thead className="bg-gray-50 font-black text-gray-400 uppercase">
                  <tr><th className="p-4">Tanggal</th><th className="p-4">Rincian</th><th className="p-4 text-right">Profit</th></tr>
                </thead>
                <tbody className="font-bold divide-y uppercase">
                  {transactions.map(t=>(
                    <tr key={t.id}>
                      <td className="p-4 text-gray-400">{new Date(t.date).toLocaleDateString()}</td>
                      <td className="p-4">{t.items.map((it:any)=>`${it.name} x${it.qty}`).join(", ")}</td>
                      <td className="p-4 text-right text-orange-500">Rp{t.profit.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-4 z-[100]">
        <button onClick={()=>window.location.href='/'} className="flex flex-col items-center text-gray-400"><Home size={20}/><span className="text-[10px] font-bold">Kasir</span></button>
        <button onClick={()=>setTab('laporan')} className={`flex flex-col items-center ${tab==='laporan'?'text-[#00AA5B]':'text-gray-400'}`}><History size={20}/><span className="text-[10px] font-bold">Laporan</span></button>
        <button onClick={()=>setTab('stok')} className={`flex flex-col items-center ${tab==='stok'?'text-[#00AA5B]':'text-gray-400'}`}><Package size={20}/><span className="text-[10px] font-bold">Stok</span></button>
      </nav>
    </div>
  );
}