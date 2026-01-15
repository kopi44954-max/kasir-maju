"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trash2, Package, PlusCircle, Search, Edit3 } from 'lucide-react';

export default function NexusSettings() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<any>({ name: '', price: '', cost: '', stock: '', category: 'UMUM' });
  const [isEdit, setIsEdit] = useState(false);

  const load = async () => {
    const res = await fetch('/api/pos');
    const data = await res.json();
    setProducts(data.products || []);
  };

  useEffect(() => { load(); }, []);

  const save = async (e: any) => {
    e.preventDefault();
    const type = isEdit ? 'UPDATE_PRODUCT' : 'ADD_PRODUCT';
    await fetch('/api/pos', { method: 'POST', body: JSON.stringify({ type, data: form }) });
    setForm({ name: '', price: '', cost: '', stock: '', category: 'UMUM' });
    setIsEdit(false);
    load();
  };

  const del = async (id: any) => { if(confirm("Hapus produk?")){ await fetch('/api/pos', { method:'POST', body:JSON.stringify({type:'DELETE_PRODUCT', id}) }); load(); }};
  const delAll = async () => { if(confirm("Hapus SEMUA produk?")){ await fetch('/api/pos', { method:'POST', body:JSON.stringify({type:'DELETE_ALL_PRODUCTS'}) }); load(); }};

  return (
    <div className="min-h-screen bg-[#07080A] text-slate-400 p-6 md:p-12 pb-32">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-end mb-12">
          <div><Link href="/" className="text-[10px] font-black uppercase text-slate-600 hover:text-emerald-500 flex items-center gap-2 mb-4"><ArrowLeft size={14}/> Kembali</Link>
          <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">Gudang <span className="text-emerald-500">Barang.</span></h1></div>
          <button onClick={delAll} className="bg-rose-500/10 text-rose-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase border border-rose-500/20">Reset Gudang</button>
        </header>

        <form onSubmit={save} className="bg-[#0F1218] p-8 rounded-[32px] border border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <input placeholder="NAMA BARANG" value={form.name} onChange={e=>setForm({...form, name:e.target.value.toUpperCase()})} className="md:col-span-2 bg-black/30 border border-white/10 rounded-xl p-4 text-white font-bold outline-none focus:border-emerald-500" required />
          <input placeholder="KATEGORI" value={form.category} onChange={e=>setForm({...form, category:e.target.value.toUpperCase()})} className="bg-black/30 border border-white/10 rounded-xl p-4 text-white font-bold outline-none" required />
          <input type="number" placeholder="STOK" value={form.stock} onChange={e=>setForm({...form, stock:e.target.value})} className="bg-black/30 border border-white/10 rounded-xl p-4 text-white font-bold outline-none" required />
          <input type="number" placeholder="MODAL" value={form.cost} onChange={e=>setForm({...form, cost:e.target.value})} className="bg-black/30 border border-rose-500/20 rounded-xl p-4 text-rose-500 font-bold outline-none" required />
          <input type="number" placeholder="HARGA JUAL" value={form.price} onChange={e=>setForm({...form, price:e.target.value})} className="bg-black/30 border border-emerald-500/20 rounded-xl p-4 text-emerald-400 font-bold outline-none" required />
          <button className={`md:col-span-2 py-4 rounded-xl font-black uppercase text-xs text-white ${isEdit?'bg-amber-600':'bg-emerald-600'}`}>{isEdit?'Update Barang':'Tambah Ke Rak'}</button>
        </form>

        <div className="relative mb-8"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18}/><input onChange={e=>setSearch(e.target.value)} placeholder="Cari di gudang..." className="w-full bg-[#0F1218] border border-white/5 rounded-xl pl-12 pr-4 py-4 text-sm outline-none focus:border-emerald-500"/></div>

        <div className="space-y-3">
          {products.filter(p=>p.name.toLowerCase().includes(search.toLowerCase())).map(p=>(
            <div key={p.id} className="bg-[#0F1218] p-4 rounded-2xl border border-white/5 flex justify-between items-center group">
              <div className="flex items-center gap-4"><div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-600 group-hover:text-emerald-500 transition-all"><Package size={20}/></div>
              <div><p className="text-white font-bold text-sm uppercase">{p.name}</p><p className="text-[9px] font-black text-slate-600 uppercase">{p.category} • Stok: {p.stock}</p></div></div>
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block"><p className="text-sm font-black text-emerald-500 italic">Rp{Number(p.price).toLocaleString()}</p><p className="text-[9px] text-slate-700 font-bold uppercase">Modal: {Number(p.cost).toLocaleString()}</p></div>
                <button onClick={()=>{setForm(p); setIsEdit(true); window.scrollTo(0,0)}} className="p-2 text-slate-600 hover:text-emerald-500"><Edit3 size={18}/></button>
                <button onClick={()=>del(p.id)} className="p-2 text-slate-600 hover:text-rose-500"><Trash2 size={18}/></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}