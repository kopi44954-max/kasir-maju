"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Trash2, Plus, Package } from 'lucide-react';

export default function SettingsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ 
    id: null, name: '', price: '', cost: '', stock: '', category: 'UMUM' 
  });

  const fetchData = async () => {
    const res = await fetch('/api/pos');
    const data = await res.json();
    setProducts(data.products || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    const type = formData.id ? 'UPDATE_PRODUCT' : 'ADD_PRODUCT';
    await fetch('/api/pos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, data: formData })
    });
    setFormData({ id: null, name: '', price: '', cost: '', stock: '', category: 'UMUM' });
    fetchData();
  };

  return (
    <div className="min-h-screen bg-[#0A0C10] text-slate-300 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-10">
          <Link href="/" className="flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest">
            <ArrowLeft size={16}/> KEMBALI
          </Link>
          <h1 className="text-xl font-black italic text-white uppercase tracking-tighter">Inventory <span className="text-blue-500">Settings</span></h1>
        </header>

        {/* FORM INPUT BARANG */}
        <div className="bg-[#0F1218] border border-white/5 p-8 rounded-3xl mb-10 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Nama Barang</label>
              <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#0A0C10] border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500/50" placeholder="Contoh: Kopi Susu" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Kategori</label>
              <input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-[#0A0C10] border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500/50" placeholder="UMUM / MAKANAN" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-emerald-500 uppercase ml-1">Harga Jual (Price)</label>
              <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-[#0A0C10] border border-emerald-500/20 p-4 rounded-2xl outline-none focus:border-emerald-500/50 text-emerald-500 font-bold" placeholder="0" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-blue-400 uppercase ml-1">Harga Modal (Cost) - UNTUK LABA</label>
              <input type="number" value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} className="w-full bg-[#0A0C10] border border-blue-500/20 p-4 rounded-2xl outline-none focus:border-blue-500/50 text-blue-400 font-bold" placeholder="0" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Stok Awal</label>
              <input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="w-full bg-[#0A0C10] border border-white/10 p-4 rounded-2xl outline-none focus:border-white/20" placeholder="0" />
            </div>
          </div>
          <button onClick={handleSave} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-3 uppercase text-xs tracking-widest shadow-lg shadow-blue-900/20">
            <Save size={18}/> Simpan Produk
          </button>
        </div>

        {/* DAFTAR BARANG */}
        <div className="grid gap-3">
          {products.map(p => (
            <div key={p.id} className="bg-[#0F1218] border border-white/5 p-5 rounded-2xl flex justify-between items-center group hover:border-white/20 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-500 group-hover:bg-blue-500/10 group-hover:text-blue-500">
                  <Package size={20}/>
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm uppercase">{p.name}</h3>
                  <div className="flex gap-3 text-[10px] font-bold text-slate-500">
                    <span>JUAL: Rp{Number(p.price).toLocaleString()}</span>
                    <span className="text-blue-400">MODAL: Rp{Number(p.cost || 0).toLocaleString()}</span>
                    <span>STOK: {p.stock}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setFormData(p)} className="p-2 text-slate-500 hover:text-white uppercase text-[10px] font-black">Edit</button>
                <button onClick={async () => { if(confirm('Hapus?')) { await fetch('/api/pos', { method: 'POST', body: JSON.stringify({ type: 'DELETE_PRODUCT', id: p.id }) }); fetchData(); } }} className="p-2 text-slate-700 hover:text-rose-500"><Trash2 size={16}/></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}