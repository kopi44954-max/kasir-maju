"use client";
import React, { useState, useEffect } from 'react';
import { Edit3, Trash2, Home, Receipt, Settings, Plus, X, Package, Tag, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SettingGlass() {
  const [products, setProducts] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', cost: '', price: '', stock: '' });
  const [isMounted, setIsMounted] = useState(false);

  const fetchData = async () => {
    const res = await fetch(`/api/pos?t=${Date.now()}`, { cache: 'no-store' });
    const data = await res.json();
    setProducts(data.products || []);
  };

  useEffect(() => { setIsMounted(true); fetchData(); }, []);

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

  if (!isMounted) return null;

  return (
    <div className="h-screen bg-slate-50 flex flex-col md:flex-row font-sans overflow-hidden">
      {/* SIDEBAR - CONSISTENT */}
      <aside className="hidden md:flex w-20 bg-white border-r border-slate-200 flex-col items-center py-8 gap-6 h-full">
        <button onClick={() => window.location.href='/'} className="p-3 text-slate-400 hover:text-[#00AA5B] transition-all"><Home size={22}/></button>
        <button onClick={() => window.location.href='/history'} className="p-3 text-slate-400 hover:text-[#00AA5B] transition-all"><Receipt size={22}/></button>
        <button onClick={() => window.location.href='/setting'} className="p-3 text-[#00AA5B] bg-green-50 rounded-xl"><Settings size={22}/></button>
      </aside>

      <div className="flex-1 overflow-y-auto p-4 md:p-10 pb-24 md:pb-10">
        <div className="max-w-4xl mx-auto space-y-8">
          <header className="flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic">Manajemen Stok</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Update harga & inventory barang</p>
            </div>
            {editing && <button onClick={() => {setEditing(null); setForm({name:'',cost:'',price:'',stock:''})}} className="p-2 bg-red-50 text-red-500 rounded-full"><X size={20}/></button>}
          </header>

          <form onSubmit={handleSave} className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-[#00AA5B]"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2 flex items-center gap-1"><Package size={12}/> Nama Produk</label>
                        <input required placeholder="CONTOH: MIE GORENG" value={form.name} onChange={e => setForm({ ...form, name: e.target.value.toUpperCase() })} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-green-400 transition-all uppercase" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2 flex items-center gap-1"><ArrowRight size={12}/> Stok Barang</label>
                        <input required type="number" placeholder="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" />
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2 flex items-center gap-1"><Tag size={12}/> Modal Satuan (Rp)</label>
                        <input required type="number" placeholder="8000" value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-[#00AA5B] uppercase ml-2 flex items-center gap-1"><Tag size={12}/> Harga Jual (Rp)</label>
                        <input required type="number" placeholder="10000" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="w-full p-4 bg-green-50 text-[#00AA5B] border border-green-100 rounded-2xl font-black text-xl outline-none" />
                    </div>
                </div>
            </div>
            <button className="w-full py-4 bg-[#00AA5B] text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-green-500/20 active:scale-95 transition-all">
                {editing ? 'Update Produk Sekarang' : 'Tambah Produk Baru'}
            </button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map(p => (
              <div key={p.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-4 group hover:border-green-300 transition-all relative">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <p className="font-black text-sm uppercase text-slate-800 leading-tight italic">{p.name}</p>
                        <span className="text-[9px] font-bold text-slate-400 uppercase">ID: {p.id}</span>
                    </div>
                    <div className="flex gap-1">
                        <button onClick={() => {setEditing(p); setForm({name:p.name, cost:p.cost, price:p.price, stock:p.stock})}} className="p-2 text-blue-500 bg-blue-50 rounded-lg hover:bg-blue-500 hover:text-white transition-all"><Edit3 size={14}/></button>
                        <button onClick={() => deleteProduct(p.id)} className="p-2 text-red-500 bg-red-50 rounded-lg hover:bg-red-500 hover:text-white transition-all"><Trash2 size={14}/></button>
                    </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 border-t pt-4">
                    <div className="text-center border-r border-slate-100">
                        <p className="text-[8px] font-black text-slate-400 uppercase">Modal</p>
                        <p className="text-[11px] font-bold text-slate-700">Rp{Number(p.cost || 0).toLocaleString()}</p>
                    </div>
                    <div className="text-center border-r border-slate-100">
                        <p className="text-[8px] font-black text-slate-400 uppercase">Stok</p>
                        <p className={`text-[11px] font-black ${p.stock < 10 ? 'text-red-500' : 'text-slate-700'}`}>{p.stock}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[8px] font-black text-[#00AA5B] uppercase">Harga Jual</p>
                        <p className="text-[11px] font-black text-[#00AA5B]">Rp{Number(p.price).toLocaleString()}</p>
                    </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MOBILE NAV - CONSISTENT */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center h-16 z-50">
        <button onClick={() => window.location.href='/'} className="text-slate-400 flex flex-col items-center"><Home size={20}/><span className="text-[10px] font-bold">Home</span></button>
        <button onClick={() => window.location.href='/history'} className="text-slate-400 flex flex-col items-center"><Receipt size={20}/><span className="text-[10px] font-bold">Riwayat</span></button>
        <button onClick={() => window.location.href='/setting'} className="text-[#00AA5B] flex flex-col items-center"><Settings size={20}/><span className="text-[10px] font-bold">Setelan</span></button>
      </nav>
    </div>
  );
}