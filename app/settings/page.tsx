"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Box } from 'lucide-react';

export default function NexusSettings() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', price: '', cost: '', stock: '' });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      const res = await fetch('/api/pos');
      const data = await res.json();
      setProducts(data.products || []);
    } catch (e) { alert("Gagal memuat data produk"); }
  };

  useEffect(() => { load(); }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/pos', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'ADD_PRODUCT', data: form }) 
      });
      
      const result = await res.json();
      
      if (result.success) {
        alert("BERHASIL: Produk tersimpan di Nexus.");
        setForm({ name: '', price: '', cost: '', stock: '' });
        load();
      } else {
        alert("GAGAL: " + result.error);
      }
    } catch (err) {
      alert("ERROR: Tidak bisa terhubung ke API. Pastikan server jalan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-400 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-indigo-500 flex items-center gap-2 mb-6 font-bold text-xs uppercase"><ArrowLeft size={14}/> Kembali</Link>
        <h1 className="text-3xl font-black text-white mb-10 italic">NEXUS <span className="text-indigo-500 not-italic">INVENTORY</span></h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <form onSubmit={save} className="bg-[#0A0A0A] p-6 rounded-2xl border border-white/5 space-y-4 shadow-2xl">
            <input placeholder="Nama Barang" className="w-full bg-black border border-white/10 p-3 rounded-xl text-white outline-none focus:border-indigo-500" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            <input type="number" placeholder="Harga Jual" className="w-full bg-black border border-white/10 p-3 rounded-xl text-white outline-none focus:border-indigo-500" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
            <input type="number" placeholder="Harga Modal" className="w-full bg-black border border-white/10 p-3 rounded-xl text-white outline-none focus:border-indigo-500" value={form.cost} onChange={e => setForm({...form, cost: e.target.value})} required />
            <input type="number" placeholder="Stok" className="w-full bg-black border border-white/10 p-3 rounded-xl text-white outline-none focus:border-indigo-500" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} required />
            <button disabled={loading} className="w-full bg-indigo-600 p-3 rounded-xl text-white font-black uppercase tracking-widest hover:bg-indigo-500 disabled:bg-slate-800 transition-all">
              {loading ? "Memproses..." : "Simpan Produk"}
            </button>
          </form>

          <div className="bg-[#0A0A0A] rounded-2xl border border-white/5 p-6 h-[400px] overflow-y-auto">
            <h2 className="text-[10px] font-black uppercase text-slate-500 mb-4 tracking-widest">Daftar Produk</h2>
            <div className="space-y-3">
              {products.map((p: any) => (
                <div key={p.id} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                  <p className="text-xs font-bold text-white uppercase">{p.name}</p>
                  <p className="text-xs font-mono text-indigo-400">Rp{Number(p.price).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}