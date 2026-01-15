"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation'; // Import router
import { ArrowLeft, Trash2, Package, Search, Edit3, PlusCircle, Loader2 } from 'lucide-react';

export default function ManajemenInventaris() {
  const router = useRouter(); // Inisialisasi router
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<any>({ name: '', price: '', cost: '', stock: '', category: 'UMUM' });
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/pos');
      if (!res.ok) throw new Error();
      const text = await res.text();
      const data = text ? JSON.parse(text) : { products: [] };
      setProducts(data.products || []);
    } catch (e) {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async (e: any) => {
    e.preventDefault();
    const type = isEdit ? 'UPDATE_PRODUCT' : 'ADD_PRODUCT';
    try {
      await fetch('/api/pos', { 
        method: 'POST', 
        body: JSON.stringify({ type, data: isEdit ? form : { ...form, id: Date.now() } }) 
      });
      setForm({ name: '', price: '', cost: '', stock: '', category: 'UMUM' });
      setIsEdit(false);
      load();
    } catch (e) { alert("Gagal!"); }
  };

  const del = async (id: any) => { 
    if(confirm("Hapus?")){ 
      await fetch('/api/pos', { method:'POST', body:JSON.stringify({type:'DELETE_PRODUCT', id}) }); 
      load();
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F3F7] pb-24">
      {/* HEADER DENGAN NAVIGASI PANDUAN ROUTER */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-[100]">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
           <div className="flex items-center gap-4">
             {/* Tombol Back Menggunakan Router Push */}
             <button 
               onClick={() => router.push('/')} 
               className="p-2 -ml-2 text-gray-400 hover:text-[#00AA5B] hover:bg-green-50 rounded-full transition-all"
             >
               <ArrowLeft size={24}/>
             </button>
             <h1 className="text-lg font-bold text-gray-800 uppercase">Manajemen Stok</h1>
           </div>
           <div className="text-[10px] font-bold text-[#00AA5B] bg-green-50 px-3 py-1 rounded-full uppercase">Toko Rahma</div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* FORM */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl border p-6 sticky top-24">
            <h2 className="font-bold text-xs uppercase mb-6 flex items-center gap-2">
              {isEdit ? <Edit3 className="text-orange-500" size={18}/> : <PlusCircle className="text-[#00AA5B]" size={18}/>}
              {isEdit ? "Edit Barang" : "Barang Baru"}
            </h2>
            <form onSubmit={save} className="space-y-4">
              <input required placeholder="NAMA BARANG" value={form.name} onChange={e=>setForm({...form, name:e.target.value.toUpperCase()})} className="w-full bg-gray-50 border rounded-xl p-3 text-sm outline-none focus:border-[#00AA5B] font-bold uppercase"/>
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="KATEGORI" value={form.category} onChange={e=>setForm({...form, category:e.target.value.toUpperCase()})} className="w-full bg-gray-50 border rounded-xl p-3 text-sm outline-none font-bold uppercase"/>
                <input required type="number" placeholder="STOK" value={form.stock} onChange={e=>setForm({...form, stock:e.target.value})} className="w-full bg-gray-50 border rounded-xl p-3 text-sm outline-none font-bold"/>
              </div>
              <input required type="number" placeholder="HARGA MODAL" value={form.cost} onChange={e=>setForm({...form, cost:e.target.value})} className="w-full bg-gray-50 border rounded-xl p-3 text-sm outline-none font-bold"/>
              <input required type="number" placeholder="HARGA JUAL" value={form.price} onChange={e=>setForm({...form, price:e.target.value})} className="w-full bg-green-50 border-green-100 rounded-xl p-3 text-sm font-black text-[#00AA5B] outline-none"/>
              <button className={`w-full py-4 rounded-xl font-bold text-white text-[10px] uppercase shadow-lg ${isEdit ? 'bg-orange-500' : 'bg-[#00AA5B]'}`}>
                {isEdit ? "Update" : "Simpan"}
              </button>
            </form>
          </div>
        </div>

        {/* TABEL */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
            <input onChange={e=>setSearch(e.target.value)} placeholder="Cari barang..." className="w-full bg-white border rounded-2xl pl-12 pr-6 py-4 text-sm outline-none shadow-sm focus:border-[#00AA5B]"/>
          </div>

          <div className="bg-white rounded-2xl border overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-400 font-bold text-[10px] uppercase">
                <tr>
                  <th className="px-6 py-4">Barang</th>
                  <th className="px-6 py-4 text-right">Harga</th>
                  <th className="px-6 py-4 text-center">Stok</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y text-gray-600 uppercase">
                {loading ? (
                  <tr><td colSpan={4} className="text-center py-10"><Loader2 className="animate-spin mx-auto text-[#00AA5B]"/></td></tr>
                ) : products.filter(p=>p.name.toLowerCase().includes(search.toLowerCase())).map(p=>(
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-bold text-xs">{p.name} <br/><span className="text-[#00AA5B] text-[9px]">{p.category}</span></td>
                    <td className="px-6 py-4 text-right font-black">Rp{Number(p.price).toLocaleString()}</td>
                    <td className="px-6 py-4 text-center"><span className={`px-2 py-1 rounded text-[10px] font-bold ${p.stock < 10 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-[#00AA5B]'}`}>{p.stock}</span></td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={()=>{setForm(p); setIsEdit(true); window.scrollTo(0,0)}} className="p-2 text-gray-400 hover:text-orange-500"><Edit3 size={18}/></button>
                      <button onClick={()=>del(p.id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={18}/></button>
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