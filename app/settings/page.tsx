"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trash2, Package, Search, Plus, Edit3, X, Loader2 } from 'lucide-react';

export default function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ id: null, name: '', price: '', cost: '', stock: '', category: 'UMUM' });

  const loadData = async () => {
    const res = await fetch('/api/pos');
    const data = await res.json();
    setProducts(data.products || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/pos', {
      method: 'POST',
      body: JSON.stringify({ type: form.id ? 'UPDATE_PRODUCT' : 'ADD_PRODUCT', data: form })
    });
    setForm({ id: null, name: '', price: '', cost: '', stock: '', category: 'UMUM' });
    setIsEditing(false);
    loadData();
  };

  const filtered = products.filter((p: any) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#07080A] text-slate-400 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-end mb-12">
          <div className="space-y-4">
            <Link href="/" className="text-xs font-bold uppercase text-slate-500 hover:text-emerald-500 flex items-center gap-2">
              <ArrowLeft size={16}/> Kembali ke Kasir
            </Link>
            <h1 className="text-4xl font-light text-white italic">Manage <span className="font-black text-emerald-500 not-italic">Inventory.</span></h1>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <form onSubmit={saveProduct} className="lg:col-span-4 bg-[#111318] p-8 rounded-4xl border border-white/5 space-y-4 h-fit sticky top-10">
            <h2 className="text-white font-black uppercase text-xs tracking-widest flex items-center gap-2">
              {isEditing ? <Edit3 size={16} className="text-emerald-500"/> : <Plus size={16} className="text-emerald-500"/>}
              {isEditing ? 'Edit Produk' : 'Tambah Produk'}
            </h2>
            <input placeholder="Nama Barang" className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-emerald-500" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            <div className="grid grid-cols-2 gap-2">
              <input type="number" placeholder="Stok" className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-white outline-none" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} />
              <input placeholder="Kategori" className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-white outline-none" value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
            </div>
            <input type="number" placeholder="Harga Jual (Rp)" className="w-full bg-black/40 border border-emerald-500/20 p-4 rounded-xl text-emerald-500 font-bold outline-none focus:border-emerald-500" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
            <input type="number" placeholder="Harga Modal (Rp)" className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-slate-500 outline-none" value={form.cost} onChange={e => setForm({...form, cost: e.target.value})} />
            <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all">Simpan Barang</button>
            {isEditing && <button type="button" onClick={() => {setIsEditing(false); setForm({id:null, name:'', price:'', cost:'', stock:'', category:'UMUM'})}} className="w-full text-[10px] font-bold uppercase text-slate-500">Batal Edit</button>}
          </form>

          <div className="lg:col-span-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
              <input placeholder="Cari di gudang..." className="w-full bg-[#111318] p-5 pl-14 rounded-4xl border border-white/5 text-white outline-none focus:border-emerald-500/30" onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="bg-[#111318] rounded-4xl border border-white/5 divide-y divide-white/5 overflow-hidden">
              {loading ? <Loader2 className="animate-spin mx-auto my-10 text-emerald-500" /> : filtered.map((p: any) => (
                <div key={p.id} className="p-6 flex justify-between items-center group hover:bg-white/[0.02]">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-slate-700 group-hover:text-emerald-500 border border-white/5 transition-all"><Package size={20}/></div>
                    <div>
                      <h3 className="text-white font-bold uppercase text-sm">{p.name}</h3>
                      <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{p.category} • Stok: {p.stock}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-white font-black italic">Rp{Number(p.price).toLocaleString()}</p>
                      <p className="text-[10px] text-slate-600 font-bold">Modal: Rp{Number(p.cost).toLocaleString()}</p>
                    </div>
                    <button onClick={() => {setForm(p); setIsEditing(true);}} className="p-3 bg-white/5 rounded-xl hover:text-emerald-500"><Edit3 size={16}/></button>
                    <button onClick={async () => {if(confirm('Hapus?')){await fetch('/api/pos',{method:'POST', body:JSON.stringify({type:'DELETE_PRODUCT', id:p.id})}); loadData();}}} className="p-3 bg-white/5 rounded-xl hover:text-rose-500"><Trash2 size={16}/></button>
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