"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Box, Trash2, Database, Layers } from 'lucide-react';

export default function NexusSettings() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', price: '', cost: '', stock: '', category: 'UMUM' });

  const load = async () => {
    const res = await fetch('/api/pos');
    const data = await res.json();
    setProducts(data.products || []);
  };

  useEffect(() => { load(); }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/pos', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'ADD_PRODUCT', data: form }) 
    });
    setForm({ name: '', price: '', cost: '', stock: '', category: 'UMUM' });
    load();
    alert("PRODUCT_SYNC_SUCCESS");
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-400 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-emerald-500 mb-8 tracking-widest"><ArrowLeft size={14}/> Back to Nexus</Link>
        <h1 className="text-4xl font-black text-white italic mb-12 tracking-tighter uppercase">Nexus <span className="text-emerald-500 not-italic">Core.</span></h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <form onSubmit={save} className="lg:col-span-4 space-y-4 bg-[#080808] p-6 rounded-2xl border border-white/5 h-fit shadow-2xl">
            <h2 className="text-[10px] font-black uppercase text-emerald-500/50 tracking-widest mb-4 flex items-center gap-2"><Layers size={14}/> SKU Registration</h2>
            <input placeholder="Product Name" className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-emerald-500/50 text-xs" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            <input placeholder="Category (e.g. SNACK, DRINK)" className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-emerald-500/50 text-xs" value={form.category} onChange={e => setForm({...form, category: e.target.value.toUpperCase()})} required />
            <div className="grid grid-cols-2 gap-3">
              <input type="number" placeholder="Sale Price" className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white outline-none text-xs" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
              <input type="number" placeholder="Cost" className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white outline-none text-xs" value={form.cost} onChange={e => setForm({...form, cost: e.target.value})} required />
            </div>
            <input type="number" placeholder="Stock" className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white outline-none text-xs" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} required />
            <button className="w-full bg-emerald-600 text-black font-black py-3 rounded-xl uppercase text-[10px] tracking-widest hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/10">Execute Sync</button>
          </form>

          <div className="lg:col-span-8 bg-[#080808] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-white/5 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
              <span>Database Status: Online</span>
              <span>{products.length} Products Loaded</span>
            </div>
            <div className="divide-y divide-white/5">
              {products.map((p: any) => (
                <div key={p.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#0C0C0E] border border-white/5 rounded-xl flex items-center justify-center text-emerald-500/50"><Box size={20}/></div>
                    <div>
                      <p className="text-xs font-bold text-white uppercase tracking-wider">{p.name}</p>
                      <p className="text-[9px] font-bold text-slate-600 uppercase">Stock: {p.stock} • {p.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <p className="font-black text-emerald-500 text-xs tracking-tighter italic">Rp{Number(p.price).toLocaleString()}</p>
                    <button onClick={async () => { if(confirm('Delete SKU?')) { await fetch('/api/pos', { method: 'POST', body: JSON.stringify({ type: 'DELETE_PRODUCT', id: p.id }) }); load(); } }} className="text-slate-800 hover:text-rose-500 transition-colors"><Trash2 size={16}/></button>
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