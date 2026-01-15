"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Box, Plus, Trash2, Database } from 'lucide-react';

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
    await fetch('/api/pos', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'ADD_PRODUCT', data: form }) 
    });
    setForm({ name: '', price: '', cost: '', stock: '' });
    load();
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-400 p-12 md:p-20 font-sans">
      <div className="max-w-7xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-3 text-[10px] font-black uppercase text-indigo-500 mb-12 tracking-[0.3em] hover:text-white transition-colors group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform"/> Back to Terminal
        </Link>
        
        <div className="flex justify-between items-end mb-16 border-b border-white/[0.05] pb-12">
          <div>
            <h1 className="text-5xl font-black text-white italic tracking-tighter">NEXUS<span className="text-indigo-500 not-italic">.</span>CORE</h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-600 mt-4 flex items-center gap-2">
              <Database size={12}/> Centralized Database Management
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* FORM INPUT */}
          <form onSubmit={save} className="lg:col-span-4 space-y-6 bg-[#080808] p-10 rounded-[3rem] border border-white/[0.03] shadow-2xl">
            <h2 className="text-[11px] font-black uppercase text-slate-500 tracking-[0.2em] mb-6 border-b border-white/5 pb-4">New Entry</h2>
            
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-700 ml-2">Product Name</label>
              <input placeholder="..." className="w-full bg-[#0C0C0E] border border-white/5 p-5 rounded-2xl text-white outline-none focus:border-indigo-500/40 transition-all text-sm shadow-inner" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-700 ml-2">Sale Price</label>
                <input type="number" placeholder="0" className="w-full bg-[#0C0C0E] border border-white/5 p-5 rounded-2xl text-white outline-none focus:border-indigo-500/40" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-700 ml-2">Base Cost</label>
                <input type="number" placeholder="0" className="w-full bg-[#0C0C0E] border border-white/5 p-5 rounded-2xl text-white outline-none focus:border-indigo-500/40" value={form.cost} onChange={e => setForm({...form, cost: e.target.value})} required />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-700 ml-2">Initial Inventory</label>
              <input type="number" placeholder="0" className="w-full bg-[#0C0C0E] border border-white/5 p-5 rounded-2xl text-white outline-none focus:border-indigo-500/40" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} required />
            </div>

            <button className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl uppercase text-[10px] tracking-[0.3em] hover:bg-indigo-500 transition-all shadow-[0_15px_30px_rgba(79,70,229,0.2)] mt-6">
              Commit to Base
            </button>
          </form>

          {/* LIST BARANG */}
          <div className="lg:col-span-8 bg-[#080808] border border-white/[0.03] rounded-[3rem] overflow-hidden shadow-2xl">
            <div className="divide-y divide-white/[0.03]">
              {products.length === 0 ? (
                <div className="p-20 text-center uppercase font-black text-[10px] tracking-[0.4em] text-slate-800 italic">No Database Record Found</div>
              ) : (
                products.map((p: any) => (
                  <div key={p.id} className="p-8 flex items-center justify-between hover:bg-white/[0.01] transition-all group">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-[#0C0C0E] border border-white/5 rounded-2xl flex items-center justify-center text-slate-700 group-hover:text-indigo-500 transition-colors shadow-inner">
                        <Box size={24}/>
                      </div>
                      <div>
                        <p className="text-sm font-black text-white uppercase tracking-wider mb-1 group-hover:text-indigo-400 transition-colors">{p.name}</p>
                        <div className="flex gap-4">
                          <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">Stock: {p.stock}</span>
                          <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">Cost: Rp{Number(p.cost).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <p className="font-black text-white italic tracking-tighter text-lg">Rp{Number(p.price).toLocaleString()}</p>
                      <button 
                        onClick={async () => { if(confirm('Delete SKU?')) { await fetch('/api/pos', { method: 'POST', body: JSON.stringify({ type: 'DELETE_PRODUCT', id: p.id }) }); load(); } }} 
                        className="w-10 h-10 flex items-center justify-center text-slate-800 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                      >
                        <Trash2 size={18}/>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}