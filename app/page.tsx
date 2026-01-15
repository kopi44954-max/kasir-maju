"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, Box, Trash2, Zap, Settings, BarChart3 } from 'lucide-react';

export default function NexusCashier() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState<any[]>([]);
  const [query, setQuery] = useState("");

  const load = async () => {
    const res = await fetch('/api/pos');
    const data = await res.json();
    setProducts(data.products || []);
  };

  useEffect(() => { load(); }, []);

  const addToCart = (p: any) => {
    if (p.stock <= 0) return;
    const exist = cart.find(x => x.id === p.id);
    if (exist) {
      setCart(cart.map(x => x.id === p.id ? {...x, qty: x.qty + 1} : x));
    } else {
      setCart([...cart, {...p, qty: 1}]);
    }
  };

  const checkout = async () => {
    const total = cart.reduce((a, b) => a + (b.price * b.qty), 0);
    const res = await fetch('/api/pos', {
      method: 'POST',
      body: JSON.stringify({ type: 'ADD_TRANSACTION', data: { items: cart, totalPrice: total } })
    });
    if (res.ok) { setCart([]); load(); }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-300 flex font-sans">
      {/* Nexus Sidebar */}
      <nav className="w-20 border-r border-white/5 flex flex-col items-center py-8 gap-10 bg-[#080808]">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]"><Zap size={20}/></div>
        <Link href="/" className="text-indigo-500 bg-indigo-500/10 p-3 rounded-xl"><ShoppingBag size={20}/></Link>
        <Link href="/history" className="hover:text-white p-3 transition-colors"><BarChart3 size={20}/></Link>
        <Link href="/settings" className="hover:text-white p-3 transition-colors"><Settings size={20}/></Link>
      </nav>

      {/* Product Hub */}
      <main className="flex-1 p-10 overflow-y-auto h-screen">
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-2xl font-black tracking-tighter text-white">NEXUS<span className="text-indigo-500">POS</span></h1>
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16}/>
            <input 
              onChange={e => setQuery(e.target.value)}
              placeholder="Cari produk di Nexus..." 
              className="w-full bg-white/5 border border-white/10 p-3 pl-12 rounded-xl outline-none focus:border-indigo-500/50 transition-all text-sm text-white"
            />
          </div>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.filter((p:any) => p.name.toLowerCase().includes(query.toLowerCase())).map((p: any) => (
            <button key={p.id} onClick={() => addToCart(p)} className="bg-[#0C0C0E] p-6 rounded-2xl border border-white/5 hover:border-indigo-500/30 text-left transition-all group active:scale-95">
              <Box className="mb-4 text-slate-700 group-hover:text-indigo-500 transition-colors" size={24}/>
              <h3 className="text-white font-bold text-sm uppercase mb-1">{p.name}</h3>
              <p className="text-indigo-400 font-mono text-sm mb-4">Rp{p.price.toLocaleString()}</p>
              <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Stok: {p.stock}</div>
            </button>
          ))}
        </div>
      </main>

      {/* Cart Console */}
      <aside className="w-[380px] border-l border-white/5 bg-[#080808] p-8 flex flex-col shadow-2xl">
        <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-8">Checkout Console</h2>
        <div className="flex-1 space-y-4 overflow-y-auto">
          {cart.map(item => (
            <div key={item.id} className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5 group">
              <div>
                <p className="text-xs font-bold text-white uppercase">{item.name}</p>
                <p className="text-[10px] text-slate-500 font-mono">Rp{item.price.toLocaleString()} x {item.qty}</p>
              </div>
              <button onClick={() => setCart(cart.filter(x => x.id !== item.id))} className="text-slate-600 hover:text-rose-500"><Trash2 size={14}/></button>
            </div>
          ))}
        </div>
        <div className="mt-8 pt-8 border-t border-white/5">
          <div className="flex justify-between items-end mb-6">
            <span className="text-[10px] font-black uppercase text-slate-600">Total Kredit</span>
            <span className="text-3xl font-black text-white tracking-tighter italic">Rp{cart.reduce((a,b) => a+(b.price*b.qty), 0).toLocaleString()}</span>
          </div>
          <button onClick={checkout} disabled={cart.length === 0} className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-black py-4 rounded-xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20">Eksekusi Transaksi</button>
        </div>
      </aside>
    </div>
  );
}