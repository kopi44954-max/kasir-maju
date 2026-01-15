"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Trash2, Package, Search, Edit3, PlusCircle, Loader2, ReceiptText, BarChart3 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function ManajemenToko() {
  const [activeTab, setActiveTab] = useState('stok'); // stok atau laporan
  const [products, setProducts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<any>({ name: '', price: '', stock: '', category: 'UMUM' });
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/pos', { cache: 'no-store' });
      const data = await res.json();
      setProducts(data.products || []);
      setTransactions(data.transactions || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/pos', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: isEdit ? 'UPDATE_PRODUCT' : 'ADD_PRODUCT', data: isEdit ? form : { ...form, id: Date.now() } }) 
    });
    setForm({ name: '', price: '', stock: '', category: 'UMUM' });
    setIsEdit(false);
    loadData();
  };

  const del = async (id: number) => { 
    if(confirm("Hapus barang?")){ 
      await fetch('/api/pos', { method:'POST', headers: {'Content-Type': 'application/json'}, body:JSON.stringify({type:'DELETE_PRODUCT', id}) }); 
      loadData();
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F3F7]">
      {/* HEADER TOKOPEDIA STYLE */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => window.location.href = '/'} className="flex items-center gap-2 font-bold text-[#00AA5B] hover:bg-green-50 px-4 py-2 rounded-xl transition-all">
            <ArrowLeft size={20} /> <span className="hidden md:inline">KEMBALI KE KASIR</span>
          </button>
          <div className="flex gap-4">
             <button onClick={() => setActiveTab('stok')} className={`px-4 py-2 rounded-lg font-bold text-xs uppercase ${activeTab === 'stok' ? 'bg-[#00AA5B] text-white' : 'text-gray-400'}`}>Manajemen Stok</button>
             <button onClick={() => setActiveTab('laporan')} className={`px-4 py-2 rounded-lg font-bold text-xs uppercase ${activeTab === 'laporan' ? 'bg-[#00AA5B] text-white' : 'text-gray-400'}`}>Laporan Penjualan</button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {activeTab === 'stok' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* FORM */}
            <div className="lg:col-span-4 bg-white p-6 rounded-2xl shadow-sm h-fit border border-gray-100">
              <h2 className="font-black text-[10px] uppercase text-gray-400 mb-6 tracking-widest flex items-center gap-2">
                <PlusCircle size={16} className="text-[#00AA5B]"/> {isEdit ? "Edit Barang" : "Tambah Barang"}
              </h2>
              <form onSubmit={save} className="space-y-4">
                <input required placeholder="NAMA BARANG" value={form.name} onChange={e=>setForm({...form, name:e.target.value.toUpperCase()})} className="w-full p-4 bg-gray-50 border-none rounded-xl font-bold uppercase text-xs focus:ring-2 focus:ring-[#00AA5B] outline-none"/>
                <div className="grid grid-cols-2 gap-3">
                  <input required placeholder="KATEGORI" value={form.category} onChange={e=>setForm({...form, category:e.target.value.toUpperCase()})} className="w-full p-4 bg-gray-50 border-none rounded-xl font-bold text-xs focus:ring-2 focus:ring-[#00AA5B] outline-none"/>
                  <input required type="number" placeholder="STOK" value={form.stock} onChange={e=>setForm({...form, stock:e.target.value})} className="w-full p-4 bg-gray-50 border-none rounded-xl font-bold text-xs focus:ring-2 focus:ring-[#00AA5B] outline-none"/>
                </div>
                <input required type="number" placeholder="HARGA JUAL" value={form.price} onChange={e=>setForm({...form, price:e.target.value})} className="w-full p-4 bg-green-50 text-[#00AA5B] font-black rounded-xl outline-none border-none"/>
                <button className="w-full py-4 bg-[#00AA5B] text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-green-100 transition-transform active:scale-95">
                  {isEdit ? "Update Barang" : "Simpan Barang"}
                </button>
              </form>
            </div>

            {/* TABEL STOK */}
            <div className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase border-b">
                  <tr>
                    <th className="p-4">Informasi Produk</th>
                    <th className="p-4 text-right">Harga</th>
                    <th className="p-4 text-center">Stok</th>
                    <th className="p-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-xs font-bold text-gray-600">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50 uppercase">
                      <td className="p-4 font-black">{p.name}<br/><span className="text-[9px] text-[#00AA5B]">{p.category}</span></td>
                      <td className="p-4 text-right text-[#FA591D]">Rp{Number(p.price).toLocaleString()}</td>
                      <td className="p-4 text-center font-black">{p.stock}</td>
                      <td className="p-4 text-center">
                        <button onClick={() => {setForm(p); setIsEdit(true)}} className="p-2 text-gray-300 hover:text-orange-500"><Edit3 size={16}/></button>
                        <button onClick={() => del(p.id)} className="p-2 text-gray-300 hover:text-red-500"><Trash2 size={16}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* TABEL LAPORAN */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
               <h2 className="font-black text-xs uppercase text-gray-400 tracking-widest flex items-center gap-2"><BarChart3 size={16} className="text-[#00AA5B]"/> Histori Penjualan</h2>
               <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Total Omzet</p>
                  <p className="text-[#FA591D] font-black text-xl">Rp{transactions.reduce((s,t) => s + t.total, 0).toLocaleString()}</p>
               </div>
            </div>
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase border-b">
                <tr>
                  <th className="p-4">Waktu</th>
                  <th className="p-4">Item Terjual</th>
                  <th className="p-4 text-right">Total Bayar</th>
                </tr>
              </thead>
              <tbody className="divide-y text-xs font-bold text-gray-600">
                {transactions.length === 0 && (
                  <tr><td colSpan={3} className="p-10 text-center text-gray-300 uppercase">Belum ada transaksi</td></tr>
                )}
                {transactions.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="p-4 text-[10px] text-gray-400">{new Date(t.date).toLocaleString('id-ID')}</td>
                    <td className="p-4">
                       {t.items.map((it:any) => (
                         <div key={it.id} className="text-[10px] uppercase font-black text-gray-800">• {it.name} ({it.qty}x)</div>
                       ))}
                    </td>
                    <td className="p-4 text-right font-black text-[#00AA5B]">Rp{t.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}