"use client";
import { useState, useEffect } from 'react';

export default function KasirMaju() {
  const [db, setDb] = useState<{products: any[], transactions: any[]}>({ products: [], transactions: [] });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [cart, setCart] = useState<any[]>([]);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  
  // FORM STATES
  const [formData, setFormData] = useState({ name: '', price: '', stock: '', category: 'UMUM' });

  const MY_PIN = "1234"; // SILAKAN GANTI PIN ANDA DI SINI

  // 1. AMBIL DATA DARI CLOUD
  const fetchData = async () => {
    try {
      const res = await fetch('/api/pos');
      const data = await res.json();
      setDb(data);
    } catch (e) {
      console.error("Gagal ambil data");
    }
  };

  useEffect(() => {
    if (isLoggedIn) fetchData();
  }, [isLoggedIn]);

  // 2. FUNGSI KIRIM DATA KE API
  const saveToCloud = async (type: string, payload: any) => {
    await fetch('/api/pos', {
      method: 'POST',
      body: JSON.stringify({ type, ...payload })
    });
    fetchData(); // Refresh tampilan
  };

  // 3. LOGIKA LOGIN
  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 bg-white rounded-xl shadow-lg w-80 text-center">
          <h1 className="text-2xl font-bold mb-6">KASIR MAJU 🔐</h1>
          <input 
            type="password" 
            placeholder="Masukkan PIN"
            className="w-full p-3 border rounded-lg text-center text-2xl tracking-widest"
            value={pinInput}
            onChange={(e) => {
              setPinInput(e.target.value);
              if (e.target.value === MY_PIN) setIsLoggedIn(true);
            }}
            autoFocus
          />
          <p className="mt-4 text-gray-400 text-sm">PIN Default: 1234</p>
        </div>
      </div>
    );
  }

  // 4. LOGIKA TRANSAKSI
  const addToCart = (p: any) => {
    const exist = cart.find(x => x.id === p.id);
    if (exist) {
      setCart(cart.map(x => x.id === p.id ? { ...exist, qty: exist.qty + 1 } : x));
    } else {
      setCart([...cart, { ...p, qty: 1 }]);
    }
  };

  const checkout = async () => {
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const transaction = {
      id: Date.now(),
      date: new Date().toLocaleString(),
      items: cart,
      total
    };
    await saveToCloud('TRANSACTION', { cart, transaction });
    setCart([]);
    alert("Transaksi Berhasil!");
  };

  return (
    <div className="p-4 max-w-6xl mx-auto font-sans">
      <div className="flex justify-between items-center mb-6 bg-blue-600 p-4 rounded-lg text-white">
        <h1 className="text-xl font-bold">KASIR MAJU</h1>
        <button onClick={() => setIsLoggedIn(false)} className="bg-red-500 px-3 py-1 rounded">Keluar</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KOLOM 1: INVENTARIS */}
        <div className="bg-white p-4 rounded-lg shadow border">
          <h2 className="font-bold mb-4 border-b pb-2">📦 Kelola Stok</h2>
          <div className="space-y-2 mb-4">
            <input placeholder="Nama Barang" className="w-full p-2 border rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <input placeholder="Harga" type="number" className="w-full p-2 border rounded" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
            <input placeholder="Stok" type="number" className="w-full p-2 border rounded" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
            
            {editingProduct ? (
              <div className="flex gap-2">
                <button onClick={() => {
                  saveToCloud('UPDATE_PRODUCT', { data: { ...formData, id: editingProduct.id } });
                  setEditingProduct(null);
                  setFormData({ name: '', price: '', stock: '', category: 'UMUM' });
                }} className="flex-1 bg-orange-500 text-white p-2 rounded">Simpan Update</button>
                <button onClick={() => setEditingProduct(null)} className="bg-gray-400 text-white p-2 rounded">Batal</button>
              </div>
            ) : (
              <button onClick={() => {
                saveToCloud('ADD_PRODUCT', { data: formData });
                setFormData({ name: '', price: '', stock: '', category: 'UMUM' });
              }} className="w-full bg-green-600 text-white p-2 rounded">+ Tambah Barang</button>
            )}
          </div>

          <div className="max-h-60 overflow-y-auto">
            {db.products.map((p: any) => (
              <div key={p.id} className="flex justify-between items-center p-2 border-b text-sm">
                <div>
                  <div className="font-bold">{p.name}</div>
                  <div className="text-gray-500">Rp {p.price} | Stok: {p.stock}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => {
                    setEditingProduct(p);
                    setFormData({ name: p.name, price: p.price, stock: p.stock, category: p.category });
                  }} className="text-blue-500">Edit</button>
                  <button onClick={() => saveToCloud('DELETE_PRODUCT', { id: p.id })} className="text-red-500">Hapus</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* KOLOM 2: KASIR */}
        <div className="bg-white p-4 rounded-lg shadow border">
          <h2 className="font-bold mb-4 border-b pb-2">🛒 Kasir</h2>
          <div className="grid grid-cols-2 gap-2 mb-6">
            {db.products.map((p: any) => (
              <button key={p.id} onClick={() => addToCart(p)} className="p-2 bg-blue-50 border rounded text-sm hover:bg-blue-100">
                {p.name}
              </button>
            ))}
          </div>
          <div className="border-t pt-2">
            <h3 className="font-bold text-sm mb-2">Keranjang:</h3>
            {cart.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm mb-1">
                <span>{item.name} x{item.qty}</span>
                <span>Rp {item.price * item.qty}</span>
              </div>
            ))}
            <div className="mt-4 border-t pt-2 font-bold flex justify-between">
              <span>TOTAL:</span>
              <span>Rp {cart.reduce((sum, item) => sum + (item.price * item.qty), 0)}</span>
            </div>
            <button onClick={checkout} disabled={cart.length === 0} className="w-full mt-4 bg-blue-600 text-white p-3 rounded-lg disabled:bg-gray-300">
              BAYAR SEKARANG
            </button>
          </div>
        </div>

        {/* KOLOM 3: LAPORAN */}
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h2 className="font-bold">📊 Riwayat</h2>
            <button onClick={() => { if(confirm('Hapus semua?')) saveToCloud('DELETE_ALL_TRANSACTIONS', {}) }} className="text-xs text-red-500">Hapus Semua</button>
          </div>
          <div className="max-h-96 overflow-y-auto text-xs">
            {db.transactions.slice().reverse().map((t: any) => (
              <div key={t.id} className="mb-3 p-2 bg-gray-50 rounded">
                <div className="flex justify-between font-bold">
                  <span>{t.date}</span>
                  <button onClick={() => saveToCloud('DELETE_TRANSACTION', { id: t.id })} className="text-red-400">x</button>
                </div>
                {t.items.map((i: any, idx: number) => (
                  <div key={idx}>{i.name} x{i.qty}</div>
                ))}
                <div className="text-right font-bold border-t mt-1">Total: Rp {t.total}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}