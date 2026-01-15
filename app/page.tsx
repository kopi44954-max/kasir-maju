"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Trash2, Package } from 'lucide-react';

export default function Settings() {
  const [products, setProducts] = useState<any[]>([]);
  const [formData, setFormData] = useState({ id: null, name: '', price: '', cost: '', stock: '', category: 'UMUM' });

  const fetchData = async () => {
    const res = await fetch('/api/pos');
    const data = await res.json();
    setProducts(data.products || []);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    await fetch('/api/pos', {
      method: 'POST',
      body: JSON.stringify({ type: formData.id ? 'UPDATE_PRODUCT' : 'ADD_PRODUCT', data: formData })
    });
    setFormData({ id: null, name: '', price: '', cost: '', stock: '', category: 'UMUM' });
    fetchData();
  };

  return (
    <div className="min-h-screen bg-[#0A0C10] text-slate-400 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <Link href="/" className="p-3 bg-white/5 rounded-xl hover:text-white"><ArrowLeft size={20}/></Link>
          <h1 className="text-xl font-black text-white italic tracking-widest uppercase">Inventory <span className="text-emerald-500">System</span></h1>
        </div>

        <div className="bg-[#0F1218] border border-white/5 p-8 rounded-3xl mb-8">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <input placeholder="NAMA PRODUK" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-black/40 border border-white/5 p-4 rounded-xl outline-none focus:border-emerald-500/50 text-white font-bold" />
            <input placeholder="KATEGORI" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="bg-black/40 border border-white/5 p-4 rounded-xl outline-none" />
            <input placeholder="HARGA JUAL" type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="bg-black/40 border border-white/5 p-4 rounded-xl outline-none text-emerald-500 font-bold" />
            <input placeholder="HARGA MODAL (LABA)" type="number" value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} className="bg-black/40 border border-white/5 p-4 rounded-xl outline-none text-blue-400 font-bold" />
            <input placeholder="STOK" type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="bg-black/40 border border-white/5 p-4 rounded-xl outline-none col-span-2" />
          </div>
          <button onClick={handleSave} className="w-full py-4 bg-emerald-600 text-white font-black rounded-xl uppercase tracking-widest text-xs shadow-lg shadow-emerald-900/20">Simpan Data</button>
        </div>

        <div className="space-y-3">
          {products.map(p => (
            <div key={p.id} className="bg-[#0F1218] border border-white/5 p-5 rounded-2xl flex justify-between items-center group">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/5 rounded-xl group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-all"><Package size={20}/></div>
                <div>
                  <p className="text-xs font-black text-white uppercase tracking-tight">{p.name}</p>
                  <p className="text-[10px] font-bold text-slate-600">JUAL: {Number(p.price).toLocaleString()} | MODAL: {Number(p.cost || 0).toLocaleString()} | STOK: {p.stock}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setFormData(p)} className="text-[10px] font-black uppercase text-slate-500 hover:text-white">Edit</button>
                <button onClick={async () => { if(confirm('Hapus?')) { await fetch('/api/pos', { method: 'POST', body: JSON.stringify({ type: 'DELETE_PRODUCT', id: p.id }) }); fetchData(); } }} className="text-slate-800 hover:text-rose-500"><Trash2 size={18}/></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}