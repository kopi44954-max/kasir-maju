"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trash2, Package, Search, Edit3, PlusCircle, Loader2 } from 'lucide-react';

export default function ManajemenInventaris() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<any>({ name: '', price: '', cost: '', stock: '', category: 'UMUM' });
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fungsi load data dengan pengaman
  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/pos');
      if (!res.ok) throw new Error();
      const text = await res.text();
      const data = text ? JSON.parse(text) : { products: [] };
      setProducts(data.products || []);
    } catch (e) {
      console.error("Gagal load data:", e);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Fungsi Simpan (Tambah & Update)
  const save = async (e: any) => {
    e.preventDefault();
    const type = isEdit ? 'UPDATE_PRODUCT' : 'ADD_PRODUCT';
    try {
      const res = await fetch('/api/pos', { 
        method: 'POST', 
        body: JSON.stringify({ type, data: isEdit ? form : { ...form, id: Date.now() } }) 
      });
      if (res.ok) {
        setForm({ name: '', price: '', cost: '', stock: '', category: 'UMUM' });
        setIsEdit(false);
        load();
      }
    } catch (e) {
      alert("Gagal memproses data");
    }
  };

  // Fungsi Hapus
  const del = async (id: any) => { 
    if(confirm("Hapus produk ini secara permanen?")){ 
      try {
        await fetch('/api/pos', { method:'POST', body:JSON.stringify({type:'DELETE_PRODUCT', id}) }); 
        load();
      } catch (e) {
        alert("Gagal menghapus");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F3F7] pb-24">
      {/* HEADER TETAP BISA DIKLIK UNTUK KEMBALI */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-[100] shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
           <div className="flex items-center gap-4">
             <Link 
               href="/" 
               className="p-2 -ml-2 text-gray-400 hover:text-[#00AA5B] hover:bg-green-50 rounded-full transition-all flex items-center justify-center"
             >
               <ArrowLeft size={24}/>
             </Link>
             <h1 className="text-lg font-bold text-gray-800 uppercase tracking-tight">Manajemen Stok</h1>
           </div>
           <div className="hidden md:block text-[10px] font-bold text-[#00AA5B] bg-green-50 px-3 py-1 rounded-full uppercase">Toko Rahma POS</div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* PANEL FORM */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
            <h2 className="font-bold text-[#212121] mb-6 flex items-center gap-2 uppercase text-xs tracking-widest">
              {isEdit ? <Edit3 className="text-orange-500" size={18}/> : <PlusCircle className="text-[#00AA5B]" size={18}/>}
              {isEdit ? "Edit Produk" : "Tambah Produk"}
            </h2>
            <form onSubmit={save} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Nama Produk</label>
                <input required value={form.name} onChange={e=>setForm({...form, name:e.target.value.toUpperCase()})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:border-[#00AA5B] outline-none font-bold uppercase"/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Kategori</label>
                  <input required value={form.category} onChange={e=>setForm({...form, category:e.target.value.toUpperCase()})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:border-[#00AA5B] outline-none font-bold uppercase"/>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Stok</label>
                  <input required type="number" value={form.stock} onChange={e=>setForm({...form, stock:e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:border-[#00AA5B] outline-none font-bold"/>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Harga Modal</label>
                <input required type="number" value={form.cost} onChange={e=>setForm({...form, cost:e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:border-[#00AA5B] outline-none font-bold"/>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#00AA5B] uppercase">Harga Jual</label>
                <input required type="number" value={form.price} onChange={e=>setForm({...form, price:e.target.value})} className="w-full bg-green-50 border border-[#00AA5B]/20 rounded-xl p-3 text-sm font-black text-[#00AA5B] focus:border-[#00AA5B] outline-none"/>
              </div>
              <div className="pt-2 flex gap-2">
                {isEdit && (
                  <button type="button" onClick={() => {setIsEdit(false); setForm({name:'', price:'', cost:'', stock:'', category:'UMUM'})}} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-xl font-bold text-[10px] uppercase">Batal</button>
                )}
                <button className={`flex-[2] py-4 rounded-xl font-bold text-white text-[10px] tracking-widest uppercase transition-all shadow-lg ${isEdit ? 'bg-orange-500 shadow-orange-100' : 'bg-[#00AA5B] shadow-green-100 hover:bg-[#009650]'}`}>
                  {isEdit ? "Perbarui" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* TABEL INVENTARIS */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#00AA5B]" size={20}/>
            <input onChange={e=>setSearch(e.target.value)} placeholder="Cari barang atau kategori..." className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-6 py-4 text-sm outline-none shadow-sm focus:border-[#00AA5B] transition-all"/>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-400 font-bold text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Nama Produk</th>
                  <th className="px-6 py-4 text-right">Harga Jual</th>
                  <th className="px-6 py-4 text-center">Stok</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-600 font-medium">
                {loading ? (
                  <tr><td colSpan={4} className="text-center py-20"><Loader2 className="animate-spin mx-auto text-[#00AA5B]"/></td></tr>
                ) : products.filter(p=>p.name.toLowerCase().includes(search.toLowerCase())).length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-20 text-xs text-gray-400 uppercase font-bold tracking-widest">Barang tidak ditemukan</td></tr>
                ) : products.filter(p=>p.name.toLowerCase().includes(search.toLowerCase())).map(p=>(
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors uppercase">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${p.stock < 10 ? 'bg-red-50 text-red-400' : 'bg-gray-100 text-gray-300'}`}><Package size={20}/></div>
                        <div>
                          <p className="text-xs font-bold text-gray-800 leading-tight">{p.name}</p>
                          <p className="text-[10px] text-[#00AA5B] font-bold">{p.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-black text-gray-800 tracking-tight">Rp{Number(p.price).toLocaleString()}</td>
                    <td className="px-6 py-4 text-center font-bold">
                       <span className={`px-2 py-1 rounded text-[10px] ${p.stock < 10 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-[#00AA5B]'}`}>{p.stock}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button onClick={()=>{setForm(p); setIsEdit(true); window.scrollTo({top:0, behavior:'smooth'})}} className="p-2 text-gray-400 hover:text-orange-500 transition-colors"><Edit3 size={18}/></button>
                        <button onClick={()=>del(p.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
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
  );
}