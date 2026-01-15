"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Box, Trash2 } from 'lucide-react';

export default function NexusSettings() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', price: '', cost: '', stock: '' });

  const load = async () => {
    const res = await fetch('/api/pos');
    const data = await res.json();
    setProducts(data.products || []);
  };

  useEffect(() => { load(); }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/pos', { method: 'POST', body: JSON.stringify({ type: 'ADD_PRODUCT', data: form }) });
    setForm({ name: '', price: '', cost: '', stock: '' });
    load();
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-400 p-12">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-indigo-500 mb-8"><ArrowLeft size={14}/> Terminal Kasir</Link>
        <h1 className="text-4xl font-black text-white italic mb-12 tracking-tighter">NEXUS <span className="text-indigo-500 not-italic">CORE.</span></h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <form onSubmit={save} className="lg:col-span-4 space-y-4 bg-[#080808] p-8 rounded-3xl border border-white/5 h-fit">
            <h2 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4">Input Data Baru</h2>
            <input placeholder="Nama Barang" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-indigo-500/50" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            <div className="grid grid-cols-2 gap-4">
              <input type="number" placeholder="Harga Jual" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-indigo-500/50" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
              <input type="number" placeholder="Harga Modal" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-indigo-500/50" value={form.cost} onChange={e => setForm({...form, cost: e.target.value})} required />
            </div>
            <input type="number" placeholder="Stok" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-indigo-500/50" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} required />
            <button className="w-full bg-indigo-600 text-white font-black py-4 rounded-xl uppercase text-[10px] tracking-widest hover:bg-indigo-500 transition-all">Simpan ke Nexus</button>
          </form>

          <div className="lg:col-span-8 bg-[#080808] border border-white/5 rounded-3xl overflow-hidden">
            <div className="divide-y divide-white/5">
              {products.map((p: any) => (
                <div key={p.id} className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-4">
                    <Box className="text-slate-700" size={20}/>
                    <div>
                      <p className="text-sm font-bold text-white uppercase">{p.name}</p>
                      <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Stok: {p.stock} • Modal: Rp{Number(p.cost).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <p className="font-mono text-indigo-400 text-sm">Rp{Number(p.price).toLocaleString()}</p>
                    <button onClick={async () => { if(confirm('Hapus?')) { await fetch('/api/pos', { method: 'POST', body: JSON.stringify({ type: 'DELETE_PRODUCT', id: p.id }) }); load(); } }} className="text-slate-700 hover:text-rose-500 transition-colors"><Trash2 size={16}/></button>
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