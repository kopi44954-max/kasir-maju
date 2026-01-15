"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trash2, Package, Search, Edit3, PlusCircle, AlertCircle } from 'lucide-react';

export default function ManajemenInventaris() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<any>({ name: '', price: '', cost: '', stock: '', category: 'UMUM' });
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/pos');
      const text = await res.text();
      const data = text ? JSON.parse(text) : { products: [] };
      setProducts(data.products || []);
    } catch (e) {
      console.error("Gagal memuat data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

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
      alert("Gagal menyimpan produk");
    }
  };

  const del = async (id: any) => { 
    if(confirm("Hapus produk ini secara permanen?")){ 
      await fetch('/api/pos', { method:'POST', body:JSON.stringify({type:'DELETE_PRODUCT', id}) }); 
      load(); 
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F3F7] pb-24">
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
           <div className="flex items-center gap-4">
             <Link href="/" className="text-gray-400 hover:text-[#00AA5B] transition-colors"><ArrowLeft size={24}/></Link>
             <h1 className="text-lg font-bold text-gray-800 uppercase tracking-tight">Manajemen Stok</h1>
           </div>
           <div className="text-[10px] font-bold text-[#00AA5B] bg-green-50 px-3 py-1 rounded-full uppercase">Toko Rahma POS</div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* FORM PANEL */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
            <h2 className="font-bold text-[#212121] mb-6 flex items-center gap-2 uppercase text-xs tracking-widest">
              {isEdit ? <Edit3 className="text-orange-500" size={18}/> : <PlusCircle className="text-[#00AA5B]" size={18}/>}
              {isEdit ? "Mode Edit Produk" : "Tambah Produk Baru"}
            </h2>
            <form onSubmit={save} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Nama Produk</label>
                <input required value={form.name} onChange={e=>setForm({...form, name:e.target.value.toUpperCase()})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:border-[#00AA5B] outline-none transition-all font-bold uppercase"/>
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
                <label className="text-[10px] font-bold text-gray-400 uppercase">Harga Modal (Rp)</label>
                <input required type="number" value={form.cost} onChange={e=>setForm({...form, cost:e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:border-[#00AA5B] outline-none font-bold"/>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#00AA5B] uppercase">Harga Jual (Rp)</label>
                <input required type="number" value={form.price} onChange={e=>setForm({...form, price:e.target.value})} className="w-full bg-green-50 border border-[#00AA5B]/20 rounded-xl p-3 text-sm font-black text-[#00AA5B] focus:border-[#00AA5B] outline-none"/>
              </div>
              <div className="pt-2 flex gap-2">
                {isEdit && (
                  <button type="button" onClick={() => {setIsEdit(false); setForm({name:'', price:'', cost:'', stock:'', category:'UMUM'})}} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-xl font-bold text-[10px] uppercase transition-all">Batal</button>
                )}
                <button className={`flex-[2] py-4 rounded-xl font-bold text-white text-[10px] tracking-widest uppercase transition-all shadow-lg ${isEdit ? 'bg-orange-500 shadow-orange-100' : 'bg-[#00AA5B] shadow-green-100 hover:bg-[#009650]'}`}>
                  {isEdit ? "Perbarui" : "Simpan Produk"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* LIST TABLE */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#00AA5B] transition-colors" size={20}/>
            <input onChange={e=>setSearch(e.target.value)} placeholder="Cari nama produk atau kategori..." className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-6 py-4 text-sm outline-none shadow-sm focus:border-[#00AA5B] transition-all"/>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-400 font-bold text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Produk</th>
                  <th className="px-6 py-4 text-right">Harga Jual</th>
                  <th className="px-6 py-4 text-center">Stok</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-600 font-medium uppercase">
                {loading ? (
                  <tr><td colSpan={4} className="text-center py-20 text-xs text-gray-400">Memproses data...</td></tr>
                ) : products.filter(p=>p.name.toLowerCase().includes(search.toLowerCase())).map(p=>(
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${p.stock < 5 ? 'bg-red-50 text-red-400' : 'bg-gray-100 text-gray-300'}`}><Package size={20}/></div>
                        <div>
                          <p className="text-xs font-bold text-gray-800 leading-tight">{p.name}</p>
                          <p className="text-[10px] text-[#00AA5B] font-bold">{p.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-black text-gray-800">Rp{Number(p.price).toLocaleString()}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${p.stock < 10 ? 'bg-red-50 text-red-500 animate-pulse' : 'bg-green-50 text-[#00AA5B]'}`}>{p.stock}</span>
                        {p.stock < 5 && <span className="text-[8px] text-red-400 font-bold mt-1">Limit!</span>}
                      </div>
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