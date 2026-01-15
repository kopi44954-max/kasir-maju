"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, Package, Search, Edit3, PlusCircle, Loader2 } from 'lucide-react';

export default function ManajemenInventaris() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<any>({ name: '', price: '', cost: '', stock: '', category: 'UMUM' });
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fungsi Navigasi Paksa (Gunakan ini jika router.push gagal)
  const goHome = () => {
    // Cara 1: Menggunakan Router Next.js (Lebih Cepat)
    router.push('/');
    // Cara 2: Jika Cara 1 Gagal, Paksa Refresh Browser ke Beranda
    setTimeout(() => {
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }, 500);
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/pos');
      const text = await res.text();
      const data = text ? JSON.parse(text) : { products: [] };
      setProducts(data.products || []);
    } catch (e) {
      console.error(e);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const type = isEdit ? 'UPDATE_PRODUCT' : 'ADD_PRODUCT';
    try {
      await fetch('/api/pos', { 
        method: 'POST', 
        body: JSON.stringify({ type, data: isEdit ? form : { ...form, id: Date.now() } }) 
      });
      setForm({ name: '', price: '', cost: '', stock: '', category: 'UMUM' });
      setIsEdit(false);
      loadData();
    } catch (e) { alert("Gagal Simpan"); }
  };

  const del = async (id: number) => { 
    if(confirm("Hapus barang?")){ 
      await fetch('/api/pos', { method:'POST', body:JSON.stringify({type:'DELETE_PRODUCT', id}) }); 
      loadData();
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F3F7]">
      {/* HEADER DENGAN TOMBOL GO HOME */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={goHome} 
              className="p-2 -ml-2 text-[#00AA5B] hover:bg-green-50 rounded-full transition-all flex items-center gap-2 font-bold text-sm"
            >
              <ArrowLeft size={24}/>
              <span>KEMBALI KE KASIR</span>
            </button>
          </div>
          <div className="text-[10px] font-black text-[#00AA5B] bg-green-50 px-3 py-1 rounded-md uppercase tracking-widest">
            Toko Rahma Inventaris
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* FORM TAMBAH/EDIT */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xs font-black uppercase mb-6 flex items-center gap-2 text-gray-400">
              {isEdit ? <Edit3 className="text-orange-500" size={16}/> : <PlusCircle className="text-[#00AA5B]" size={16}/>}
              {isEdit ? "Edit Data Barang" : "Tambah Barang Baru"}
            </h2>
            <form onSubmit={save} className="space-y-4">
              <input required placeholder="NAMA BARANG" value={form.name} onChange={e=>setForm({...form, name:e.target.value.toUpperCase()})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-bold uppercase outline-none focus:border-[#00AA5B]"/>
              <div className="grid grid-cols-2 gap-3">
                <input required placeholder="KATEGORI" value={form.category} onChange={e=>setForm({...form, category:e.target.value.toUpperCase()})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-bold uppercase outline-none focus:border-[#00AA5B]"/>
                <input required type="number" placeholder="STOK" value={form.stock} onChange={e=>setForm({...form, stock:e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-bold outline-none focus:border-[#00AA5B]"/>
              </div>
              <input required type="number" placeholder="HARGA MODAL" value={form.cost} onChange={e=>setForm({...form, cost:e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-bold outline-none focus:border-[#00AA5B]"/>
              <input required type="number" placeholder="HARGA JUAL" value={form.price} onChange={e=>setForm({...form, price:e.target.value})} className="w-full bg-green-50 border-green-100 rounded-xl p-3 text-sm font-black text-[#00AA5B] outline-none"/>
              <button className={`w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] text-white shadow-lg transition-transform active:scale-95 ${isEdit ? 'bg-orange-500' : 'bg-[#00AA5B]'}`}>
                {isEdit ? "Update Barang" : "Simpan Barang"}
              </button>
            </form>
          </div>
        </div>

        {/* TABEL DATA */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20}/>
            <input onChange={e=>setSearch(e.target.value)} placeholder="Cari nama barang..." className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold outline-none shadow-sm focus:border-[#00AA5B] transition-all"/>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">
                <tr>
                  <th className="px-6 py-4">Informasi Barang</th>
                  <th className="px-6 py-4 text-right">Harga Jual</th>
                  <th className="px-6 py-4 text-center">Stok</th>
                  <th className="px-6 py-4 text-center">Opsi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 uppercase font-bold text-gray-600">
                {loading ? (
                  <tr><td colSpan={4} className="text-center py-20"><Loader2 className="animate-spin mx-auto text-[#00AA5B]"/></td></tr>
                ) : products.filter(p=>p.name.toLowerCase().includes(search.toLowerCase())).map(p=>(
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-xs text-gray-800 leading-none">{p.name}</p>
                      <span className="text-[9px] text-[#00AA5B]">{p.category}</span>
                    </td>
                    <td className="px-6 py-4 text-right font-black text-gray-800">Rp{Number(p.price).toLocaleString()}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded text-[10px] ${p.stock < 10 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-[#00AA5B]'}`}>{p.stock}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={()=>{setForm(p); setIsEdit(true); window.scrollTo({top:0, behavior:'smooth'})}} className="p-2 text-gray-300 hover:text-orange-500 transition-colors"><Edit3 size={18}/></button>
                      <button onClick={()=>del(p.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
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