"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Save, Trash2, Package, Search, 
  Plus, Edit3, Archive, Layers, DollarSign 
} from 'lucide-react';

export default function InventorySettings() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return alert("Nama dan Harga wajib diisi!");
    
    const type = formData.id ? 'UPDATE_PRODUCT' : 'ADD_PRODUCT';
    await fetch('/api/pos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, data: formData })
    });
    setFormData({ id: null, name: '', price: '', cost: '', stock: '', category: 'UMUM' });
    fetchData();
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#07080A] text-slate-400 font-sans pb-20">
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
          
          {/* LEFT: FORM INPUT (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#111318] border border-white/5 rounded-3xl p-8 sticky top-12">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                  {formData.id ? <Edit3 size={20}/> : <Plus size={20}/>}
                </div>
                <h2 className="text-sm font-black uppercase tracking-widest text-white">
                  {formData.id ? 'Edit Produk' : 'Tambah Produk'}
                </h2>
              </div>

              <form onSubmit={handleSave} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-600 ml-1">Nama Barang</label>
                  <input 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-black/40 border border-white/5 p-4 rounded-xl outline-none focus:border-emerald-500/50 text-white text-sm transition-all" 
                    placeholder="Input nama produk..." 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-600 ml-1">Kategori</label>
                    <input 
                      value={formData.category} 
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-black/40 border border-white/5 p-4 rounded-xl outline-none focus:border-emerald-500/50 text-white text-sm" 
                      placeholder="UMUM" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-600 ml-1">Stok</label>
                    <input 
                      type="number"
                      value={formData.stock} 
                      onChange={e => setFormData({...formData, stock: e.target.value})}
                      className="w-full bg-black/40 border border-white/5 p-4 rounded-xl outline-none focus:border-emerald-500/50 text-white text-sm font-mono" 
                      placeholder="0" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-emerald-500 ml-1">Harga Jual (Price)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 text-xs font-bold">Rp</span>
                    <input 
                      type="number"
                      value={formData.price} 
                      onChange={e => setFormData({...formData, price: e.target.value})}
                      className="w-full bg-black/40 border border-emerald-500/10 p-4 pl-10 rounded-xl outline-none focus:border-emerald-500/50 text-emerald-500 font-bold" 
                      placeholder="0" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-blue-400 ml-1">Harga Modal (Cost)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 text-xs font-bold">Rp</span>
                    <input 
                      type="number"
                      value={formData.cost} 
                      onChange={e => setFormData({...formData, cost: e.target.value})}
                      className="w-full bg-black/40 border border-blue-400/10 p-4 pl-10 rounded-xl outline-none focus:border-blue-400/50 text-blue-400 font-bold" 
                      placeholder="0" 
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-2">
                  {formData.id && (
                    <button 
                      type="button"
                      onClick={() => setFormData({ id: null, name: '', price: '', cost: '', stock: '', category: 'UMUM' })}
                      className="flex-1 py-4 bg-white/5 text-slate-500 rounded-xl font-bold text-[10px] uppercase hover:bg-white/10 transition-all"
                    >
                      Batal
                    </button>
                  )}
                  <button 
                    type="submit"
                    className="flex-[2] py-4 bg-emerald-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-emerald-900/20 active:scale-95 transition-all"
                  >
                    {formData.id ? 'Update Produk' : 'Simpan Produk'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* RIGHT: PRODUCT LIST (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* SEARCH BAR */}
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Cari berdasarkan nama atau kategori..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-[#111318] border border-white/5 p-6 pl-16 rounded-[2rem] outline-none focus:border-emerald-500/30 text-white transition-all shadow-2xl"
              />
            </div>

            <div className="bg-[#111318] border border-white/5 rounded-3xl overflow-hidden">
              <div className="p-6 border-b border-white/5 bg-white/[0.01] flex justify-between items-center px-8">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Data Inventory</span>
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">{filteredProducts.length} Items</span>
              </div>

              <div className="divide-y divide-white/5">
                {loading ? (
                  <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-emerald-500" /></div>
                ) : filteredProducts.length === 0 ? (
                  <div className="py-20 text-center text-slate-600 text-xs font-bold uppercase tracking-widest">Barang tidak ditemukan</div>
                ) : (
                  filteredProducts.map((p) => (
                    <div key={p.id} className="group hover:bg-white/[0.01] transition-all p-6 px-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-black/40 rounded-2xl flex items-center justify-center text-slate-600 group-hover:text-emerald-500 border border-white/5 group-hover:border-emerald-500/30 transition-all shadow-inner">
                          <Package size={20} />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-sm font-bold text-white uppercase tracking-tight">{p.name}</h3>
                          <div className="flex flex-wrap gap-3">
                            <span className="text-[9px] font-black text-emerald-500 bg-emerald-500/5 px-2 py-0.5 rounded-md uppercase">{p.category}</span>
                            <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter flex items-center gap-1"><Layers size={10}/> Stok: {p.stock}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-12">
                        <div className="text-left md:text-right">
                          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Price / Cost</p>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-white italic">Rp{Number(p.price).toLocaleString()}</span>
                            <span className="text-xs font-bold text-blue-400/60">Rp{Number(p.cost || 0).toLocaleString()}</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              setFormData(p);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="p-3 bg-white/5 text-slate-500 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                          >
                            <Edit3 size={16}/>
                          </button>
                          <button 
                            onClick={async () => {
                              if(confirm(`Hapus ${p.name}?`)) {
                                await fetch('/api/pos', { method: 'POST', body: JSON.stringify({ type: 'DELETE_PRODUCT', id: p.id }) });
                                fetchData();
                              }
                            }}
                            className="p-3 bg-white/5 text-slate-500 hover:text-rose-500 hover:bg-rose-500/5 rounded-xl transition-all"
                          >
                            <Trash2 size={16}/>
                          </button>
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