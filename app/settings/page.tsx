"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trash2, Package, PlusCircle, LayoutGrid } from 'lucide-react';

export default function NexusSettings() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', price: '', cost: '', stock: '', category: 'UMUM' });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/pos');
    const data = await res.json();
    setProducts(data.products || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async (e: any) => {
    e.preventDefault();
    await fetch('/api/pos', { method: 'POST', body: JSON.stringify({ type: 'ADD_PRODUCT', data: form }) });
    setForm({ name: '', price: '', cost: '', stock: '', category: 'UMUM' });
    load();
  };

  const del = async (id: any) => {
    if (confirm("Hapus barang?")) {
      await fetch('/api/pos', { method: 'POST', body: JSON.stringify({ type: 'DELETE_PRODUCT', id }) });
      load();
    }
  };

  return (
    <div className="min-h-screen bg-[#07080A] text-slate-400 font-sans pb-20">
      <div className="max-w-4xl mx-auto p-6 md:p-12">
        <header className="mb-16">
          <Link href="/" className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-8 inline-block hover:gap-4 transition-all">← Back To Sales</Link>
          <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">Inventory<span className="text-emerald-500">Core.</span></h1>
        </header>
        
        <form onSubmit={save} className="bg-[#111318] p-8 rounded-[32px] border border-white/5 grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 shadow-2xl">
          <div className="space-y-2 col-span-full">
            <label className="text-[10px] font-black uppercase tracking-widest ml-2 opacity-50">Nama Barang</label>
            <input placeholder="Contoh: TEH PUCUK" value={form.name} onChange={e => setForm({...form, name: e.target.value.toUpperCase()})} className="w-full bg-black/50 p-4 rounded-2xl border border-white/10 outline-none focus:border-emerald-500 transition-all text-white font-bold uppercase placeholder:opacity-20" required />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest ml-2 opacity-50">Kategori</label>
            <input placeholder="INUMAN / MAKANAN" value={form.category} onChange={e => setForm({...form, category: e.target.value.toUpperCase()})} className="w-full bg-black/50 p-4 rounded-2xl border border-white/10 outline-none focus:border-emerald-500 transition-all text-white font-bold uppercase" required />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest ml-2 opacity-50">Stok Awal</label>
            <input type="number" placeholder="0" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className="w-full bg-black/50 p-4 rounded-2xl border border-white/10 outline-none focus:border-emerald-500 transition-all text-white font-bold" required />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest ml-2 opacity-50">Harga Modal (Rp)</label>
            <input type="number" placeholder="0" value={form.cost} onChange={e => setForm({...form, cost: e.target.value})} className="w-full bg-black/50 p-4 rounded-2xl border border-white/10 outline-none focus:border-emerald-500 transition-all text-rose-400 font-bold" required />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest ml-2 opacity-50">Harga Jual (Rp)</label>
            <input type="number" placeholder="0" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full bg-black/50 p-4 rounded-2xl border border-white/10 outline-none focus:border-emerald-500 transition-all text-emerald-400 font-bold" required />
          </div>
          <button className="col-span-full mt-4 py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl transition-all uppercase text-xs tracking-[0.2em] shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-3">
            <PlusCircle size={18}/> Simpan Produk Baru
          </button>
        </form>

        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-6 ml-2 opacity-50 uppercase font-black text-[10px] tracking-widest"><LayoutGrid size={14}/> Total {products.length} Produk</div>
          {products.map((p: any) => (
            <div key={p.id} className="group bg-[#111318] p-5 rounded-2xl border border-white/5 flex justify-between items-center hover:bg-white/[0.03] transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500"><Package size={20}/></div>
                <div>
                  <p className="text-xs font-black text-white uppercase tracking-tight">{p.name}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{p.category} • Stok: {p.stock}</p>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-xs font-bold text-emerald-500 tracking-tighter">Rp{Number(p.price).toLocaleString()}</p>
                  <p className="text-[10px] text-slate-600 line-through">Rp{Number(p.cost).toLocaleString()}</p>
                </div>
                <button onClick={() => del(p.id)} className="p-3 text-slate-800 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"><Trash2 size={18}/></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}