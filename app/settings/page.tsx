"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trash2, Package, Search, Edit3, Plus, PlusCircle } from 'lucide-react';

export default function ManajemenInventaris() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<any>({ name: '', price: '', cost: '', stock: '', category: 'UMUM' });
  const [isEdit, setIsEdit] = useState(false);

  const load = async () => {
    const res = await fetch('/api/pos');
    const data = await res.json();
    setProducts(data.products || []);
  };

  useEffect(() => { load(); }, []);

  const save = async (e: any) => {
    e.preventDefault();
    const type = isEdit ? 'UPDATE_PRODUCT' : 'ADD_PRODUCT';
    await fetch('/api/pos', { method: 'POST', body: JSON.stringify({ type, data: form }) });
    setForm({ name: '', price: '', cost: '', stock: '', category: 'UMUM' });
    setIsEdit(false);
    load();
  };

  const del = async (id: any) => { if(confirm("Hapus produk ini?")){ await fetch('/api/pos', { method:'POST', body:JSON.stringify({type:'DELETE_PRODUCT', id}) }); load(); }};
  const delAll = async () => { if(confirm("Kosongkan seluruh inventaris?")){ await fetch('/api/pos', { method:'POST', body:JSON.stringify({type:'DELETE_ALL_PRODUCTS'}) }); load(); }};

  return (
    <div className="min-h-screen bg-[#F0F3F7] pb-24 px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <header className="flex flex-col gap-6 mb-8">
          <Link href="/" className="flex items-center gap-2 text-[#00AA5B] font-bold text-sm">
            <ArrowLeft size={18}/> Kembali ke Kasir
          </Link>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <div>
                <h1 className="text-2xl font-bold text-[#212121]">Manajemen Inventaris</h1>
                <p className="text-xs text-gray-500 mt-1">Kelola stok dan harga jual produk Anda</p>
             </div>
             <button onClick={delAll} className="text-xs font-bold text-red-500 px-4 py-2 border border-red-100 rounded-lg hover:bg-red-50 transition-colors">Hapus Semua Produk</button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* FORM TAMBAH/EDIT */}
          <div className="lg:col-span-1">
            <form onSubmit={save} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-8">
              <h2 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                {isEdit ? <Edit3 size={18} className="text-orange-500"/> : <PlusCircle size={18} className="text-[#00AA5B]"/>}
                {isEdit ? 'Ubah Data Produk' : 'Tambah Produk Baru'}
              </h2>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Nama Produk</label>
                  <input placeholder="Contoh: Kopi Susu Gula Aren" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm outline-none focus:border-[#00AA5B]" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Kategori</label>
                    <input placeholder="UMUM" value={form.category} onChange={e=>setForm({...form, category:e.target.value.toUpperCase()})} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm outline-none" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Stok</label>
                    <input type="number" placeholder="0" value={form.stock} onChange={e=>setForm({...form, stock:e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm outline-none" required />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Harga Modal (Rp)</label>
                  <input type="number" placeholder="0" value={form.cost} onChange={e=>setForm({...form, cost:e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm outline-none" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase text-[#00AA5B]">Harga Jual (Rp)</label>
                  <input type="number" placeholder="0" value={form.price} onChange={e=>setForm({...form, price:e.target.value})} className="w-full bg-green-50 border border-[#00AA5B]/20 rounded-lg p-3 text-sm font-bold text-[#00AA5B] outline-none" required />
                </div>
                <button className={`w-full py-3 rounded-xl font-bold text-sm text-white transition-all shadow-md ${isEdit?'bg-orange-500 shadow-orange-100':'bg-[#00AA5B] shadow-green-100 hover:bg-[#009650]'}`}>
                  {isEdit?'Simpan Perubahan':'Tambahkan Produk'}
                </button>
                {isEdit && <button type="button" onClick={()=>{setIsEdit(false); setForm({name:'', price:'', cost:'', stock:'', category:'UMUM'})}} className="w-full py-2 text-xs text-gray-400 font-medium">Batalkan Edit</button>}
              </div>
            </form>
          </div>

          {/* LIST BARANG */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
              <input onChange={e=>setSearch(e.target.value)} placeholder="Cari nama produk di inventaris..." className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-4 text-sm outline-none shadow-sm focus:border-[#00AA5B]"/>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {products.filter(p=>p.name.toLowerCase().includes(search.toLowerCase())).map(p=>(
                <div key={p.id} className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center group hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-gray-300 group-hover:text-[#00AA5B] transition-colors"><Package size={24}/></div>
                    <div>
                      <p className="text-sm font-bold text-gray-800 uppercase">{p.name}</p>
                      <div className="flex gap-2 mt-1">
                         <span className="text-[10px] font-bold text-[#00AA5B] bg-green-50 px-2 py-0.5 rounded uppercase">{p.category}</span>
                         <span className="text-[10px] font-medium text-gray-400">Stok: <b className={p.stock < 10 ? 'text-red-500' : 'text-gray-600'}>{p.stock}</b></span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-bold text-[#212121]">Rp{Number(p.price).toLocaleString()}</p>
                      <p className="text-[10px] text-gray-400 font-medium italic">Modal: Rp{Number(p.cost).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={()=>{setForm(p); setIsEdit(true); window.scrollTo({top:0, behavior:'smooth'})}} className="p-2 text-gray-300 hover:text-orange-500 transition-colors"><Edit3 size={18}/></button>
                      <button onClick={()=>del(p.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}