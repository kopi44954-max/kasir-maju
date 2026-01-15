"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Trash2, Package, Search, 
  Plus, Edit3, Layers, Loader2, X, AlertCircle
} from 'lucide-react';

export default function InventorySettings() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ 
    id: null, name: '', price: '', cost: '', stock: '', category: 'UMUM' 
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/pos');
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleEdit = (p: any) => {
    setFormData(p);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const type = formData.id ? 'UPDATE_PRODUCT' : 'ADD_PRODUCT';
    await fetch('/api/pos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, data: formData })
    });
    resetForm();
    fetchData();
  };

  const resetForm = () => {
    setFormData({ id: null, name: '', price: '', cost: '', stock: '', category: 'UMUM' });
    setIsEditing(false);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#07080A] text-slate-400 font-sans pb-20 selection:bg-emerald-500/30">
      <div className="max-w-6xl mx-auto p-6 md:p-12">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-emerald-500 transition-colors group">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform"/> Kembali ke Kasir
            </Link>
            <h1 className="text-4xl font-light text-white tracking-tighter">
              Manage <span className="font-black text-emerald-500">Inventory.</span>
            </h1>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* FORM SECTION - DENGAN HIGHLIGHT SAAT EDIT */}
          <div className="lg:col-span-4">
            <div className={`transition-all duration-500 p-8 rounded-3xl border ${isEditing ? 'bg-emerald-500/5 border-emerald-500/50 shadow-[0_0_50px_rgba(16,185,129,0.1)]' : 'bg-[#111318] border-white/5 shadow-2xl'} sticky top-12`}>
              
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isEditing ? 'bg-emerald-500 text-white' : 'bg-white/5 text-slate-400'}`}>
                    {isEditing ? <Edit3 size={18}/> : <Plus size={18}/>}
                  </div>
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white">
                    {isEditing ? 'Mode Edit Produk' : 'Tambah Produk Baru'}
                  </h2>
                </div>
                {isEditing && (
                  <button onClick={resetForm} className="text-slate-500 hover:text-white transition-colors">
                    <X size={18}/>
                  </button>
                )}
              </div>

              <form onSubmit={handleSave} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-600">Nama Produk</label>
                  <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black/40 border border-white/10 p-4 rounded-xl outline-none focus:border-emerald-500/50 text-white text-sm" placeholder="Nama barang..." required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-600">Kategori</label>
                    <input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-black/40 border border-white/10 p-4 rounded-xl outline-none text-white text-sm" placeholder="UMUM" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-600">Stok</label>
                    <input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="w-full bg-black/40 border border-white/10 p-4 rounded-xl outline-none text-white text-sm font-mono" placeholder="0" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-emerald-500">Harga Jual</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 text-xs font-bold">Rp</span>
                    <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-black/40 border border-emerald-500/20 p-4 pl-10 rounded-xl outline-none focus:border-emerald-500/50 text-emerald-500 font-bold" placeholder="0" required />
                  </div>
                </div>

                {/* HIGHLIGHT HARGA MODAL (PENTING UNTUK LABA) */}
                <div className={`space-y-2 p-4 rounded-2xl border transition-all ${isEditing ? 'bg-blue-500/10 border-blue-500/30 animate-pulse' : 'bg-white/5 border-white/5'}`}>
                  <label className="text-[10px] font-black uppercase text-blue-400 flex items-center gap-2">
                    <AlertCircle size={12}/> Harga Modal (Cost)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 text-xs font-bold">Rp</span>
                    <input type="number" value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} className="w-full bg-black/40 border border-blue-500/10 p-4 pl-10 rounded-xl outline-none focus:border-blue-400/50 text-blue-400 font-bold" placeholder="0" />
                  </div>
                  <p className="text-[9px] text-slate-600 font-medium">Laba dihitung dari selisih Harga Jual & Modal.</p>
                </div>

                <button type="submit" className={`w-full py-4 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 ${isEditing ? 'bg-blue-600 text-white shadow-blue-900/20' : 'bg-emerald-600 text-white shadow-emerald-900/20'}`}>
                  {isEditing ? 'Update & Simpan Perubahan' : 'Tambah Ke Inventori'}
                </button>
              </form>
            </div>
          </div>

          {/* LIST SECTION */}
          <div className="lg:col-span-8 space-y-6">
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500 transition-colors" size={18} />
              <input type="text" placeholder="Cari nama barang atau kategori..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-[#111318] border border-white/5 p-6 pl-16 rounded-3xl outline-none focus:border-emerald-500/30 text-white shadow-2xl transition-all" />
            </div>

            <div className="bg-[#111318] border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
              <div className="p-6 bg-white/5 border-b border-white/5 flex justify-between items-center px-8">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Stok Barang</span>
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">{filteredProducts.length} Produk</span>
              </div>

              <div className="divide-y divide-white/5">
                {loading ? (
                  <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-emerald-500" /></div>
                ) : filteredProducts.length === 0 ? (
                  <div className="py-20 text-center text-slate-700 text-[10px] font-black uppercase tracking-[0.2em]">Inventory Kosong</div>
                ) : (
                  filteredProducts.map((p) => (
                    <div key={p.id} className={`group transition-all p-6 px-8 flex flex-col md:flex-row md:items-center justify-between gap-6 ${formData.id === p.id ? 'bg-emerald-500/10' : 'hover:bg-white/5'}`}>
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-black/40 rounded-2xl flex items-center justify-center text-slate-700 group-hover:text-emerald-500 border border-white/5 transition-all">
                          <Package size={20} />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-sm font-bold text-white uppercase">{p.name}</h3>
                          <div className="flex gap-3">
                            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">{p.category}</span>
                            <span className="text-[9px] font-bold text-slate-600 flex items-center gap-1 uppercase tracking-widest"><Layers size={10}/> {p.stock} pcs</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-10">
                        <div className="text-left md:text-right">
                          <p className="text-sm font-black text-white italic tracking-tighter">Rp{Number(p.price).toLocaleString()}</p>
                          <p className="text-[10px] font-bold text-blue-500/60 tracking-tight">Cost: Rp{Number(p.cost || 0).toLocaleString()}</p>
                        </div>
                        
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(p)} className="p-3 bg-white/5 text-slate-500 hover:text-white hover:bg-emerald-500 rounded-xl transition-all shadow-lg"><Edit3 size={16}/></button>
                          <button onClick={async () => { if(confirm(`Hapus ${p.name}?`)) { await fetch('/api/pos', { method: 'POST', body: JSON.stringify({ type: 'DELETE_PRODUCT', id: p.id }) }); fetchData(); } }} className="p-3 bg-white/5 text-slate-500 hover:text-rose-500 rounded-xl transition-all"><Trash2 size={16}/></button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}