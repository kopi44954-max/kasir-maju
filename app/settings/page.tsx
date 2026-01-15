"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit3, Trash2, Package } from 'lucide-react';

export default function SettingsPage() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ id: '', name: '', price: '', cost: '', stock: '', category: 'UMUM' });

  const fetchProducts = async () => {
    const res = await fetch('/api/pos');
    const data = await res.json();
    setProducts(data.products || []);
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const type = form.id ? 'UPDATE_PRODUCT' : 'ADD_PRODUCT';
    await fetch('/api/pos', { method: 'POST', body: JSON.stringify({ type, data: form }) });
    setForm({ id: '', name: '', price: '', cost: '', stock: '', category: 'UMUM' });
    fetchProducts();
  };

  return (
    <div className="min-h-screen bg-[#07080A] text-slate-400 p-8 md:p-16">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-black uppercase text-slate-600 hover:text-emerald-500 mb-8"><ArrowLeft size={16}/> Kembali</Link>
        <h1 className="text-4xl font-black text-white italic mb-12 tracking-tighter">INVENTORY <span className="text-emerald-500 not-italic">CONTROL.</span></h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <form onSubmit={handleSubmit} className="lg:col-span-4 bg-[#111318] p-8 rounded-4xl border border-white/5 h-fit space-y-4">
            <h2 className="text-white font-black uppercase text-[10px] tracking-widest mb-4">{form.id ? 'Edit Barang' : 'Barang Baru'}</h2>
            <input placeholder="Nama Barang" className="w-full bg-black/40 border border-white/5 p-4 rounded-xl text-white outline-none focus:border-emerald-500/50" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            <div className="grid grid-cols-2 gap-4">
              <input type="number" placeholder="Stok" className="w-full bg-black/40 border border-white/5 p-4 rounded-xl text-white outline-none" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} />
              <input placeholder="Kategori" className="w-full bg-black/40 border border-white/5 p-4 rounded-xl text-white outline-none" value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-black text-emerald-500 uppercase ml-1">Harga Jual</p>
              <input type="number" placeholder="Rp" className="w-full bg-black/40 border border-emerald-500/20 p-4 rounded-xl text-emerald-500 font-black outline-none" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-black text-slate-600 uppercase ml-1">Harga Modal</p>
              <input type="number" placeholder="Rp" className="w-full bg-black/40 border border-white/5 p-4 rounded-xl text-white outline-none font-bold" value={form.cost} onChange={e => setForm({...form, cost: e.target.value})} />
            </div>
            <button className="w-full bg-emerald-600 py-4 rounded-xl text-white font-black uppercase text-[10px] tracking-widest mt-4">Simpan Ke Gudang</button>
          </form>

          <div className="lg:col-span-8 bg-[#111318] rounded-4xl border border-white/5 overflow-hidden">
            <div className="divide-y divide-white/5">
              {products.map((p: any) => (
                <div key={p.id} className="p-6 flex items-center justify-between hover:bg-white/[0.02]">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-slate-700"><Package size={20}/></div>
                    <div>
                      <h4 className="text-white font-bold uppercase text-sm">{p.name}</h4>
                      <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{p.category} • Stok: {p.stock}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm font-black text-white italic">Rp{Number(p.price).toLocaleString()}</p>
                      <p className="text-[9px] font-bold text-slate-600 uppercase">Modal: Rp{Number(p.cost).toLocaleString()}</p>
                    </div>
                    <button onClick={() => setForm(p)} className="p-2 hover:text-emerald-500 transition-colors"><Edit3 size={18}/></button>
                    <button onClick={async () => { if(confirm('Hapus?')) { await fetch('/api/pos', { method: 'POST', body: JSON.stringify({ type: 'DELETE_PRODUCT', id: p.id }) }); fetchProducts(); } }} className="p-2 hover:text-rose-500 transition-colors"><Trash2 size={18}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}