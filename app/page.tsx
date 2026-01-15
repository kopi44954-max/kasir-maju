"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Search, Package, Trash2, Zap, Settings, BarChart3, Receipt, X } from 'lucide-react';

export default function NexusTerminal() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("SEMUA");
  const [showReceipt, setShowReceipt] = useState(false);

  const load = async () => {
    const res = await fetch('/api/pos');
    const data = await res.json();
    setProducts(data.products || []);
  };

  useEffect(() => { load(); }, []);

  const addToCart = (p: any) => {
    if (p.stock <= 0) return alert("Stok Habis!");
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
    if (res.ok) { setShowReceipt(true); load(); }
  };

  const categories = ["SEMUA", ...Array.from(new Set(products.map((p: any) => p.category)))];
  const total = cart.reduce((a, b) => a + (b.price * b.qty), 0);

  return (
    <div className="min-h-screen bg-[#050505] text-slate-400 flex font-sans">
      {/* SIDEBAR */}
      <nav className="w-20 border-r border-emerald-500/10 flex flex-col items-center py-8 gap-10 bg-[#080808]">
        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]"><Zap size={20} fill="currentColor"/></div>
        <Link href="/" className="text-emerald-500 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20"><ShoppingCart size={20}/></Link>
        <Link href="/history" className="hover:text-emerald-500 p-3 transition-colors"><BarChart3 size={20}/></Link>
        <Link href="/settings" className="hover:text-emerald-500 p-3 transition-colors"><Settings size={20}/></Link>
      </nav>

      {/* MAIN HUB */}
      <main className="flex-1 p-8 overflow-y-auto h-screen bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-white italic">NEXUS<span className="text-emerald-500 not-italic">.</span>POS</h1>
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-emerald-500/50 mt-1 flex items-center gap-2">🟢 SYSTEM_ONLINE</p>
          </div>
          <div className="relative w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16}/>
            <input onChange={e => setQuery(e.target.value)} placeholder="Search SKU..." className="w-full bg-white/5 border border-white/10 p-3 pl-11 rounded-xl outline-none focus:border-emerald-500/50 text-xs text-white"/>
          </div>
        </header>

        {/* CATEGORY FILTER */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2 no-scrollbar">
          {categories.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)} className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${category === cat ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-white/5 text-slate-500 border-white/5 hover:border-emerald-500/30'}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* GRID PRODUK */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.filter((p:any) => (category === "SEMUA" || p.category === category) && p.name.toLowerCase().includes(query.toLowerCase())).map((p: any) => (
            <button key={p.id} onClick={() => addToCart(p)} className="bg-[#0C0C0E] p-5 rounded-2xl border border-white/5 hover:border-emerald-500/30 text-left transition-all active:scale-95 group">
              <Package className="mb-4 text-slate-700 group-hover:text-emerald-500 transition-colors" size={24}/>
              <h3 className="text-white font-bold text-xs uppercase mb-1 truncate">{p.name}</h3>
              <p className="text-emerald-500 font-black text-sm mb-2">Rp{p.price.toLocaleString()}</p>
              <div className="flex justify-between text-[9px] font-bold text-slate-600 border-t border-white/5 pt-2 uppercase">
                <span>STK: {p.stock}</span>
                <span>{p.category}</span>
              </div>
            </button>
          ))}
        </div>
      </main>

      {/* SIDE CART */}
      <aside className="w-96 border-l border-white/5 bg-[#080808] p-6 flex flex-col shadow-2xl">
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6">Current Session</h2>
        <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scroll">
          {cart.map(item => (
            <div key={item.id} className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
              <div className="flex-1">
                <p className="text-[10px] font-bold text-white uppercase">{item.name}</p>
                <p className="text-[10px] text-emerald-500 font-mono">Rp{item.price.toLocaleString()} x {item.qty}</p>
              </div>
              <button onClick={() => setCart(cart.filter(x => x.id !== item.id))} className="text-slate-600 hover:text-rose-500 p-2"><Trash2 size={14}/></button>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-6 border-t border-white/5">
          <div className="flex justify-between items-end mb-6">
            <span className="text-[10px] font-black uppercase text-slate-600">Total Kredit</span>
            <span className="text-2xl font-black text-white italic tracking-tighter">Rp{total.toLocaleString()}</span>
          </div>
          <button onClick={checkout} disabled={cart.length === 0} className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-black font-black py-4 rounded-xl text-[10px] uppercase tracking-widest transition-all">Selesaikan Transaksi</button>
        </div>
      </aside>

      {/* MODAL STRUK */}
      {showReceipt && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white text-black p-8 w-full max-w-sm rounded-sm font-mono text-xs relative shadow-[0_0_50px_rgba(16,185,129,0.2)]">
            <button onClick={() => {setShowReceipt(false); setCart([]);}} className="absolute -top-10 right-0 text-white flex items-center gap-2 uppercase font-black text-[10px] tracking-widest">Tutup <X size={16}/></button>
            <div className="text-center mb-6">
              <h2 className="font-bold text-lg uppercase tracking-tighter">Nexus Store</h2>
              <p>Terminal POS: 001-A</p>
              <p>{new Date().toLocaleString()}</p>
            </div>
            <div className="border-t border-dashed border-black my-4"></div>
            {cart.map(item => (
              <div key={item.id} className="flex justify-between mb-1">
                <span>{item.name} x{item.qty}</span>
                <span>{(item.price * item.qty).toLocaleString()}</span>
              </div>
            ))}
            <div className="border-t border-dashed border-black my-4"></div>
            <div className="flex justify-between font-bold text-lg">
              <span>TOTAL</span>
              <span>Rp{total.toLocaleString()}</span>
            </div>
            <div className="text-center mt-10">
              <p>TERIMA KASIH</p>
              <p className="text-[8px] mt-2 italic">Nexus POS Powered by Emerald Engine</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}