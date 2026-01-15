"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit3, Trash2, X, Loader2, Search, Package } from 'lucide-react';

export default function SettingsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    category: 'UMUM',
    price: '',
    costPrice: '',
    stock: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/pos', { cache: 'no-store' });
      const data = await res.json();
      setProducts(data.products || []);
      setCategories(data.categories || ["UMUM", "DAHAREUN", "INUMAN"]);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleOpenModal = (product: any = null) => {
    if (product) {
      setFormData({ ...product });
    } else {
      setFormData({ id: null, name: '', category: 'UMUM', price: '', costPrice: '', stock: '' });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const type = formData.id ? 'UPDATE_PRODUCT' : 'ADD_PRODUCT';
    const res = await fetch('/api/pos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, data: formData })
    });
    if (res.ok) { setModalOpen(false); fetchData(); }
  };

  const deleteProduct = async (id: number) => {
    if (!confirm("Yakin hoyong dihapus?")) return;
    await fetch('/api/pos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'DELETE_PRODUCT', id })
    });
    fetchData();
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-300 font-sans pb-24">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        
        {/* HEADER RESPONSIVE */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2.5 bg-white/5 rounded-xl hover:text-emerald-500 transition-all border border-white/10">
              <ArrowLeft size={18}/>
            </Link>
            <h1 className="text-lg font-black text-white uppercase italic tracking-tighter">Inventaris <span className="text-emerald-500">Produk</span></h1>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <Plus size={16} /> Tambah Barang
          </button>
        </header>

        {/* SEARCH BAR */}
        <div className="mb-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input 
            type="text" 
            placeholder="Cari nami barang..." 
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 outline-none focus:border-emerald-500 text-sm"
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-emerald-500" size={32} /></div>
        ) : (
          <>
            {/* TAMPILAN KHUSUS HP (CARD MODE) */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {filtered.map(p => (
                <div key={p.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[8px] font-bold text-slate-500 uppercase">{p.category}</p>
                      <h3 className="text-white font-bold uppercase text-sm">{p.name}</h3>
                    </div>
                    <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-mono px-2 py-1 rounded-md border border-emerald-500/20">Stok: {p.stock}</span>
                  </div>
                  <div className="flex justify-between items-end border-t border-white/5 pt-3">
                    <div>
                      <p className="text-[8px] text-slate-500 uppercase">Harga Jual</p>
                      <p className="text-emerald-400 font-black">Rp {Number(p.price).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleOpenModal(p)} className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20 active:scale-90"><Edit3 size={18}/></button>
                      <button onClick={() => deleteProduct(p.id)} className="p-3 bg-rose-500/10 text-rose-500 rounded-xl border border-rose-500/20 active:scale-90"><Trash2 size={18}/></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* TAMPILAN KHUSUS LAPTOP (TABLE MODE) */}
            <div className="hidden md:block bg-white/5 rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 text-slate-500 font-bold uppercase">
                  <tr>
                    <th className="px-8 py-5">Produk</th>
                    <th className="px-4 py-5">Kategori</th>
                    <th className="px-4 py-5">Harga Jual</th>
                    <th className="px-4 py-5">Stok</th>
                    <th className="px-8 py-5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-all">
                      <td className="px-8 py-5 font-bold text-white uppercase">{p.name}</td>
                      <td className="px-4 py-5"><span className="bg-white/5 px-3 py-1 rounded-full text-[10px] uppercase">{p.category}</span></td>
                      <td className="px-4 py-5 font-black text-emerald-400 italic">Rp {Number(p.price).toLocaleString()}</td>
                      <td className="px-4 py-5 font-mono text-white">{p.stock}</td>
                      <td className="px-8 py-5">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleOpenModal(p)} className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg"><Edit3 size={16}/></button>
                          <button onClick={() => deleteProduct(p.id)} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg"><Trash2 size={16}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* MODAL FORM RESPONSIVE */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex items-end md:items-center justify-center p-0 md:p-6 backdrop-blur-sm">
          <div className="bg-[#0A0F1C] border-t md:border border-white/10 w-full max-w-md rounded-t-[2.5rem] md:rounded-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-white font-black uppercase italic tracking-tighter">{formData.id ? 'Edit Barang' : 'Tambah Barang'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-2 bg-white/5 rounded-full text-slate-500"><X size={20}/></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 tracking-widest">Nami Barang</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-emerald-500 text-white font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Kategori</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-emerald-500 text-white">
                    {categories.map(cat => <option key={cat} value={cat} className="bg-[#0A0F1C]">{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Stok</label>
                  <input required type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-emerald-500 text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Harga Modal</label>
                  <input required type="number" value={formData.costPrice} onChange={e => setFormData({...formData, costPrice: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-emerald-500 text-rose-400 font-bold" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Harga Jual</label>
                  <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-emerald-500 text-emerald-400 font-black" />
                </div>
              </div>
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] mt-6 shadow-xl shadow-emerald-600/20 active:scale-95 transition-all">Simpen Barang</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}