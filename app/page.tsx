"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ShoppingCart, Search, Plus, Minus, CheckCircle2, History, Trash2, Printer, Loader2, X, Settings } from 'lucide-react';

export default function NexusPOS() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("SADAYA");
  const [cash, setCash] = useState<number | string>("");
  const [success, setSuccess] = useState(false);
  const [showPrintConfirm, setShowPrintConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/pos', { cache: 'no-store' });
      const data = await res.json();
      setProducts(data.products || []);
      setCategories(["SADAYA", ...(data.categories || [])]);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, []);

  useEffect(() => { setMounted(true); loadData(); }, [loadData]);

  const addToCart = (p: any) => {
    if (p.stock <= 0) return;
    setCart(prev => {
      const exist = prev.find(i => i.id === p.id);
      if (exist) return prev.map(i => i.id === p.id ? { ...i, qty: Math.min(i.qty + 1, p.stock) } : i);
      return [...prev, { ...p, qty: 1 }];
    });
  };

  const updateQty = (id: number, delta: number, stock: number) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.min(Math.max(0, i.qty + delta), stock) } : i).filter(i => i.qty > 0));
  };

  const total = cart.reduce((acc, i) => acc + (Number(i.price) * (Number(i.qty) || 0)), 0);
  const changeAmount = Number(cash) > 0 ? Number(cash) - total : 0;
  const invoiceNum = `INV-${Date.now()}`;

  const finalizeTransaction = async (shouldPrint: boolean) => {
    if (shouldPrint) setTimeout(() => { window.print(); }, 150);
    const trx = { id: invoiceNum, items: cart, totalPrice: total, cash: Number(cash), change: changeAmount, date: new Date().toISOString() };
    try {
      const res = await fetch('/api/pos', { method: 'POST', body: JSON.stringify({ type: 'TRANSACTION', cart, transaction: trx }) });
      if (res.ok) {
        setShowPrintConfirm(false);
        setSuccess(true);
        setTimeout(() => { setSuccess(false); setCart([]); setCash(""); setIsCartOpen(false); loadData(); }, 1500);
      }
    } catch (err) { alert("Gagal!"); }
  };

  if (!mounted) return null;
  const filtered = products.filter(p => (activeCat === "SADAYA" || p.category === activeCat) && p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="h-screen w-full bg-[#0A0C10] text-slate-300 font-sans select-none overflow-hidden flex flex-col md:flex-row">
      <style dangerouslySetInnerHTML={{ __html: `@media screen { .print-only { display: none !important; } } @media print { .no-print { display: none !important; } .print-only { display: block !important; width: 58mm; background: white; color: black; padding: 4mm; font-family: monospace; font-size: 9pt; } }`}} />

      {/* STRUK */}
      <div className="print-only">
        <center><h2>TOKO RAHMA</h2><p>{new Date().toLocaleString()}</p></center>
        <hr/>
        {cart.map(i => (
          <div key={i.id} className="flex justify-between"><span>{i.name} {i.qty}x</span><span>{(i.price * i.qty).toLocaleString()}</span></div>
        ))}
        <hr/>
        <b>TOTAL: Rp{total.toLocaleString()}</b>
      </div>

      <nav className="no-print fixed bottom-0 left-0 w-full h-16 md:relative md:w-20 md:h-full bg-[#0F1218] border-t md:border-t-0 md:border-r border-white/5 flex items-center justify-around md:flex-col md:justify-start md:pt-8 md:gap-6 z-[100]">
        <Link href="/history" className="p-3 text-slate-500 hover:text-emerald-500"><History size={22}/></Link>
        <button onClick={() => setIsCartOpen(true)} className="p-4 bg-emerald-600 text-white rounded-xl md:hidden"><ShoppingCart size={24}/></button>
        <Link href="/settings" className="p-3 text-slate-500 hover:text-emerald-500"><Settings size={22}/></Link>
      </nav>

      <main className="no-print flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-white/5 px-6 flex items-center justify-between">
          <h1 className="text-lg font-bold text-white">TOKO<span className="text-emerald-500">RAHMA</span></h1>
          <div className="relative w-64"><Search className="absolute left-3 top-2.5 text-slate-500" size={16}/><input onChange={e => setSearch(e.target.value)} placeholder="Cari..." className="w-full pl-10 pr-4 py-2 bg-white/5 rounded-xl text-sm outline-none focus:border-emerald-500 border border-transparent"/></div>
        </header>

        <div className="flex gap-2 p-4 overflow-x-auto no-scrollbar">
          {categories.map(c => (
            <button key={c} onClick={() => setActiveCat(c)} className={`px-5 py-2 rounded-lg text-xs font-bold border transition-all ${activeCat === c ? 'bg-emerald-600 text-white' : 'bg-white/5 text-slate-400'}`}>{c}</button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {loading ? <Loader2 className="animate-spin text-emerald-500 m-auto"/> : filtered.map(p => (
            <button key={p.id} onClick={() => addToCart(p)} className="bg-[#0F1218] border border-white/5 p-4 rounded-xl text-left hover:border-emerald-500/50 transition-all">
              <span className="text-[10px] text-emerald-500 font-bold uppercase">{p.category}</span>
              <h3 className="text-sm font-bold text-white mt-1 truncate uppercase">{p.name}</h3>
              <p className="text-white font-bold mt-2">Rp{p.price.toLocaleString()}</p>
              <p className="text-[10px] text-slate-500 mt-1">Stok: {p.stock}</p>
            </button>
          ))}
        </div>
      </main>

      <aside className={`no-print fixed inset-0 z-[200] md:relative md:w-[400px] bg-[#0F1218] flex flex-col transition-all ${isCartOpen ? 'translate-y-0' : 'translate-y-full md:translate-y-0'}`}>
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h2 className="font-bold text-white flex items-center gap-2"><ShoppingCart size={18} className="text-emerald-500"/> KERANJANG</h2>
          <button onClick={() => setIsCartOpen(false)} className="md:hidden"><X/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {cart.map(i => (
            <div key={i.id} className="bg-white/5 p-4 rounded-xl border border-white/5 flex justify-between items-center">
              <div><p className="text-xs font-bold text-white uppercase">{i.name}</p><p className="text-xs text-emerald-500">Rp{(i.price * i.qty).toLocaleString()}</p></div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQty(i.id, -1, i.stock)} className="p-1 bg-white/5 rounded"><Minus size={14}/></button>
                <span className="text-xs font-bold w-4 text-center">{i.qty}</span>
                <button onClick={() => updateQty(i.id, 1, i.stock)} className="p-1 bg-white/5 rounded"><Plus size={14}/></button>
              </div>
            </div>
          ))}
        </div>
        <div className="p-6 bg-[#14181F] border-t border-white/10 space-y-4">
          <div className="flex justify-between items-end"><span className="text-xs text-slate-500">TOTAL</span><span className="text-2xl font-black text-white italic">Rp{total.toLocaleString()}</span></div>
          <input type="number" value={cash} onChange={e => setCash(e.target.value)} placeholder="Tunai..." className="w-full p-3 bg-black rounded-xl border border-white/10 text-emerald-500 font-bold outline-none focus:border-emerald-500"/>
          <button onClick={() => setShowPrintConfirm(true)} disabled={cart.length === 0 || Number(cash) < total} className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold uppercase disabled:opacity-20 transition-all">Bayar Sekarang</button>
        </div>
      </aside>

      {showPrintConfirm && (
        <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-[#0F1218] border border-white/10 w-full max-w-xs rounded-2xl p-6 text-center">
            <Printer size={32} className="text-emerald-500 mx-auto mb-4" />
            <h2 className="text-white font-bold mb-6">KONFIRMASI STRUK</h2>
            <button onClick={() => finalizeTransaction(true)} className="w-full py-3 bg-emerald-600 text-white rounded-xl mb-3 font-bold">CETAK & SIMPAN</button>
            <button onClick={() => finalizeTransaction(false)} className="w-full py-3 bg-white/5 text-slate-400 rounded-xl font-bold">SIMPAN SAJA</button>
          </div>
        </div>
      )}

      {success && (
        <div className="fixed inset-0 z-[400] bg-[#0A0C10] flex items-center justify-center">
          <div className="text-center"><CheckCircle2 size={80} className="text-emerald-500 mx-auto mb-4 animate-pulse"/><h2 className="text-xl font-black text-white uppercase italic">Transaksi Sukses</h2></div>
        </div>
      )}
    </div>
  );
}