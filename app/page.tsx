"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, Package, Trash2, Zap, Settings, BarChart3, Plus, Minus } from 'lucide-react';

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
    if (res.ok) { setCart([]); load(); alert("TRANS_SUCCESS: Data synced to Nexus."); }
  };

  const total = cart.reduce((a, b) => a + (b.price * b.qty), 0);

  return (
    <div className="min-h-screen bg-[#050505] text-[#94a3b8] flex font-sans selection:bg-indigo-500/30">
      {/* SIDEBAR NEXUS */}
      <nav className="w-24 border-r border-white/[0.05] flex flex-col items-center py-10 gap-12 bg-[#080808] z-50">
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-[0_0_30px_rgba(79,70,229,0.3)] animate-pulse">
          <Zap size={24} fill="currentColor"/>
        </div>
        <div className="flex flex-col gap-8">
          <Link href="/" className="text-indigo-500 bg-indigo-500/10 p-4 rounded-2xl border border-indigo-500/20 transition-all shadow-lg shadow-indigo-500/5">
            <ShoppingBag size={24}/>
          </Link>
          <Link href="/history" className="hover:text-white p-4 transition-all hover:bg-white/5 rounded-2xl">
            <BarChart3 size={24}/>
          </Link>
          <Link href="/settings" className="hover:text-white p-4 transition-all hover:bg-white/5 rounded-2xl">
            <Settings size={24}/>
          </Link>
        </div>
      </nav>

      {/* HUB UTAMA */}
      <main className="flex-1 p-12 overflow-y-auto h-screen bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-white italic">NEXUS<span className="text-indigo-500 not-italic">.</span>POS</h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-600 mt-2">Terminal Transaksi Terenkripsi</p>
          </div>
          <div className="relative w-full md:w-[450px]">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={18}/>
            <input 
              onChange={e => setQuery(e.target.value)}
              placeholder="Cari SKU atau nama produk..." 
              className="w-full bg-[#0C0C0E] border border-white/5 p-5 pl-14 rounded-[2rem] outline-none focus:border-indigo-500/40 transition-all text-sm text-white placeholder:text-slate-700 shadow-inner"
            />
          </div>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.filter((p:any) => p.name.toLowerCase().includes(query.toLowerCase())).map((p: any) => (
            <button 
              key={p.id} 
              onClick={() => addToCart(p)} 
              className="group relative bg-[#0C0C0E] p-8 rounded-[2.5rem] border border-white/[0.03] hover:border-indigo-500/30 text-left transition-all hover:-translate-y-2 active:scale-95 shadow-xl"
            >
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-indigo-500 p-2 rounded-full text-white shadow-glow"><Plus size={16}/></div>
              </div>
              <Package className="mb-6 text-slate-800 group-hover:text-indigo-500 transition-colors" size={32}/>
              <h3 className="text-white font-black text-sm uppercase mb-2 leading-tight group-hover:text-indigo-400 transition-colors">{p.name}</h3>
              <div className="flex justify-between items-end mt-6">
                <p className="text-xl font-black text-white italic tracking-tighter">Rp{Number(p.price).toLocaleString()}</p>
                <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest border-t border-white/5 pt-2">Stock: {p.stock}</div>
              </div>
            </button>
          ))}
        </div>
      </main>

      {/* CONSOLE CHECKOUT */}
      <aside className="w-[450px] border-l border-white/[0.05] bg-[#080808] p-10 flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.5)] z-40">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-600 flex items-center gap-3">
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></span> Cart Console
          </h2>
          <span className="text-[10px] font-bold bg-white/5 px-3 py-1 rounded-full">{cart.length} Items</span>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scroll">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-10 uppercase font-black text-[11px] tracking-[0.5em] text-center italic">
              Terminal Ready<br/>Waiting for input...
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex justify-between items-center bg-[#0C0C0E] p-6 rounded-3xl border border-white/[0.03] group transition-all hover:bg-white/[0.02]">
                <div className="flex-1">
                  <p className="text-xs font-black text-white uppercase tracking-wider mb-1">{item.name}</p>
                  <p className="text-[10px] text-indigo-500 font-bold tracking-widest uppercase">
                    Rp{item.price.toLocaleString()} <span className="text-slate-700 mx-2">/</span> QTY: {item.qty}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setCart(cart.filter(x => x.id !== item.id))} className="text-slate-800 hover:text-rose-500 p-2 transition-colors">
                    <Trash2 size={18}/>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-12 pt-10 border-t border-white/[0.05] space-y-8">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black uppercase text-slate-600 tracking-[0.2em]">Kredit Total</span>
            <span className="text-4xl font-black text-white tracking-tighter italic">
              <span className="text-indigo-500 text-lg not-italic mr-1">Rp</span>{total.toLocaleString()}
            </span>
          </div>
          <button 
            onClick={checkout} 
            disabled={cart.length === 0} 
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-900 disabled:text-slate-700 text-white font-black py-6 rounded-[2rem] text-[11px] uppercase tracking-[0.3em] transition-all shadow-[0_20px_40px_rgba(79,70,229,0.2)] active:scale-95"
          >
            Selesaikan Transaksi
          </button>
        </div>
      </aside>
    </div>
  );
}