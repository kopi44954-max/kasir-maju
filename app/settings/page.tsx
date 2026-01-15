"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Trash2, Package, Search, Edit3, PlusCircle, Loader2 } from 'lucide-react';

// Paksa agar Vercel tidak melakukan caching pada halaman ini
export const dynamic = 'force-dynamic';

export default function ManajemenInventaris() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<any>({ name: '', price: '', cost: '', stock: '', category: 'UMUM' });
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(true);

  // Navigasi paksa ke halaman utama menggunakan window.location agar tidak nyangkut di cache
  const goHome = () => {
    window.location.assign('/');
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/pos', { cache: 'no-store' });
      const data = await res.json();
      setProducts(data.products || []);
    } catch (e) {
      console.error(e);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const type = isEdit ? 'UPDATE_PRODUCT' : 'ADD_PRODUCT';
    try {
      const res = await fetch('/api/pos', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data: isEdit ? form : { ...form, id: Date.now() } }) 
      });
      if (res.ok) {
        setForm({ name: '', price: '', cost: '', stock: '', category: 'UMUM' });
        setIsEdit(false);
        loadData();
      }
    } catch (e) { 
      alert("Gagal menyimpan data!"); 
    }
  };

  const del = async (id: number) => { 
    if(confirm("Hapus produk ini secara permanen?")){ 
      await fetch('/api/pos', { 
        method:'POST', 
        headers: { 'Content-Type': 'application/json' },
        body:JSON.stringify({type:'DELETE_PRODUCT', id}) 
      }); 
      loadData();
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F3F7] pb-10">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-[999] shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            onClick={goHome} 
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold text-xs transition-all active:scale-95"
          >
            <ArrowLeft size={20}/>
            KEMBALI KE KASIR
          </button>
          <div className="text-[10px] font-black text-[#00AA5B] bg-green-50 px-3 py-1 rounded uppercase">
            Toko Rahma Inventaris
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* FORM INPUT */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm sticky top-24">
            <h2 className="text-[10px] font-black uppercase mb-6 text-gray-400 tracking-widest flex items-center gap-2">
              {isEdit ? <Edit3 size={14} className="text-orange-500"/> : <PlusCircle size={14} className="text-[#00AA5B]"/>}
              {isEdit ? "Edit Data Barang" : "Tambah Barang Baru"}
            </h2>
            <form onSubmit={save} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-400 uppercase">Nama Produk</label>
                <input required value={form.name} onChange={e=>setForm({...form, name:e.target.value.toUpperCase()})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-bold uppercase outline-none focus:border-[#00AA5B]"/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase">Kategori</label>
                  <input required value={form.category} onChange={e=>setForm({...form, category:e.target.value.toUpperCase()})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-bold uppercase outline-none focus:border-[#00AA5B]"/>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase">Stok</label>
                  <input required type="number" value={form.stock} onChange={e=>setForm({...form, stock:e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-bold outline-none focus:border-[#00AA5B]"/>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-[#00AA5B] uppercase">Harga Jual (Rp)</label>
                <input required type="number" value={form.price} onChange={e=>setForm({...form, price:e.target.value})} className="w-full bg-green-50 border-green-100 rounded-xl p-3 text-sm font-black text-[#00AA5B] outline-none"/>
              </div>
              <div className="pt-2 flex gap-2">
                {isEdit && (
                  <button type="button" onClick={() => {setIsEdit(false); setForm({name:'', price:'', cost:'', stock:'', category:'UMUM'})}} className="flex-1 py-3 bg-gray-100 text-gray-500 rounded-xl font-bold text-[10px] uppercase">Batal</button>
                )}
                <button className={`flex-[2] py-4 rounded-xl font-black text-[10px] uppercase tracking-widest text-white shadow-lg transition-transform active:scale-95 ${isEdit ? 'bg-orange-500 shadow-orange-100' : 'bg-[#00AA5B] shadow-green-100'}`}>
                  {isEdit ? "Update" : "Simpan Produk"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* TABEL LIST */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#00AA5B]" size={20}/>
            <input onChange={e=>setSearch(e.target.value)} placeholder="Cari nama barang atau kategori..." className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold outline-none shadow-sm focus:border-[#00AA5B] transition-all"/>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">
                  <tr>
                    <th className="px-6 py-4">Barang</th>
                    <th className="px-6 py-4 text-right">Harga</th>
                    <th className="px-6 py-4 text-center">Stok</th>
                    <th className="px-6 py-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 uppercase font-bold text-gray-600">
                  {loading ? (
                    <tr><td colSpan={4} className="text-center py-20"><Loader2 className="animate-spin mx-auto text-[#00AA5B]"/></td></tr>
                  ) : products.filter(p=>p.name.toLowerCase().includes(search.toLowerCase())).length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-20 text-[10px] text-gray-400">Data Tidak Ditemukan</td></tr>
                  ) : products.filter(p=>p.name.toLowerCase().includes(search.toLowerCase())).map(p=>(
                    <tr key={p.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded flex items-center justify-center ${p.stock < 10 ? 'bg-red-50 text-red-400' : 'bg-gray-100 text-gray-300'}`}><Package size={16}/></div>
                          <div>
                            <p className="text-xs text-gray-800 leading-none">{p.name}</p>
                            <span className="text-[9px] text-[#00AA5B]">{p.category}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-black text-gray-800">Rp{Number(p.price).toLocaleString()}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded text-[10px] ${p.stock < 10 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-[#00AA5B]'}`}>{p.stock}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-1">
                          <button onClick={()=>{setForm(p); setIsEdit(true); window.scrollTo({top:0, behavior:'smooth'})}} className="p-2 text-gray-300 hover:text-orange-500 transition-colors"><Edit3 size={18}/></button>
                          <button onClick={()=>del(p.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}