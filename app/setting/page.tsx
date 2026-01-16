"use client";
import React, { useState, useEffect } from 'react';
import { Edit3, Trash2, Home, Receipt, Settings, Plus } from 'lucide-react';

export default function SettingGlass() {
  const [products, setProducts] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', cost: '', price: '', stock: '' });

  const fetchData = async () => {
    const res = await fetch(`/api/pos?t=${Date.now()}`, { cache: 'no-store' });
    const data = await res.json();
    setProducts(data.products || []);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const productData = {
      ...form,
      cost: Number(form.cost),
      price: Number(form.price),
      stock: Number(form.stock),
      id: editing ? editing.id : Date.now()
    };

    await fetch('/api/pos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: editing ? 'UPDATE_PRODUCT' : 'ADD_PRODUCT', data: productData })
    });
    setEditing(null); setForm({ name: '', cost: '', price: '', stock: '' }); fetchData();
  };

  const deleteProduct = async (id: any) => {
    if (!confirm("Hapus produk ini?")) return;
    await fetch('/api/pos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'DELETE_PRODUCT', id }) });
    fetchData();
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col md:flex-row font-sans overflow-hidden">
      <aside className="hidden md:flex w-20 bg-white border-r border-slate-200 flex-col items-center py-8 gap-6 h-full">
        <button onClick={() => window.location.href='/'} className="p-3 text-slate-400 hover:text-[#00AA5B] transition-all"><Home size={22}/></button>
        <button onClick={() => window.location.href='/history'} className="p-3 text-slate-400 hover:text-[#00AA5B] transition-all"><Receipt size={22}/></button>
        <button onClick={() => window.location.href='/setting'} className="p-3 text-blue-600 bg-blue-50 rounded-xl"><Settings size={22}/></button>
      </aside>

      <div className="flex-1 overflow-y-auto p-4 md:p-10 pb-24 md:pb-10">
        <div className="max-w-4xl mx-auto space-y-6">
          <header><h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Manajemen Stok</h1><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Update harga & barang</p></header>

          <form onSubmit={handleSave} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 mb-2"><div className="p-2 bg-blue-500 rounded-lg text-white shadow-lg"><Plus size={16}/></div><h2 className="font-black text-xs text-slate-700 uppercase tracking-widest">{editing ? 'Edit Barang' : 'Baru'}</h2></div>
            <input required placeholder="NAMA BARANG" value={form.name} onChange={e => setForm({ ...form, name: e.target.value.toUpperCase() })} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-400 transition-all" />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className="text-[9px] font-black text-slate-400 ml-2 uppercase">Modal</label><input required type="number" value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none" /></div>
              <div className="space-y-1"><label className="text-[9px] font-black text-blue-400 ml-2 uppercase">Jual</label><input required type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="w-full p-4 bg-blue-50 text-blue-600 font-black border border-blue-100 rounded-2xl outline-none" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3 items-end">
              <div className="space-y-1"><label className="text-[9px] font-black text-slate-400 ml-2 uppercase">Stok</label><input required type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none" /></div>
              <button className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all">Simpan Produk</button>
            </div>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {products.map(p => (
              <div key={p.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center group hover:border-blue-200 transition-all">
                <div><p className="font-black text-xs uppercase text-slate-700 leading-tight">{p.name}</p><div className="flex gap-3 mt-1"><span className="text-[10px] text-slate-400 font-bold uppercase">Stok: {p.stock}</span><span className="text-[10px] text-blue-600 font-black">Rp{Number(p.price).toLocaleString()}</span></div></div>
                <div className="flex gap-1"><button onClick={() => {setEditing(p); setForm({name:p.name, cost:p.cost, price:p.price, stock:p.stock})}} className="p-3 text-blue-500 hover:bg-blue-50 rounded-xl transition-all"><Edit3 size={16}/></button><button onClick={() => deleteProduct(p.id)} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={16}/></button></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}