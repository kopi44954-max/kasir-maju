"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ShoppingCart, Search, Plus, Minus, CheckCircle2, History, Trash2, Printer, Loader2, X, Settings } from 'lucide-react';

export default function NexusPOS() {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [cash, setCash] = useState<number | string>("");
  const [success, setSuccess] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const res = await fetch('/api/pos');
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const addToCart = (p: any) => {
    if (p.stock <= 0) return;
    setCart(prev => {
      const exist = prev.find(i => i.id === p.id);
      if (exist) return prev.map(i => i.id === p.id ? { ...i, qty: Math.min(i.qty + 1, p.stock) } : i);
      return [...prev, { ...p, qty: 1 }];
    });
  };

  const total = cart.reduce((acc, i) => acc + (Number(i.price) * i.qty), 0);
  const change = Number(cash) > 0 ? Number(cash) - total : 0;

  const handlePay = async () => {
    const trx = { id: `INV-${Date.now()}`, date: new Date().toLocaleString('id-ID'), totalPrice: total, profit: 0 };
    await fetch('/api/pos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'TRANSACTION', cart, transaction: trx })
    });
    setSuccess(true);
    setTimeout(() => { setSuccess(false); setCart([]); setCash(""); loadData(); }, 1500);
  };

  return (
    <div className="h-screen bg-[#0A0C10] text-slate-300 flex flex-col md:flex-row overflow-hidden">
      <nav className="w-full md:w-20 bg-[#0F1218] border-r border-white/5 flex md:flex-col items-center py-4 md:py-8 gap-6 justify-around md:justify-start shrink-0 z-50">
        <h1 className="text-emerald-500 font-black text-xl mb-4 hidden md:block italic">N</h1>
        <Link href="/history" className="p-3 text-slate-500 hover:text-white transition-all"><History/></Link>
        <Link href="/settings" className="p-3 text-slate-500 hover:text-white transition-all"><Settings/></Link>
      </nav>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-white/5 px-6 flex items-center justify-between">
          <span className="font-black italic text-white">NEO<span className="text-emerald-500 tracking-tighter">POS</span></span>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14}/>
            <input onChange={e => setSearch(e.target.value)} placeholder="Cari..." className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 text-xs outline-none focus:border-emerald-500/50"/>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map(p => (
            <button key={p.id} onClick={() => addToCart(p)} className="bg-[#0F1218] border border-white/5 p-4 rounded-2xl hover:border-emerald-500/30 text-left transition-all">
              <p className="text-[10px] text-slate-500 mb-1 uppercase font-bold">Stok: {p.stock}</p>
              <h3 className="font-bold text-white text-sm mb-4 line-clamp-1">{p.name}</h3>
              <p className="text-emerald-400 font-black text-sm italic">Rp {Number(p.price).toLocaleString()}</p>
            </button>
          ))}
        </div>
      </main>

      <aside className="w-full md:w-96 bg-[#0F1218] border-l border-white/5 flex flex-col shadow-2xl">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <span className="text-xs font-black uppercase tracking-widest">Keranjang</span>
          <ShoppingCart className="text-emerald-500" size={18}/>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.map(i => (
            <div key={i.id} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
              <div className="max-w-[150px]"><p className="text-xs font-bold text-white truncate">{i.name}</p><p className="text-[10px] text-slate-500 italic">Rp{i.price.toLocaleString()}</p></div>
              <div className="flex items-center gap-3">
                <button onClick={() => setCart(cart.map(c => c.id === i.id ? {...c, qty: Math.max(0, c.qty-1)} : c).filter(c => c.qty > 0))} className="text-slate-500"><Minus size={14}/></button>
                <span className="text-xs font-bold text-emerald-500">{i.qty}</span>
                <button onClick={() => addToCart(i)} className="text-slate-500"><Plus size={14}/></button>
              </div>
            </div>
          ))}
        </div>
        <div className="p-6 bg-[#14181F] border-t border-white/10 space-y-4">
          <div className="flex justify-between items-end"><span className="text-[10px] font-bold text-slate-500">TOTAL</span><span className="text-2xl font-black text-emerald-500 italic font-mono">Rp{total.toLocaleString()}</span></div>
          <input type="number" value={cash} onChange={e => setCash(e.target.value)} placeholder="TUNAI..." className="w-full bg-[#0A0C10] border border-white/10 p-4 rounded-xl text-white font-bold outline-none focus:border-emerald-500/50"/>
          <button onClick={handlePay} disabled={total === 0 || Number(cash) < total} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl transition-all disabled:opacity-10 text-xs tracking-widest uppercase">Bayar & Selesai</button>
        </div>
      </aside>

      {success && <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center animate-in fade-in"><div className="text-center"><CheckCircle2 size={64} className="text-emerald-500 mx-auto mb-4 animate-bounce"/><h2 className="text-2xl font-black italic text-white tracking-widest">BERHASIL</h2></div></div>}
    </div>
  );
}