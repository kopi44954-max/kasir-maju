"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Search, Package, Trash2, CheckCircle, Settings, FileText } from 'lucide-react';

export default function CashierPage() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    const res = await fetch('/api/pos');
    const data = await res.json();
    setProducts(data.products || []);
  };

  useEffect(() => { fetchData(); }, []);

  const addToCart = (p: any) => {
    if (p.stock <= 0) return alert("Stok Habis!");
    const existing = cart.find(item => item.id === p.id);
    if (existing) {
      setCart(cart.map(item => item.id === p.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...p, qty: 1 }]);
    }
  };

  const removeFromCart = (id: string) => setCart(cart.filter(item => item.id !== id));

  const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    const res = await fetch('/api/pos', {
      method: 'POST',
      body: JSON.stringify({ type: 'ADD_TRANSACTION', data: { items: cart, totalPrice: total } })
    });
    if (res.ok) {
      alert("Transaksi Berhasil!");
      setCart([]);
      fetchData();
    }
  };

  const filtered = products.filter((p: any) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#07080A] text-slate-300 flex flex-col md:flex-row font-sans">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-20 bg-[#111318] border-r border-white/5 flex md:flex-col items-center py-6 gap-8 justify-center md:justify-start">
        <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-black font-black">TR</div>
        <Link href="/" className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl"><ShoppingCart size={20}/></Link>
        <Link href="/history" className="p-3 hover:bg-white/5 rounded-xl transition-all"><FileText size={20}/></Link>
        <Link href="/settings" className="p-3 hover:bg-white/5 rounded-xl transition-all"><Settings size={20}/></Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-10 overflow-y-auto h-screen">
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-white italic tracking-tighter">KASIR <span className="text-emerald-500 not-italic">MAJU.</span></h1>
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-600">Sistem Kasir Toko Rahma</p>
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
            <input 
              placeholder="Cari produk..." 
              className="w-full bg-[#111318] border border-white/5 p-4 pl-12 rounded-2xl outline-none focus:border-emerald-500/50 transition-all text-sm"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((p: any) => (
            <button 
              key={p.id} 
              onClick={() => addToCart(p)}
              className="bg-[#111318] p-6 rounded-3xl border border-white/5 hover:border-emerald-500/50 text-left transition-all group active:scale-95"
            >
              <div className="w-10 h-10 bg-black rounded-xl mb-4 flex items-center justify-center group-hover:text-emerald-500"><Package size={20}/></div>
              <h3 className="text-white font-bold text-sm uppercase truncate mb-1">{p.name}</h3>
              <p className="text-emerald-500 font-black italic text-sm">Rp{Number(p.price).toLocaleString()}</p>
              <p className="text-[9px] font-bold text-slate-600 mt-2 uppercase tracking-widest">Stok: {p.stock}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Cart Panel */}
      <div className="w-full md:w-[400px] bg-[#0A0B10] border-l border-white/5 p-8 flex flex-col h-screen">
        <h2 className="text-xl font-black text-white mb-8 flex items-center gap-3 italic">CART <span className="text-emerald-500 not-italic">({cart.length})</span></h2>
        
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scroll">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-20 uppercase font-black text-[10px] tracking-widest">Keranjang Kosong</div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center bg-[#111318] p-4 rounded-2xl border border-white/5">
                <div className="flex-1">
                  <p className="text-white font-bold text-xs uppercase">{item.name}</p>
                  <p className="text-[10px] text-slate-500">Rp{item.price.toLocaleString()} x {item.qty}</p>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-rose-500 p-2 hover:bg-rose-500/10 rounded-lg"><Trash2 size={16}/></button>
              </div>
            ))
          )}
        </div>

        <div className="mt-8 pt-8 border-t border-white/5 space-y-6">
          <div className="flex justify-between items-end">
            <span className="text-[10px] font-black uppercase text-slate-500">Total Pembayaran</span>
            <span className="text-3xl font-black text-emerald-500 italic leading-none">Rp{total.toLocaleString()}</span>
          </div>
          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle size={18}/> Proses Transaksi
          </button>
        </div>
      </div>
    </div>
  );
}