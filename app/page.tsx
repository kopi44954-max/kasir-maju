"use client";
import React, { useState, useEffect } from 'react';
import { ShoppingCart, Settings, Package, Search, Trash2, ReceiptText } from 'lucide-react';

export default function TokopediaKasir() {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch('/api/pos').then(res => res.json()).then(data => setProducts(data.products || []));
  }, []);

  const addToCart = (p: any) => {
    if (p.stock <= 0) return alert("Stok Habis!");
    const exist = cart.find(item => item.id === p.id);
    if (exist) {
      setCart(cart.map(item => item.id === p.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...p, qty: 1 }]);
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const bayar = async () => {
    if (cart.length === 0) return;
    const res = await fetch('/api/pos', {
      method: 'POST',
      body: JSON.stringify({
        type: 'TRANSACTION',
        cart: cart,
        transaction: { items: cart, total: total }
      })
    });
    if (res.ok) {
      alert("Pembayaran Berhasil!");
      setCart([]);
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F3F7] flex flex-col md:flex-row font-sans text-[#212121]">
      {/* KIRI: PRODUK */}
      <div className="flex-1 p-4 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-black text-[#00AA5B] tracking-tight">Toko Rahma <span className="text-gray-400 font-light">POS</span></h1>
          <button onClick={() => window.location.href = '/settings'} className="p-2 hover:bg-white rounded-full transition-all text-gray-400 hover:text-[#00AA5B]">
            <Settings size={28} />
          </button>
        </div>

        <div className="relative mb-8 shadow-sm">
          <Search className="absolute left-4 top-4 text-gray-300" size={20} />
          <input 
            placeholder="Cari barang di Toko Rahma..." 
            className="w-full p-4 pl-12 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#00AA5B] font-medium"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map(p => (
            <div key={p.id} onClick={() => addToCart(p)} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden border border-transparent hover:border-[#42b549]">
              <div className="h-32 bg-gray-50 flex items-center justify-center text-gray-200">
                <Package size={48} />
              </div>
              <div className="p-3">
                <p className="font-bold text-sm truncate uppercase">{p.name}</p>
                <p className="text-[#FA591D] font-black text-base mt-1">Rp{Number(p.price).toLocaleString()}</p>
                <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold">Stok: {p.stock}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* KANAN: KERANJANG */}
      <div className="w-full md:w-[400px] bg-white border-l border-gray-100 p-6 flex flex-col shadow-2xl">
        <div className="flex items-center gap-2 mb-6 text-lg font-bold border-b pb-4">
          <ShoppingCart className="text-[#00AA5B]" />
          <span>Keranjang Belanja</span>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-4">
          {cart.length === 0 && (
            <div className="text-center py-20 text-gray-300">
               <ShoppingCart size={48} className="mx-auto mb-2 opacity-20" />
               <p className="text-xs font-bold uppercase tracking-widest">Keranjang Kosong</p>
            </div>
          )}
          {cart.map(item => (
            <div key={item.id} className="flex gap-3 bg-gray-50 p-3 rounded-xl relative group">
              <div className="w-12 h-12 bg-white rounded-lg border flex items-center justify-center text-gray-300"><Package size={20}/></div>
              <div className="flex-1">
                <p className="font-bold text-[11px] uppercase truncate w-32">{item.name}</p>
                <p className="text-[#00AA5B] text-xs font-black">Rp{(item.price * item.qty).toLocaleString()}</p>
                <div className="flex items-center gap-3 mt-2">
                   <button onClick={() => setCart(cart.map(c => c.id === item.id ? {...c, qty: Math.max(1, c.qty - 1)} : c))} className="w-6 h-6 border rounded-full flex items-center justify-center text-[#00AA5B] font-bold">-</button>
                   <span className="text-xs font-bold">{item.qty}</span>
                   <button onClick={() => setCart(cart.map(c => c.id === item.id ? {...c, qty: c.qty + 1} : c))} className="w-6 h-6 border rounded-full flex items-center justify-center text-[#00AA5B] font-bold">+</button>
                </div>
              </div>
              <button onClick={() => setCart(cart.filter(c => c.id !== item.id))} className="text-gray-300 hover:text-red-500"><Trash2 size={18}/></button>
            </div>
          ))}
        </div>

        <div className="border-t pt-6 bg-white">
          <div className="flex justify-between items-end mb-4">
            <span className="text-gray-400 font-bold text-xs uppercase">Total Tagihan</span>
            <span className="text-[#FA591D] text-2xl font-black">Rp{total.toLocaleString()}</span>
          </div>
          <button 
            onClick={bayar}
            disabled={cart.length === 0}
            className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all ${cart.length > 0 ? 'bg-[#00AA5B] text-white shadow-lg shadow-green-100' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
          >
            Selesaikan Bayar
          </button>
        </div>
      </div>
    </div>
  );
}