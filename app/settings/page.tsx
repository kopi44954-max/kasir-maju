"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trash2, Package, PlusCircle, Database, LayoutPanelTop } from 'lucide-react';

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
    if (confirm("Hapus data produk ini?")) {
      await fetch('/api/pos', { method: 'POST', body: JSON.stringify({ type: 'DELETE_PRODUCT', id }) });
      load();
    }
  };

  return (
    <div className="min-h-screen bg-[#07080A] text-slate-400 p-6 md:p-12 pb-32">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 hover:text-emerald-500 transition-all">
              <ArrowLeft size={14}/> Back To Store
            </Link>
            <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">Inventory<span className="text-emerald-500">Core.</span></h1>
          </div>
          <div className="flex items-center gap-2 bg-emerald-500/10 px-4 py-2 rounded-2xl border border-emerald-500/20 text-emerald-500">
            <Database size={16}/> <span className="text-[10px] font-black uppercase">Live KV Cloud</span>
          </div>
        </header>

        <form onSubmit={save} className="bg-[#0F1218] p-8 md:p-10 rounded-[40px] border border-white/5 grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full translate-x-10 -translate-y-10"></div>
          
          <div className="space-y-3 col-span-full">
            <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-600 italic">Item Identity</label>
            <input placeholder="Nama Barang (Ex: TEH BOTOL)" value={form.name} onChange={e => setForm({...form, name: e.target.value.toUpperCase()})} className="w-full bg-black/30 border border-white/10 rounded-[24px] p-5 text-white font-bold uppercase focus:border-emerald-500 outline-none transition-all placeholder:opacity-20" required />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-600 italic">Category Group</label>
            <input placeholder="Ex: INUMAN" value={form.category} onChange={e => setForm({...form, category: e.target.value.toUpperCase()})} className="w-full bg-black/30 border border-white/10 rounded-[20px] p-4 text-white font-bold uppercase focus:border-emerald-500 outline-none transition-all" required />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-600 italic">Starting Stock</label>
            <input type="number" placeholder="0" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-[20px] p-4 text-white font-bold focus:border-emerald-500 outline-none transition-all" required />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-rose-500 italic">Capital Cost (Rp)</label>
            <input type="number" placeholder="0" value={form.cost} onChange={e => setForm({...form, cost: e.target.value})} className="w-full bg-black/30 border border-rose-500/20 rounded-[20px] p-4 text-rose-500 font-bold focus:border-rose-500 outline-none transition-all" required />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-emerald-500 italic">Selling Price (Rp)</label>
            <input type="number" placeholder="0" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full bg-black/30 border border-emerald-500/20 rounded-[20px] p-4 text-emerald-400 font-bold focus:border-emerald-500 outline-none transition-all" required />
          </div>

          <button className="col-span-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-[24px] uppercase text-xs tracking-widest shadow-xl shadow-emerald-600/10 flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-[0.98]">
            <PlusCircle size={20}/> Push To Inventory
          </button>
        </form>

        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-8 ml-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Data Master ({products.length})</p>
          </div>

          <div className="grid gap-3">
            {products.map((p: any) => (
              <div key={p.id} className="group bg-[#0F1218] p-5 rounded-[28px] border border-white/5 flex items-center justify-between hover:border-white/20 transition-all hover:shadow-2xl">
                <div className="flex items-center gap-5 min-w-0">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-slate-500 group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-all">
                    <Package size={22}/>
                  </div>
                  <div className="truncate">
                    <p className="text-white font-bold text-sm uppercase tracking-tight truncate">{p.name}</p>
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-1">{p.category} • {p.stock} Unit Left</p>
                  </div>
                </div>
                <div className="flex items-center gap-8 pl-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-black text-emerald-500 italic tracking-tighter">Rp{Number(p.price).toLocaleString()}</p>
                    <p className="text-[10px] text-slate-700 font-bold uppercase tracking-widest">Modal: {Number(p.cost).toLocaleString()}</p>
                  </div>
                  <button onClick={() => del(p.id)} className="p-4 text-slate-800 hover:text-rose-500 hover:bg-rose-500/5 rounded-2xl transition-all"><Trash2 size={20}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}