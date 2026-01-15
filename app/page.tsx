"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ShoppingCart, Search, Plus, Minus, CheckCircle2, History, Printer, Loader2, X, Settings, ShoppingBag, Trash2 } from 'lucide-react';

export default function NexusPOS() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("SEMUA");
  const [cash, setCash] = useState<number | string>("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const res = await fetch('/api/pos');
      const data = await res.json();
      setProducts(data.products || []);
      setCategories(["SEMUA", ...(data.categories || [])]);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const addToCart = (p: any) => {
    if (p.stock <= 0) return;
    setCart(prev => {
      const ex = prev.find(i => i.id === p.id);
      if (ex) return prev.map(i => i.id === p.id ? { ...i, qty: Math.min(i.qty + 1, p.stock) } : i);
      return [...prev, { ...p, qty: 1 }];
    });
  };

  const updateQty = (id: any, val: any, stock: any) => {
    const q = Math.min(Math.max(0, parseInt(val) || 0), stock);
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: q } : i).filter(i => i.qty > 0));
  };

  const total = cart.reduce((a, i) => a + (i.price * i.qty), 0);
  const change = Number(cash) > 0 ? Number(cash) - total : 0;

  const bayar = async (print: boolean) => {
    if (print) window.print();
    const trx = { id: `TRX-${Date.now()}`, items: cart, totalPrice: total, date: new Date().toISOString() };
    await fetch('/api/pos', { method: 'POST', body: JSON.stringify({ type: 'TRANSACTION', cart, transaction: trx }) });
    setSuccess(true);
    setTimeout(() => { setSuccess(false); setCart([]); setCash(""); setIsCartOpen(false); loadData(); }, 1500);
  };

  const filtered = products.filter(p => (activeCat === "SEMUA" || p.category === activeCat) && p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#07080A] overflow-hidden">
      <style>{`@media print {.no-print {display:none} .print {display:block; font-family:monospace; color:black}} @media screen {.print {display:none}}`}</style>
      
      <nav className="no-print w-full md:w-20 bg-[#0F1218] border-r border-white/5 flex md:flex-col items-center py-4 gap-6 z-50 fixed bottom-0 md:relative">
        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-black mb-2"><ShoppingBag size={20}/></div>
        <Link href="/" className="p-3 text-emerald-500 bg-emerald-500/10 rounded-xl transition-all"><ShoppingCart size={22}/></Link>
        <Link href="/history" className="p-3 text-slate-500 hover:text-emerald-500"><History size={22}/></Link>
        <Link href="/settings" className="p-3 text-slate-500 hover:text-emerald-500"><Settings size={22}/></Link>
      </nav>

      <main className="flex-1 flex flex-col pb-16 md:pb-0 overflow-hidden">
        <header className="p-5 flex justify-between items-center">
          <h1 className="text-xl font-extrabold italic text-white uppercase tracking-tighter">Rahma<span className="text-emerald-500">POS</span></h1>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={16}/>
            <input onChange={e=>setSearch(e.target.value)} placeholder="Cari barang..." className="w-full bg-[#0F1218] border border-white/5 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:border-emerald-500/50 transition-all"/>
          </div>
        </header>

        <div className="px-5 flex gap-2 overflow-x-auto no-scrollbar mb-4 shrink-0">
          {categories.map(c => (
            <button key={c} onClick={()=>setActiveCat(c)} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase border transition-all ${activeCat === c ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-white/5 border-white/5 text-slate-500'}`}>{c}</button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 align-start h-fit">
          {loading ? <Loader2 className="animate-spin mx-auto col-span-full opacity-20 mt-10"/> : 
          filtered.map(p=>(
            <button key={p.id} onClick={()=>addToCart(p)} disabled={p.stock<=0} className={`bg-[#0F1218] border border-white/5 p-3.5 rounded-xl text-left hover:border-emerald-500/50 transition-all h-fit ${p.stock<=0?'opacity-20':'active:scale-95'}`}>
              <div className="flex justify-between mb-1.5">
                <span className="text-[8px] font-bold text-emerald-500 uppercase">{p.category}</span>
                <span className="text-[8px] font-bold text-slate-600 uppercase">Stok: {p.stock}</span>
              </div>
              <h3 className="text-white font-semibold text-xs uppercase truncate mb-2">{p.name}</h3>
              <p className="text-base font-bold text-white tracking-tight italic">Rp{p.price.toLocaleString()}</p>
            </button>
          ))}
        </div>
      </main>

      <aside className={`no-print fixed md:relative inset-y-0 right-0 w-full md:w-80 bg-[#0F1218] border-l border-white/5 flex flex-col transition-all z-[100] ${isCartOpen?'translate-x-0':'translate-x-full md:translate-x-0'}`}>
        <div className="p-5 border-b border-white/5 flex justify-between items-center">
          <h2 className="font-bold text-white italic uppercase text-xs flex items-center gap-2"><ShoppingCart size={14} className="text-emerald-500"/> Keranjang</h2>
          <button onClick={()=>{if(confirm("Hapus semua?"))setCart([])}} className="text-[10px] font-bold text-rose-500 uppercase hover:opacity-50">Reset</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {cart.map(i=>(
            <div key={i.id} className="bg-white/5 p-3 rounded-xl flex justify-between items-center border border-white/5">
              <div className="min-w-0 flex-1 pr-2">
                <p className="text-[11px] font-bold text-white uppercase truncate">{i.name}</p>
                <p className="text-[10px] text-emerald-500 font-bold italic">Rp{i.price.toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <input type="number" value={i.qty} onChange={e=>updateQty(i.id, e.target.value, i.stock)} className="w-10 bg-black/40 border border-white/10 rounded-lg py-1 text-center text-[11px] font-bold text-white outline-none focus:border-emerald-500"/>
                <button onClick={()=>updateQty(i.id, 0, i.stock)} className="text-slate-600 hover:text-rose-500"><X size={14}/></button>
              </div>
            </div>
          ))}
        </div>
        <div className="p-5 bg-[#14181F] border-t border-white/10 rounded-t-2xl space-y-4">
          <div className="flex justify-between items-end"><span className="text-[9px] font-bold text-slate-500 uppercase">Tagihan</span><span className="text-2xl font-bold text-white italic">Rp{total.toLocaleString()}</span></div>
          <div className="space-y-2">
            <input type="number" value={cash} onChange={e=>setCash(e.target.value)} placeholder="Tunai..." className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-center text-emerald-400 font-bold text-lg outline-none focus:border-emerald-500"/>
            <div className="flex justify-between text-[10px] font-bold uppercase text-slate-600 px-1"><span>Kembali</span><span>Rp{change.toLocaleString()}</span></div>
          </div>
          <button onClick={()=>bayar(false)} disabled={cart.length===0||Number(cash)<total} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest active:scale-95 transition-all disabled:opacity-20">Bayar Sekarang</button>
        </div>
      </aside>

      {success && <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center text-emerald-500 animate-in fade-in"><CheckCircle2 size={60} className="mb-4 animate-bounce"/><h2 className="text-2xl font-black italic uppercase">Sukses!</h2></div>}
    </div>
  );
}