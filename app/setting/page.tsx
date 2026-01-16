"use client";
import React, { useState, useEffect } from 'react';
import { Edit3, Trash2, Home, Receipt, Settings, Package, Plus } from 'lucide-react';

export default function SettingGlass() {
  const [products, setProducts] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', cost: '', price: '', stock: '' });

  useEffect(() => { fetchData(); }, []);
  const fetchData = async () => {
    const res = await fetch('/api/pos');
    const data = await res.json();
    setProducts(data.products || []);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/pos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: editing ? 'UPDATE_PRODUCT' : 'ADD_PRODUCT', data: editing ? { ...editing, ...form } : { ...form, id: Date.now() } })
    });
    setEditing(null); setForm({ name: '', cost: '', price: '', stock: '' }); fetchData();
  };

  // FUNGSI HAPUS PRODUK
  const deleteProduct = async (id: any) => {
    if (!confirm("Hapus produk ini dari database?")) return;
    await fetch('/api/pos', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ type: 'DELETE_PRODUCT', id }) 
    });
    fetchData();
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-50 via-white to-slate-100 flex flex-col md:flex-row font-sans pb-24 md:pb-0">
      
      {/* SIDEBAR (Desktop) */}
      <aside className="hidden md:flex w-20 bg-white/40 backdrop-blur-xl border-r border-white/60 flex-col items-center py-8 gap-6 h-screen sticky top-0 z-20 text-gray-400">
        <button onClick={() => window.location.href='/'} className="p-3 hover:text-green-500"><Home size={22}/></button>
        <button onClick={() => window.location.href='/history'} className="p-3 hover:text-orange-500"><Receipt size={22}/></button>
        <button onClick={() => window.location.href='/setting'} className="p-3 text-blue-600 bg-white shadow-sm rounded-xl border border-white"><Settings size={22}/></button>
      </aside>

      {/* BOTTOM NAV (Mobile) */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 bg-white/60 backdrop-blur-2xl border border-white h-16 rounded-2xl flex items-center justify-around z-50 shadow-2xl">
        <button onClick={() => window.location.href='/'} className="p-3 text-gray-400"><Home size={24}/></button>
        <button onClick={() => window.location.href='/history'} className="p-3 text-gray-400"><Receipt size={24}/></button>
        <button onClick={() => window.location.href='/setting'} className="p-3 text-blue-600 bg-blue-100/50 rounded-xl"><Settings size={24}/></button>
      </nav>

      <div className="flex-1 max-w-6xl mx-auto p-4 md:p-10 flex flex-col gap-6 w-full">
        <header>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Manajemen Stok</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Update harga & barang</p>
        </header>

        <form onSubmit={handleSave} className="bg-white/40 backdrop-blur-md p-6 rounded-3xl border border-white shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-blue-500 rounded-lg text-white shadow-lg shadow-blue-100"><Plus size={16}/></div>
            <h2 className="font-black text-xs text-slate-700 uppercase tracking-widest">{editing ? 'Edit Barang' : 'Baru'}</h2>
          </div>
          <input required placeholder="NAMA BARANG" value={form.name} onChange={e => setForm({ ...form, name: e.target.value.toUpperCase() })} className="w-full p-4 bg-white/60 border border-white rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-400 shadow-sm" />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 ml-2">MODAL</label>
              <input required type="number" value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} className="w-full p-4 bg-white/60 border border-white rounded-2xl outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-blue-400 ml-2">JUAL</label>
              <input required type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="w-full p-4 bg-blue-50 text-blue-600 font-black border border-blue-100 rounded-2xl outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 items-end">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 ml-2">STOK</label>
              <input required type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} className="w-full p-4 bg-white/60 border border-white rounded-2xl outline-none" />
            </div>
            <button className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-100 transition-all active:scale-95">Simpan</button>
          </div>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {products.map(p => (
            <div key={p.id} className="bg-white/40 backdrop-blur-md p-4 rounded-2xl border border-white shadow-sm flex justify-between items-center group">
              <div>
                <p className="font-black text-xs uppercase text-slate-700 leading-tight">{p.name}</p>
                <div className="flex gap-3 mt-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Stok: {p.stock}</span>
                  <span className="text-[10px] text-blue-600 font-black">Rp{Number(p.price).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => {setEditing(p); setForm({name:p.name, cost:p.cost, price:p.price, stock:p.stock})}} className="p-3 text-blue-500 bg-white/60 rounded-xl border border-white transition-all active:scale-90 shadow-sm"><Edit3 size={16}/></button>
                <button onClick={() => deleteProduct(p.id)} className="p-3 text-red-500 bg-white/60 rounded-xl border border-white transition-all active:scale-90 shadow-sm"><Trash2 size={16}/></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}