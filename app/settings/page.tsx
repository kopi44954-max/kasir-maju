"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Package, Trash2 } from 'lucide-react';

export default function Settings() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', price: '', cost: '', stock: '', category: 'UMUM' });

  const load = async () => {
    const res = await fetch('/api/pos');
    const data = await res.json();
    setProducts(data.products || []);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/pos', {
      method: 'POST',
      body: JSON.stringify({ type: 'ADD_PRODUCT', data: form })
    });
    if (res.ok) {
      setForm({ name: '', price: '', cost: '', stock: '', category: 'UMUM' });
      load();
      alert("Produk Berhasil Ditambah!");
    }
  };

  return (
    <div className="min-h-screen bg-[#07080A] text-white p-8">
      <div className="max-w-5xl mx-auto">
        <Link href="/" className="text-slate-500 hover:text-emerald-500 flex items-center gap-2 mb-8 text-xs font-bold uppercase tracking-widest transition-all">
          <ArrowLeft size={16}/> Kembali ke Kasir
        </Link>
        
        <h1 className="text-4xl font-black italic mb-12">PENGATURAN <span className="text-emerald-500 not-italic">STOK.</span></h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Form Tambah */}
          <form onSubmit={handleAdd} className="lg:col-span-4 bg-[#111318] p-8 rounded-3xl border border-white/5 space-y-4 h-fit">
            <h2 className="text-xs font-black uppercase text-emerald-500 mb-4 flex items-center gap-2"><Plus size={16}/> Tambah Produk</h2>
            <input placeholder="Nama Barang" className="w-full bg-black/40 border border-white/10 p-4 rounded-xl outline-none focus:border-emerald-500 text-sm" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            <input type="number" placeholder="Harga Jual" className="w-full bg-black/40 border border-white/10 p-4 rounded-xl outline-none focus:border-emerald-500 text-sm" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
            <input type="number" placeholder="Harga Modal" className="w-full bg-black/40 border border-white/10 p-4 rounded-xl outline-none focus:border-emerald-500 text-sm" value={form.cost} onChange={e => setForm({...form, cost: e.target.value})} required />
            <input type="number" placeholder="Stok Awal" className="w-full bg-black/40 border border-white/10 p-4 rounded-xl outline-none focus:border-emerald-500 text-sm" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} required />
            <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl uppercase text-xs tracking-widest transition-all shadow-lg shadow-emerald-900/20">Simpan Barang</button>
          </form>

          {/* Daftar Produk */}
          <div className="lg:col-span-8 bg-[#111318] rounded-3xl border border-white/5 overflow-hidden">
            <div className="p-6 border-b border-white/5 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500">Daftar Inventori</div>
            <div className="divide-y divide-white/5">
              {products.map((p: any) => (
                <div key={p.id} className="p-6 flex justify-between items-center group hover:bg-white/[0.02]">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-slate-600 group-hover:text-emerald-500 transition-colors"><Package size={18}/></div>
                    <div>
                      <p className="font-bold uppercase text-sm">{p.name}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Stok: {p.stock} • Modal: Rp{Number(p.cost).toLocaleString()}</p>
                    </div>
                  </div>
                  <p className="font-black text-emerald-500 italic">Rp{Number(p.price).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}