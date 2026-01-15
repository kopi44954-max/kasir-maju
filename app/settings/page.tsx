"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Box } from 'lucide-react';

export default function NexusSettings() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', price: '', cost: '', stock: '', category: 'UMUM' });

  const load = async () => {
    const res = await fetch('/api/pos');
    const data = await res.json();
    setProducts(data.products || []);
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
    <div className="min-h-screen bg-[#07080A] text-slate-400 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-emerald-500 text-xs font-bold uppercase mb-8 inline-block">← KEMBALI</Link>
        <h1 className="text-3xl font-black text-white italic mb-10">CORE <span className="text-emerald-500 not-italic">DATABASE.</span></h1>
        
        <form onSubmit={save} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#111318] p-6 rounded-2xl border border-white/5 mb-10">
          <input placeholder="Nama Barang" value={form.name} onChange={e => setForm({...form, name: e.target.value.toUpperCase()})} className="bg-black/50 p-3 rounded-xl border border-white/10 outline-none focus:border-emerald-500 uppercase text-xs font-bold" required />
          <input placeholder="Kategori (DAHAREUN/INUMAN)" value={form.category} onChange={e => setForm({...form, category: e.target.value.toUpperCase()})} className="bg-black/50 p-3 rounded-xl border border-white/10 outline-none focus:border-emerald-500 text-xs font-bold" required />
          <input type="number" placeholder="Harga Jual" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="bg-black/50 p-3 rounded-xl border border-white/10 outline-none text-xs font-bold" required />
          <input type="number" placeholder="Harga Modal" value={form.cost} onChange={e => setForm({...form, cost: e.target.value})} className="bg-black/50 p-3 rounded-xl border border-white/10 outline-none text-xs font-bold" required />
          <input type="number" placeholder="Stok" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className="bg-black/50 p-3 rounded-xl border border-white/10 outline-none text-xs font-bold" required />
          <button className="bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition-all text-xs uppercase">Simpan Barang</button>
        </form>

        <div className="space-y-2">
          {products.map((p: any) => (
            <div key={p.id} className="flex justify-between items-center bg-[#111318] p-4 rounded-xl border border-white/5">
              <div><p className="text-xs font-bold text-white uppercase">{p.name}</p><p className="text-[10px] text-emerald-500">Stok: {p.stock} • {p.category}</p></div>
              <button onClick={() => del(p.id)} className="text-slate-800 hover:text-rose-500"><Trash2 size={16}/></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}