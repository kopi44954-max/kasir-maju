"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ShoppingCart, Search, Plus, Minus, CheckCircle2, History, Printer, Loader2, X, Settings, ShoppingBag, LayoutGrid } from 'lucide-react';

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

  useEffect(() => { loadData(); }, [loadData]);

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

  const finalize = async (shouldPrint: boolean) => {
    if (shouldPrint) window.print();
    const trx = { id: `INV-${Date.now()}`, items: cart, totalPrice: total, cash: Number(cash), change: changeAmount, date: new Date().toISOString() };
    await fetch('/api/pos', { method: 'POST', body: JSON.stringify({ type: 'TRANSACTION', cart, transaction: trx }) });
    setSuccess(true);
    setTimeout(() => { setSuccess(false); setCart([]); setCash(""); setIsCartOpen(false); loadData(); setShowPrintConfirm(false); }, 1500);
  };

  const filtered = products.filter(p => (activeCat === "SADAYA" || p.category === activeCat) && p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#07080A] text-slate-300 overflow-hidden font-sans">
      <style dangerouslySetInnerHTML={{ __html: `@media print { .no-print { display: none !important; } .print-only { display: block !important; font-family: monospace; } } @media screen { .print-only { display: none !important; } }` }} />

      {/* STRUK */}
      <div className="print-only p-4 text-black bg-white w-[58mm] text-[10px]">
        <center className="font-bold border-b pb-2 mb-2">TOKO RAHMA<br/>STruk Digital</center>
        {cart.map(i => (
          <div key={i.id} className="flex justify-between"><span>{i.name} x{i.qty}</span><span>{(i.price * i.qty).toLocaleString()}</span></div>
        ))}
        <div className="border-t mt-2 pt-2 font-bold flex justify-between"><span>TOTAL</span><span>{total.toLocaleString()}</span></div>
      </div>

      {/* NAV SIDEBAR */}
      <aside className="no-print w-full md:w-24 bg-[#0F1218] border-b md:border-b-0 md:border-r border-white/5 flex md:flex-col items-center justify-between md:justify-start p-4 md:py-8 gap-8 z-50">
        <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <ShoppingBag className="text-black" size={24} />
        </div>
        <div className="flex md:flex-col gap-6">
          <Link href="/" className="p-3 bg-white/5 text-emerald-500 rounded-2xl transition-all shadow-inner"><LayoutGrid size={24}/></Link>
          <Link href="/history" className="p-3 text-slate-500 hover:text-emerald-500 transition-all"><History size={24}/></Link>
          <Link href="/settings" className="p-3 text-slate-500 hover:text-emerald-500 transition-all"><Settings size={24}/></Link>
        </div>
        <button onClick={() => setIsCartOpen(true)} className="md:hidden relative p-3 text-slate-400">
          <ShoppingCart size={24}/>
          {cart.length > 0 && <span className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">{cart.length}</span>}
        </button>
      </aside>

      {/* MAIN VIEW */}
      <main className="no-print flex-1 flex flex-col min-w-0">
        <header className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic">Emerald<span className="text-emerald-500">POS.</span></h1>
            <p className="text-[10px] font-bold text-slate-600 tracking-[0.3em] uppercase mt-1">Sistem Kasir v2.0</p>
          </div>
          <div className="relative group max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500 transition-colors" size={18} />
            <input 
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari produk Anda..." 
              className="w-full bg-[#0F1218] border border-white/5 rounded-[20px] pl-12 pr-6 py-3.5 text-sm outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all"
            />
          </div>
        </header>

        <div className="px-6 pb-4 flex gap-3 overflow-x-auto no-scrollbar shrink-0">
          {categories.map(c => (
            <button 
              key={c} 
              onClick={() => setActiveCat(c)}
              className={`px-6 py-2.5 rounded-2xl text-[10px] font-black tracking-widest uppercase border transition-all ${activeCat === c ? 'bg-emerald-600 border-emerald-400 text-white shadow-xl shadow-emerald-600/20' : 'bg-[#0F1218] border-white/5 text-slate-500 hover:border-white/20'}`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 items-start">
          {loading ? (
            <div className="col-span-full py-20 text-center animate-pulse text-slate-700 uppercase font-black text-xs tracking-widest">Memuat Data...</div>
          ) : filtered.map(p => (
            <button 
              key={p.id} 
              onClick={() => addToCart(p)}
              disabled={p.stock <= 0}
              className={`group bg-[#0F1218] border border-white/5 p-5 rounded-[28px] text-left transition-all hover:scale-[1.03] active:scale-95 ${p.stock <= 0 ? 'opacity-30' : 'hover:border-emerald-500/50 hover:bg-[#12161d]'}`}
            >
              <div className="mb-4 flex justify-between items-start">
                <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border border-emerald-500/10">{p.category}</span>
                {p.stock <= 5 && <span className="text-rose-500 text-[9px] font-bold uppercase animate-pulse">Limit</span>}
              </div>
              <h3 className="text-white font-bold text-sm uppercase truncate mb-1 tracking-tight">{p.name}</h3>
              <p className="text-[10px] text-slate-500 font-bold mb-4 uppercase">Stok: {p.stock}</p>
              <div className="text-xl font-light text-white tracking-tighter italic">Rp{p.price.toLocaleString()}</div>
            </button>
          ))}
        </div>
      </main>

      {/* CHECKOUT SIDEBAR */}
      <aside className={`no-print fixed inset-y-0 right-0 w-full md:relative md:w-[420px] bg-[#0F1218] border-l border-white/5 z-[100] flex flex-col transition-transform duration-500 ${isCartOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
          <div>
            <h2 className="text-white font-black uppercase tracking-tighter flex items-center gap-3 italic">
              <ShoppingCart size={20} className="text-emerald-500" /> My Cart
            </h2>
            <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-1">Item Terpilih: {cart.length}</p>
          </div>
          <button onClick={() => setIsCartOpen(false)} className="md:hidden p-3 bg-white/5 rounded-2xl text-slate-400 hover:text-white transition-all"><X size={20}/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-10">
              <ShoppingBag size={80} strokeWidth={1} />
              <p className="font-black uppercase text-xs tracking-widest mt-4 italic">Belum Ada Barang</p>
            </div>
          ) : cart.map(i => (
            <div key={i.id} className="bg-white/5 p-4 rounded-[24px] border border-white/5 flex items-center justify-between group">
              <div className="flex-1 min-w-0 pr-4">
                <h4 className="text-xs font-black text-white uppercase truncate">{i.name}</h4>
                <p className="text-[10px] text-emerald-500 font-bold mt-1 tracking-tight">@Rp{i.price.toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-3 bg-black/40 p-1.5 rounded-2xl border border-white/5">
                <button onClick={() => updateQty(i.id, -1, i.stock)} className="p-2 text-slate-500 hover:text-white transition-all hover:bg-white/5 rounded-xl"><Minus size={14}/></button>
                <span className="text-xs font-black text-white w-4 text-center">{i.qty}</span>
                <button onClick={() => updateQty(i.id, 1, i.stock)} className="p-2 text-emerald-500 hover:scale-110 transition-all hover:bg-emerald-500/10 rounded-xl"><Plus size={14}/></button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-8 bg-[#14181F] border-t border-white/10 rounded-t-[40px] shadow-2xl space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Amount</span>
              <span className="text-4xl font-light text-white italic tracking-tighter">Rp{total.toLocaleString()}</span>
            </div>
          </div>
          <div className="relative group">
            <label className="absolute -top-2 left-4 px-2 bg-[#14181F] text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] z-10">Payment Amount</label>
            <input 
              type="number" 
              value={cash}
              onChange={e => setCash(e.target.value)}
              placeholder="Input Tunai..."
              className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-xl font-black text-emerald-400 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all text-center"
            />
          </div>
          <button 
            onClick={() => setShowPrintConfirm(true)}
            disabled={cart.length === 0 || Number(cash) < total}
            className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-emerald-600/20 disabled:opacity-10 transition-all active:scale-95"
          >
            Selesaikan Bayar
          </button>
        </div>
      </aside>

      {/* MODAL PRINT */}
      {showPrintConfirm && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="bg-[#0F1218] border border-white/10 w-full max-w-sm rounded-[40px] p-10 text-center shadow-2xl animate-in zoom-in duration-300">
            <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/20">
              <Printer size={40} className="text-emerald-500" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2 uppercase italic">Print Bill?</h2>
            <div className="bg-white/5 p-4 rounded-2xl mb-8 flex justify-between items-center border border-white/5">
              <span className="text-xs font-bold text-slate-500 uppercase">Kembalian</span>
              <span className="text-lg font-black text-emerald-400 italic">Rp{changeAmount.toLocaleString()}</span>
            </div>
            <div className="space-y-4">
              <button onClick={() => finalize(true)} className="w-full py-5 bg-emerald-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 transition-all hover:bg-emerald-500">Cetak & Simpan</button>
              <button onClick={() => finalize(false)} className="w-full py-5 bg-white/5 text-slate-400 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all">Simpan Saja</button>
              <button onClick={() => setShowPrintConfirm(false)} className="w-full py-2 text-rose-500 text-[10px] font-black uppercase tracking-widest hover:opacity-50 transition-all">Batal</button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS POPUP */}
      {success && (
        <div className="fixed inset-0 z-[300] bg-[#07080A]/95 backdrop-blur-3xl flex flex-col items-center justify-center animate-in fade-in duration-500">
          <div className="w-32 h-32 bg-emerald-500/20 rounded-full flex items-center justify-center mb-8 border border-emerald-500/20 animate-bounce">
            <CheckCircle2 size={60} className="text-emerald-500" />
          </div>
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">SUCCESS!</h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.5em] mt-2">Data Tersimpan ke Cloud</p>
        </div>
      )}
    </div>
  );
}