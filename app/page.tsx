"use client";
import { useState, useEffect } from 'react';

export default function KasirModern() {
  const [db, setDb] = useState<{products: any[], transactions: any[]}>({ products: [], transactions: [] });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [cart, setCart] = useState<any[]>([]);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', price: '', stock: '', category: 'UMUM' });

  const MY_PIN = "1234"; 

  const fetchData = async () => {
    try {
      const res = await fetch('/api/pos');
      const data = await res.json();
      setDb(data);
    } catch (e) { console.error("Gagal load data"); }
  };

  useEffect(() => { if (isLoggedIn) fetchData(); }, [isLoggedIn]);

  const saveToCloud = async (type: string, payload: any) => {
    await fetch('/api/pos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, ...payload })
    });
    fetchData();
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === MY_PIN) {
      setIsLoggedIn(true);
    } else {
      alert("PIN Salah!");
      setPinInput("");
    }
  };

  // --- TAMPILAN LOGIN MODERN ---
  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <form onSubmit={handleLogin} className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-sm text-center">
          <div className="text-5xl mb-4">🔐</div>
          <h1 className="text-2xl font-black text-slate-800 mb-2">KASIR MAJU</h1>
          <p className="text-slate-400 mb-8">Silakan masukkan PIN akses</p>
          <input 
            type="password" 
            placeholder="••••"
            className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-center text-3xl tracking-[1rem] focus:border-blue-500 focus:outline-none transition-all"
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            autoFocus
          />
          <button type="submit" className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 transition-all">
            MASUK SEKARANG
          </button>
        </form>
      </div>
    );
  }

  // --- TAMPILAN KASIR MODERN ---
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      {/* HEADER */}
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-8 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-black text-blue-600">KASIR MAJU</h1>
          <p className="text-slate-400 text-sm font-medium">Sistem Inventaris & Penjualan</p>
        </div>
        <button onClick={() => setIsLoggedIn(false)} className="bg-red-50 hover:bg-red-100 text-red-600 px-6 py-2 rounded-xl font-bold transition-all">
          Logout
        </button>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* KOLOM 1: INVENTARIS */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <span className="p-2 bg-orange-100 rounded-lg text-orange-600">📦</span> Stok Barang
          </h2>
          <div className="space-y-3 mb-8">
            <input placeholder="Nama Produk" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-blue-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Harga" type="number" className="p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-blue-500" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
              <input placeholder="Stok" type="number" className="p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-blue-500" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
            </div>
            {editingProduct ? (
              <div className="flex gap-2">
                <button onClick={() => { saveToCloud('UPDATE_PRODUCT', { data: { ...formData, id: editingProduct.id } }); setEditingProduct(null); setFormData({name:'', price:'', stock:'', category:'UMUM'}); }} className="flex-1 bg-orange-500 text-white p-3 rounded-xl font-bold shadow-lg shadow-orange-100">Simpan Update</button>
                <button onClick={() => setEditingProduct(null)} className="bg-slate-200 text-slate-600 px-4 rounded-xl">Batal</button>
              </div>
            ) : (
              <button onClick={() => { saveToCloud('ADD_PRODUCT', { data: formData }); setFormData({name:'', price:'', stock:'', category:'UMUM'}); }} className="w-full bg-blue-600 text-white p-3 rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">+ Tambah Barang</button>
            )}
          </div>
          
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {db.products.map((p: any) => (
              <div key={p.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                <div>
                  <div className="font-bold text-slate-800">{p.name}</div>
                  <div className="text-sm text-slate-500 font-medium">Rp {Number(p.price).toLocaleString()} • Stok: {p.stock}</div>
                </div>
                <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => { setEditingProduct(p); setFormData({name:p.name, price:p.price, stock:p.stock, category:p.category}); }} className="text-blue-600 font-bold text-sm">Edit</button>
                  <button onClick={() => saveToCloud('DELETE_PRODUCT', { id: p.id })} className="text-red-500 font-bold text-sm">Hapus</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* KOLOM 2: KASIR */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <span className="p-2 bg-blue-100 rounded-lg text-blue-600">🛒</span> Area Kasir
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
            {db.products.map((p: any) => (
              <button key={p.id} onClick={() => {
                const exist = cart.find(x => x.id === p.id);
                if (exist) setCart(cart.map(x => x.id === p.id ? { ...exist, qty: exist.qty + 1 } : x));
                else setCart([...cart, { ...p, qty: 1 }]);
              }} className="p-4 text-sm font-bold bg-slate-50 hover:bg-blue-500 hover:text-white rounded-2xl border border-slate-100 transition-all text-center">
                {p.name}
              </button>
            ))}
          </div>
          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
            <h3 className="font-bold mb-4 text-slate-800">Detail Pesanan</h3>
            <div className="space-y-3 mb-6 min-h-[100px]">
              {cart.map((item, i) => (
                <div key={i} className="flex justify-between items-center text-sm font-medium">
                  <span className="text-slate-600">{item.name} <span className="text-blue-500">x{item.qty}</span></span>
                  <span className="text-slate-800 font-bold">Rp {(item.price * item.qty).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-200 pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-xs">Total Bayar</span>
                <span className="text-2xl font-black text-blue-600">Rp {cart.reduce((a, b) => a + (b.price * b.qty), 0).toLocaleString()}</span>
              </div>
            </div>
            <button onClick={async () => {
              const trans = { id: Date.now(), date: new Date().toLocaleString(), items: cart, total: cart.reduce((a, b) => a + (b.price * b.qty), 0) };
              await saveToCloud('TRANSACTION', { cart, transaction: trans });
              setCart([]);
              alert("Pembayaran Berhasil!");
            }} disabled={cart.length === 0} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-100 disabled:bg-slate-200 disabled:shadow-none transition-all">
              SELESAIKAN PESANAN
            </button>
          </div>
        </div>

        {/* KOLOM 3: LAPORAN */}
        <div className="lg:col-span-3 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span className="p-2 bg-purple-100 rounded-lg text-purple-600">📊</span> Laporan
            </h2>
            <button onClick={() => { if(confirm('Hapus semua riwayat?')) saveToCloud('DELETE_ALL_TRANSACTIONS', {}) }} className="text-xs font-bold text-red-400 hover:text-red-600 transition-all">Reset</button>
          </div>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {db.transactions.slice().reverse().map((t: any) => (
              <div key={t.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 relative group">
                <button onClick={() => saveToCloud('DELETE_TRANSACTION', { id: t.id })} className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">×</button>
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest">{t.date}</div>
                {t.items.map((it: any, i: number) => (
                  <div key={i} className="text-xs text-slate-600 flex justify-between">
                    <span>{it.name} (x{it.qty})</span>
                  </div>
                ))}
                <div className="mt-2 text-sm font-black text-slate-800 border-t border-slate-200 pt-2 flex justify-between">
                  <span>Total</span>
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