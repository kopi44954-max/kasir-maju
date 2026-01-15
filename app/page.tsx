"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ShoppingCart, Search, History, Loader2, X, Settings, ShoppingBag, CheckCircle2, Trash2 } from 'lucide-react';

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

  const bayar = async () => {
    const trx = { id: `TRX-${Date.now()}`, items: cart, totalPrice: total, date: new Date().toISOString() };
    await fetch('/api/pos', { method: 'POST', body: JSON.stringify({ type: 'TRANSACTION', cart, transaction: trx }) });
    setSuccess(true);
    setTimeout(() => { setSuccess(false); setCart([]); setCash(""); setIsCartOpen(false); loadData(); }, 1500);
  };

  const filtered = products.filter(p => (activeCat === "SEMUA" || p.category === activeCat) && p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#07080A] overflow-hidden">
      
      {/* NAV SIDEBAR (Desktop) / NAV BOTTOM (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 md:relative md:w-20 bg-[#0F1218] border-t md:border-t-0 md:border-r border-white/5 flex md:flex-col items-center justify-around md:justify-start py-4 md:py-8 z-[60] shadow-2xl">
        <div className="hidden md:flex w-12 h-12 bg-emerald-500 rounded-2xl items-center justify-center text-black mb-8 shadow-lg shadow-emerald-500/20"><ShoppingBag size={24}/></div>
        <Link href="/" className="p-3 text-emerald-500 bg-emerald-500/10 rounded-xl border border-emerald-500/20"><ShoppingCart size={24}/></Link>
        <Link href="/history" className="p-3 text-slate-500 hover:text-emerald-500 transition-all"><History size={24}/></Link>
        <Link href="/settings" className="p-3 text-slate-500 hover:text-emerald-500 transition-all"><Settings size={24}/></Link>
      </nav>

      {/* MAIN SECTION */}
      <main className="flex-1 flex flex-col h-full overflow-hidden pb-20 md:pb-0">
        <header className="px-6 py-4 md:px-8 md:py-6 flex flex-col gap-4 bg-[#07080A]">
          <div className="flex justify-between items-center">
            <h1 className="text-xl md:text-2xl font-black italic text-white uppercase tracking-tighter">Rahma<span className="text-emerald-500">POS.</span></h1>
            {/* Cart Trigger Mobile */}
            <button onClick={() => setIsCartOpen(true)} className="md:hidden relative p-2 bg-emerald-500 text-black rounded-xl">
              <ShoppingCart size={20}/>
              {cart.length > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-emerald-500">{cart.length}</span>}
            </button>
          </div>
          <div className="relative group w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18}/>
            <input onChange={e=>setSearch(e.target.value)} placeholder="Cari barang..." className="w-full bg-[#0F1218] border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm outline-none focus:border-emerald-500/50 transition-all"/>
          </div>
        </header>

        {/* CATEGORIES */}
        <div className="px-6 md:px-8 flex gap-2 overflow-x-auto no-scrollbar shrink-0 mb-4">
          {categories.map(c => (
            <button key={c} onClick={()=>setActiveCat(c)} className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all whitespace-nowrap ${activeCat === c ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-[#0F1218] border-white/5 text-slate-500'}`}>{c}</button>
          ))}
        </div>

        {/* PRODUCTS GRID */}
        <div className="flex-1 overflow-y-auto px-6 md:px-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4 pb-10 content-start">
          {loading ? <Loader2 className="animate-spin mx-auto col-span-full opacity-20 mt-20" size={32}/> : 
          filtered.map(p=>(
            <button key={p.id} onClick={()=>addToCart(p)} disabled={p.stock<=0} className={`group bg-[#0F1218] border border-white/5 p-3 md:p-4 rounded-2xl text-left transition-all ${p.stock<=0?'opacity-20':'active:scale-95 shadow-lg hover:border-emerald-500/30'}`}>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[8px] font-black text-emerald-500 uppercase">{p.category}</span>
                <span className="text-[8px] font-bold text-slate-600 italic">S: {p.stock}</span>
              </div>
              <h3 className="text-white font-bold text-xs uppercase line-clamp-2 mb-3 h-8 leading-tight">{p.name}</h3>
              <p className="text-sm md:text-base font-black text-white italic tracking-tight">Rp{p.price.toLocaleString()}</p>
            </button>
          ))}
        </div>
      </main>

      {/* CART ASIDE (Responsive: Slide-in Mobile, Sidebar Desktop) */}
      <div className={`fixed inset-0 z-[100] transition-opacity duration-300 md:relative md:inset-auto md:z-0 md:flex ${isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto'}`}>
        <div className="absolute inset-0 bg-black/60 md:hidden" onClick={() => setIsCartOpen(false)} />
        <aside className={`absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-[#0F1218] border-l border-white/5 flex flex-col transition-transform duration-300 transform md:relative md:w-[380px] md:translate-x-0 ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <h2 className="font-bold text-white italic uppercase text-xs flex items-center gap-2"><ShoppingCart size={16} className="text-emerald-500"/> Keranjang</h2>
            <div className="flex gap-2">
              <button onClick={()=>{if(confirm("Reset?"))setCart([])}} className="p-2 text-rose-500/50 hover:text-rose-500"><Trash2 size={18}/></button>
              <button onClick={() => setIsCartOpen(false)} className="md:hidden p-2 text-slate-400"><X/></button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
            {cart.map(i=>(
              <div key={i.id} className="bg-white/5 p-3 rounded-xl flex justify-between items-center border border-white/5">
                <div className="min-w-0 flex-1 pr-3">
                  <p className="text-[11px] font-bold text-white uppercase truncate">{i.name}</p>
                  <p className="text-[10px] text-emerald-500 font-black">Rp{i.price.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <input type="number" value={i.qty} onChange={e=>updateQty(i.id, e.target.value, i.stock)} className="w-10 bg-black/40 border border-white/10 rounded-lg py-1.5 text-center text-[11px] font-bold text-white outline-none"/>
                  <button onClick={()=>updateQty(i.id, 0, i.stock)} className="text-slate-700 hover:text-rose-500"><X size={14}/></button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 bg-[#14181F] border-t border-white/10 rounded-t-3xl space-y-4 shadow-2xl">
            <div className="flex justify-between items-end"><span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tagihan</span><span className="text-2xl font-black text-white italic">Rp{total.toLocaleString()}</span></div>
            <div className="space-y-3">
              <input type="number" value={cash} onChange={e=>setCash(e.target.value)} placeholder="Tunai..." className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-center text-emerald-400 font-bold text-lg outline-none focus:border-emerald-500"/>
              <div className="bg-black/20 rounded-xl p-3 border border-white/5 text-center">
                <p className="text-[9px] font-bold text-slate-600 uppercase mb-1">Kembali</p>
                <p className="text-2xl font-black italic text-white underline decoration-emerald-500 underline-offset-4">Rp{change.toLocaleString()}</p>
              </div>
            </div>
            <button onClick={bayar} disabled={cart.length===0||Number(cash)<total} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black uppercase text-[10px] tracking-[0.2em] transition-all active:scale-95 disabled:opacity-20">Selesaikan Pembayaran</button>
          </div>
        </aside>
      </div>

      {success && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center text-emerald-500 animate-in fade-in duration-300">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 border border-emerald-500/20 animate-bounce"><CheckCircle2 size={40}/></div>
          <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Berhasil</h2>
        </div>
      )}
    </div>
  );
}