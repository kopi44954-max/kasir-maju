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

  const bayar = async () => {
    const trx = { id: `TRX-${Date.now()}`, items: cart, totalPrice: total, date: new Date().toISOString() };
    await fetch('/api/pos', { method: 'POST', body: JSON.stringify({ type: 'TRANSACTION', cart, transaction: trx }) });
    setSuccess(true);
    setTimeout(() => { setSuccess(false); setCart([]); setCash(""); loadData(); }, 1500);
  };

  const filtered = products.filter(p => (activeCat === "SEMUA" || p.category === activeCat) && p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#07080A] overflow-hidden selection:bg-emerald-500/30">
      {/* SIDEBAR NAVIGATION */}
      <nav className="w-full md:w-24 bg-[#0F1218] border-r border-white/5 flex md:flex-col items-center py-6 gap-8 z-50 fixed bottom-0 md:relative shadow-2xl">
        <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-black shadow-lg shadow-emerald-500/20"><ShoppingBag size={24}/></div>
        <div className="flex md:flex-col gap-6">
          <Link href="/" className="p-3.5 text-emerald-500 bg-emerald-500/10 rounded-2xl border border-emerald-500/20"><ShoppingCart size={24}/></Link>
          <Link href="/history" className="p-3.5 text-slate-500 hover:text-emerald-500 transition-all"><History size={24}/></Link>
          <Link href="/settings" className="p-3.5 text-slate-500 hover:text-emerald-500 transition-all"><Settings size={24}/></Link>
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col pb-20 md:pb-0">
        <header className="px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-6 bg-[#07080A]/80 backdrop-blur-md sticky top-0 z-40">
          <div>
            <h1 className="text-2xl font-black italic text-white uppercase tracking-tighter">Rahma<span className="text-emerald-500">POS.</span></h1>
            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.3em]">Premium Retail System</p>
          </div>
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18}/>
            <input onChange={e=>setSearch(e.target.value)} placeholder="Cari nama barang..." className="w-full bg-[#0F1218] border border-white/10 rounded-2xl pl-12 pr-6 py-3.5 text-sm outline-none focus:border-emerald-500/50 focus:bg-[#12161d] transition-all"/>
          </div>
        </header>

        <div className="px-8 flex gap-3 overflow-x-auto no-scrollbar shrink-0 mb-6">
          {categories.map(c => (
            <button key={c} onClick={()=>setActiveCat(c)} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${activeCat === c ? 'bg-emerald-600 border-emerald-400 text-white shadow-xl shadow-emerald-600/20' : 'bg-[#0F1218] border-white/5 text-slate-500 hover:border-white/20'}`}>{c}</button>
          ))}
        </div>

        {/* COMPACT PRODUCT GRID */}
        <div className="flex-1 overflow-y-auto px-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 align-start h-fit pb-10">
          {loading ? <Loader2 className="animate-spin mx-auto col-span-full opacity-10 mt-20" size={40}/> : 
          filtered.map(p=>(
            <button key={p.id} onClick={()=>addToCart(p)} disabled={p.stock<=0} className={`group bg-[#0F1218] border border-white/5 p-4 rounded-2xl text-left hover:border-emerald-500/40 transition-all duration-300 h-fit ${p.stock<=0?'opacity-20':'hover:shadow-2xl active:scale-95'}`}>
              <div className="flex justify-between items-start mb-3">
                <span className="bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-md text-[8px] font-black uppercase border border-emerald-500/10">{p.category}</span>
                <span className="text-[9px] font-bold text-slate-600 uppercase italic">Stock {p.stock}</span>
              </div>
              <h3 className="text-white font-bold text-[13px] uppercase leading-tight mb-4 min-h-[32px] line-clamp-2">{p.name}</h3>
              <div className="text-lg font-black text-white tracking-tighter italic border-t border-white/5 pt-3">Rp{p.price.toLocaleString()}</div>
            </button>
          ))}
        </div>
      </main>

      {/* CHECKOUT SIDEBAR */}
      <aside className="w-full md:w-[420px] bg-[#0F1218] border-l border-white/5 flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.5)] z-50">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
          <h2 className="font-black text-white italic uppercase text-sm flex items-center gap-3 tracking-widest"><ShoppingCart size={20} className="text-emerald-500"/> List Order</h2>
          <button onClick={()=>{if(confirm("Kosongkan keranjang?"))setCart([])}} className="text-[10px] font-black text-rose-500/50 hover:text-rose-500 uppercase transition-all">Clear All</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {cart.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center opacity-10 grayscale"><ShoppingBag size={80} strokeWidth={1}/><p className="mt-4 font-black text-xs uppercase tracking-[0.3em]">Belum ada data</p></div>
          ) : cart.map(i=>(
            <div key={i.id} className="bg-black/20 p-4 rounded-2xl flex justify-between items-center border border-white/5 hover:border-white/10 transition-all">
              <div className="min-w-0 flex-1 pr-4">
                <p className="text-[12px] font-bold text-white uppercase truncate">{i.name}</p>
                <p className="text-[10px] text-emerald-500 font-black mt-1">@Rp{i.price.toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-3">
                <input type="number" value={i.qty} onChange={e=>updateQty(i.id, e.target.value, i.stock)} className="w-12 bg-white/5 border border-white/10 rounded-xl py-2 text-center text-xs font-black text-white outline-none focus:border-emerald-500/50"/>
                <button onClick={()=>updateQty(i.id, 0, i.stock)} className="p-2 text-slate-700 hover:text-rose-500 transition-all"><X size={16}/></button>
              </div>
            </div>
          ))}
        </div>

        {/* PAYMENT SECTION - XL CHANGE SIZE */}
        <div className="p-8 bg-[#14181F] border-t border-white/10 rounded-t-[40px] space-y-6">
          <div className="flex justify-between items-end">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Grand Total</span>
            <span className="text-4xl font-light text-white italic tracking-tighter">Rp{total.toLocaleString()}</span>
          </div>
          
          <div className="space-y-4">
            <div className="relative group">
              <label className="absolute -top-2 left-4 px-2 bg-[#14181F] text-[9px] font-black text-emerald-500 uppercase tracking-widest z-10">Tunai Diterima</label>
              <input type="number" value={cash} onChange={e=>setCash(e.target.value)} placeholder="0" className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-center text-emerald-400 font-black text-2xl outline-none focus:border-emerald-500 transition-all"/>
            </div>
            
            <div className="bg-black/20 rounded-2xl p-5 border border-white/5 flex flex-col items-center">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1">Kembalian Anda</span>
              <span className={`text-4xl font-black italic tracking-tighter ${change < 0 ? 'text-rose-500' : 'text-white underline decoration-emerald-500 underline-offset-8'}`}>
                Rp{change.toLocaleString()}
              </span>
            </div>
          </div>

          <button onClick={bayar} disabled={cart.length===0||Number(cash)<total} className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase text-xs tracking-[0.3em] shadow-2xl shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-10">Selesaikan Pembayaran</button>
        </div>
      </aside>

      {/* SUCCESS OVERLAY */}
      {success && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center text-emerald-500 animate-in fade-in duration-500">
          <div className="w-32 h-32 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20 animate-bounce"><CheckCircle2 size={64}/></div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">Transaksi Berhasil</h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.5em] mt-4">Sistem sedang memperbarui stok...</p>
        </div>
      )}
    </div>
  );
}