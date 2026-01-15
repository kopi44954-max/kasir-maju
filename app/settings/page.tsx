"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Trash2, Package, Search, Edit3, PlusCircle, Loader2 } from 'lucide-react';

// PAKSA VERCEL UNTUK TIDAK CACHE HALAMAN INI
export const dynamic = 'force-dynamic';

export default function ManajemenInventaris() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<any>({ name: '', price: '', cost: '', stock: '', category: 'UMUM' });
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(true);

  // NAVIGASI PAKSA MENGGUNAKAN WINDOW.LOCATION (Anti-Macet)
  const goHome = () => {
    window.location.assign('/');
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/pos', { cache: 'no-store' }); // Matikan cache fetch
      const data = await res.json();
      setProducts(data.products || []);
    } catch (e) {
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data: isEdit ? form : { ...form, id: Date.now() } }) 
      });
      setForm({ name: '', price: '', cost: '', stock: '', category: 'UMUM' });
      setIsEdit(false);
      loadData();
    } catch (e) { alert("Gagal!"); }
  };

  const del = async (id: number) => { 
    if(confirm("Hapus?")){ 
      await fetch('/api/pos', { 
        method:'POST', 
        headers: { 'Content-Type': 'application/json' },
        body:JSON.stringify({type:'DELETE_PRODUCT', id}) 
      }); 
      loadData();
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F3F7]">
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
            Toko Rahma POS
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-[10px] font-black uppercase mb-6 text-gray-400 tracking-widest">Input Data Barang</h2>
            <form onSubmit={save} className="space-y-4">
              <input required placeholder="NAMA BARANG" value={form.name} onChange={e=>setForm({...form, name:e.target.value.toUpperCase()})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-bold uppercase outline-none focus:border-[#00AA5B]"/>
              <div className="grid grid-cols-2 gap-3">
                <input required placeholder="KATEGORI" value={form.category} onChange={e=>setForm({...form, category:e.target.value.toUpperCase()})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-bold uppercase outline-none focus:border-[#00AA5B]"/>
                <input required type="number" placeholder="STOK" value={form.stock} onChange={e=>setForm({...form, stock:e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-bold outline-none focus:border-[#00AA5B]"/>
              </div>
              <input required type="number" placeholder="HARGA JUAL" value={form.price} onChange={e=>setForm({...form, price:e.target.value})} className="w-full bg-green-50 border-green-100 rounded-xl p-3 text-sm font-black text-[#00AA5B] outline-none"/>
              <button className={`w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] text-white shadow-lg ${isEdit ? 'bg-orange-500' : 'bg-[#00AA5B]'}`}>
                {isEdit ? "Update" : "Simpan"}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
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
                ) : products.filter(p=>p.name.toLowerCase().includes(search.toLowerCase())).map(p=>(
                  <tr key={p.id}>
                    <td className="px-6 py-4">
                      <p className="text-xs text-gray-800 leading-none">{p.name}</p>
                      <span className="text-[9px] text-[#00AA5B]">{p.category}</span>
                    </td>
                    <td className="px-6 py-4 text-right font-black">Rp{Number(p.price).toLocaleString()}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded text-[10px] ${p.stock < 10 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-[#00AA5B]'}`}>{p.stock}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={()=>{setForm(p); setIsEdit(true); window.scrollTo({top:0, behavior:'smooth'})}} className="p-2 text-gray-300 hover:text-orange-500"><Edit3 size={18}/></button>
                      <button onClick={()=>del(p.id)} className="p-2 text-gray-300 hover:text-red-500"><Trash2 size={18}/></button>
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