"use client";
import { useState, useEffect } from 'react';

export default function KasirModernTanpaPin() {
  const [db, setDb] = useState<{products: any[], transactions: any[]}>({ products: [], transactions: [] });
  const [cart, setCart] = useState<any[]>([]);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', price: '', stock: '', category: 'UMUM' });

  // 1. AMBIL DATA DARI CLOUD SAAT HALAMAN DIBUKA
  const fetchData = async () => {
    try {
      const res = await fetch('/api/pos');
      const data = await res.json();
      setDb(data);
    } catch (e) { console.error("Gagal load data"); }
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  // 2. FUNGSI SIMPAN/UPDATE/HAPUS KE CLOUD
  const saveToCloud = async (type: string, payload: any) => {
    await fetch('/api/pos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, ...payload })
    });
    fetchData(); // Refresh data otomatis setelah perubahan
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      
      {/* HEADER */}
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-8 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-black text-blue-600 uppercase tracking-tighter">KASIR MAJU</h1>
          <p className="text-slate-400 text-sm font-medium">Monitoring Penjualan Real-time</p>
        </div>
        <div className="flex items-center gap-2">
           <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
           <span className="text-xs font-bold text-slate-500 uppercase">Cloud Sync Aktif</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* KOLOM 1: INVENTARIS (STOK) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-800">
            <span className="p-2 bg-orange-100 rounded-lg text-orange-600">📦</span> Stok Barang
          </h2>
          
          <div className="space-y-3 mb-8 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <input placeholder="Nama Produk" className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:outline-blue-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Harga" type="number" className="p-3 bg-white border border-slate-200 rounded-xl focus:outline-blue-500" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
              <input placeholder="Stok" type="number" className="p-3 bg-white border border-slate-200 rounded-xl focus:outline-blue-500" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
            </div>
            
            {editingProduct ? (
              <div className="flex gap-2">
                <button onClick={() => { saveToCloud('UPDATE_PRODUCT', { data: { ...formData, id: editingProduct.id } }); setEditingProduct(null); setFormData({name:'', price:'', stock:'', category:'UMUM'}); }} className="flex-1 bg-orange-500 text-white p-3 rounded-xl font-bold shadow-lg shadow-orange-100">Update Produk</button>
                <button onClick={() => setEditingProduct(null)} className="bg-slate-200 text-slate-600 px-4 rounded-xl">Batal</button>
              </div>
            ) : (
              <button onClick={() => { saveToCloud('ADD_PRODUCT', { data: formData }); setFormData({name:'', price:'', stock:'', category:'UMUM'}); }} className="w-full bg-blue-600 text-white p-3 rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">+ Tambah Stok</button>
            )}
          </div>
          
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {db.products.map((p: any) => (
              <div key={p.id} className="flex justify-between items-center p-4 bg-white rounded-2xl border border-slate-100 group hover:border-blue-200 transition-all">
                <div>
                  <div className="font-bold text-slate-800">{p.name}</div>
                  <div className="text-sm text-slate-500 font-medium">Rp {Number(p.price).toLocaleString()} • Stok: {p.stock}</div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => { setEditingProduct(p); setFormData({name:p.name, price:p.price, stock:p.stock, category:p.category}); }} className="text-blue-500 font-bold text-xs hover:underline">Edit</button>
                  <button onClick={() => { if(confirm('Hapus produk ini?')) saveToCloud('DELETE_PRODUCT', { id: p.id }) }} className="text-red-400 font-bold text-xs hover:text-red-600">Hapus</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* KOLOM 2: KASIR (TRANSAKSI) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-800">
            <span className="p-2 bg-blue-100 rounded-lg text-blue-600">🛒</span> Area Kasir
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
            {db.products.map((p: any) => (
              <button key={p.id} onClick={() => {
                const exist = cart.find(x => x.id === p.id);
                if (exist) setCart(cart.map(x => x.id === p.id ? { ...exist, qty: exist.qty + 1 } : x));
                else setCart([...cart, { ...p, qty: 1 }]);
              }} className="p-4 text-xs font-bold bg-slate-50 hover:bg-blue-500 hover:text-white rounded-2xl border border-slate-100 transition-all text-center leading-tight">
                {p.name}
              </button>
            ))}
          </div>

          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl">
            <h3 className="font-bold mb-4 text-slate-400 text-xs uppercase tracking-widest">Keranjang Belanja</h3>
            <div className="space-y-4 mb-6 min-h-[120px]">
              {cart.map((item, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <span className="text-slate-300">{item.name} <span className="text-blue-400 font-bold ml-1">x{item.qty}</span></span>
                  <span className="font-bold">Rp {(item.price * item.qty).toLocaleString()}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t border-slate-800 pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold text-xs uppercase">Total Pembayaran</span>
                <span className="text-3xl font-black text-blue-400">Rp {cart.reduce((a, b) => a + (b.price * b.qty), 0).toLocaleString()}</span>
              </div>
            </div>
            
            <button 
              onClick={async () => {
                const total = cart.reduce((a, b) => a + (b.price * b.qty), 0);
                const trans = { id: Date.now(), date: new Date().toLocaleString(), items: cart, total };
                await saveToCloud('TRANSACTION', { cart, transaction: trans });
                setCart([]);
                alert("Pembayaran Berhasil!");
              }} 
              disabled={cart.length === 0} 
              className="w-full bg-blue-500 hover:bg-blue-400 text-white font-black py-4 rounded-2xl shadow-lg disabled:bg-slate-800 disabled:text-slate-600 transition-all"
            >
              PROSES BAYAR
            </button>
          </div>
        </div>

        {/* KOLOM 3: LAPORAN */}
        <div className="lg:col-span-3 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
              <span className="p-2 bg-purple-100 rounded-lg text-purple-600">📊</span> Riwayat
            </h2>
            <button onClick={() => { if(confirm('Hapus semua riwayat?')) saveToCloud('DELETE_ALL_TRANSACTIONS', {}) }} className="text-[10px] font-black text-red-400 hover:text-red-600 uppercase tracking-tighter">Reset</button>
          </div>
          
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
            {db.transactions.slice().reverse().map((t: any) => (
              <div key={t.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group relative">
                <button onClick={() => saveToCloud('DELETE_TRANSACTION', { id: t.id })} className="absolute top-2 right-2 text-slate-300 hover:text-red-500 transition-all text-xl font-light">×</button>
                <div className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-widest">{t.date}</div>
                {t.items.map((it: any, i: number) => (
                  <div key={i} className="text-[11px] text-slate-600 font-medium">
                    • {it.name} <span className="text-slate-400">(x{it.qty})</span>
                  </div>
                ))}
                <div className="mt-2 text-sm font-black text-slate-800 border-t border-slate-200 pt-2 flex justify-between">
                  <span className="text-xs text-slate-400 font-normal">Total</span>
                  <span>Rp {t.total.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}