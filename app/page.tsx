"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ShoppingCart, Search, Plus, Minus, CheckCircle2, History, Printer, Loader2, X, Settings, ShoppingBag } from 'lucide-react';

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

  const filtered = products.filter(p => (activeCat === "SADAYA" || p.category === activeCat) && p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#0A0C10] text-slate-300 font-sans flex flex-col md:flex-row overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: `@media screen { .print-only { display: none !important; } } @media print { .no-print { display: none !important; } .print-only { display: block !important; width: 58mm; color: black; font-family: monospace; font-size: 8pt; } }`}} />

      {/* STRUK STRIP (HIDDEN ON SCREEN) */}
      <div className="print-only p-4">
        <center className="mb-4">
          <h2 className="text-xl font-bold">TOKO RAHMA</h2>
          <p className="text-[10px]">{new Date().toLocaleString('id-ID')}</p>
        </center>
        <div className="border-t border-dashed border-black my-2"></div>
        {cart.map(i => (
          <div key={i.id} className="flex justify-between mb-1">
            <span>{i.name} x{i.qty}</span>
            <span>{(i.price * i.qty).toLocaleString()}</span>
          </div>
        ))}
        <div className="border-t border-dashed border-black my-2"></div>
        <div className="flex justify-between font-bold"><span>TOTAL</span><span>Rp{total.toLocaleString()}</span></div>
        <div className="flex justify-between"><span>TUNAI</span><span>Rp{Number(cash).toLocaleString()}</span></div>
        <div className="flex justify-between"><span>KEMBALI</span><span>Rp{changeAmount.toLocaleString()}</span></div>
        <center className="mt-4">Terima Kasih</center>
      </div>

      {/* NAVBAR */}
      <nav className="no-print h-16 md:h-screen w-full md:w-20 bg-[#0F1218] border-b md:border-b-0 md:border-r border-white/5 flex md:flex-col items-center justify-around md:justify-start md:pt-8 md:gap-8 z-50 fixed bottom-0 md:relative">
        <Link href="/" className="p-3 text-emerald-500 bg-emerald-500/10 rounded-xl"><ShoppingBag size={24}/></Link>
        <Link href="/history" className="p-3 text-slate-500 hover:text-emerald-500"><History size={24}/></Link>
        <Link href="/settings" className="p-3 text-slate-500 hover:text-emerald-500"><Settings size={24}/></Link>
        <button onClick={() => setIsCartOpen(true)} className="md:hidden p-3 text-emerald-500 relative">
          <ShoppingCart size={24}/>
          {cart.length > 0 && <span className="absolute top-2 right-2 w-4 h-4 bg-rose-500 rounded-full text-[10px] flex items-center justify-center text-white">{cart.length}</span>}
        </button>
      </nav>

      {/* MAIN CONTENT */}
      <main className="no-print flex-1 flex flex-col h-screen overflow-hidden pb-16 md:pb-0">
        <header className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0A0C10]/80 backdrop-blur-md border-b border-white/5">
          <h1 className="text-xl font-black text-white italic tracking-tighter uppercase">Nexus<span className="text-emerald-500">POS.</span></h1>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16}/>
            <input 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Cari barang..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 rounded-2xl text-sm border border-transparent focus:border-emerald-500/50 outline-none transition-all"
            />
          </div>
        </header>

        {/* CATEGORIES */}
        <div className="p-4 flex gap-2 overflow-x-auto no-scrollbar shrink-0 bg-[#0A0C10]">
          {categories.map(c => (
            <button 
              key={c} 
              onClick={() => setActiveCat(c)} 
              className={`px-6 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all whitespace-nowrap border ${activeCat === c ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/10'}`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* PRODUCTS GRID */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {loading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-20"><Loader2 className="animate-spin mb-4" size={40}/><p className="font-bold uppercase tracking-widest text-xs">Memuat Data...</p></div>
          ) : filtered.map(p => (
            <button 
              key={p.id} 
              onClick={() => addToCart(p)} 
              disabled={p.stock <= 0}
              className={`group relative bg-[#0F1218] border border-white/5 p-4 rounded-2xl text-left transition-all hover:scale-[1.02] active:scale-95 ${p.stock <= 0 ? 'opacity-40 cursor-not-allowed' : 'hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/10'}`}
            >
              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest block mb-1">{p.category}</span>
              <h3 className="text-sm font-bold text-white uppercase truncate">{p.name}</h3>
              <div className="mt-4 flex justify-between items-end">
                <p className="text-lg font-light text-white tracking-tighter">Rp{p.price.toLocaleString()}</p>
                <p className="text-[10px] text-slate-500 font-bold">Stok: {p.stock}</p>
              </div>
            </button>
          ))}
        </div>
      </main>

      {/* SIDEBAR CART */}
      <aside className={`no-print fixed inset-y-0 right-0 z-[100] w-full md:w-[400px] bg-[#0F1218] border-l border-white/5 flex flex-col transition-transform duration-500 transform ${isCartOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h2 className="font-black text-white italic tracking-widest text-sm uppercase flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-black"><ShoppingCart size={16}/></div>
            Keranjang
          </h2>
          <button onClick={() => setIsCartOpen(false)} className="md:hidden p-2 text-slate-500"><X/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-20 text-center uppercase tracking-widest">
              <ShoppingBag size={48} className="mb-4 text-slate-500"/>
              <p className="text-[10px] font-bold">Keranjang Kosong</p>
            </div>
          ) : cart.map(i => (
            <div key={i.id} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex justify-between items-center group transition-all hover:bg-white/[0.08]">
              <div className="max-w-[180px]">
                <p className="text-xs font-black text-white uppercase truncate">{i.name}</p>
                <p className="text-xs text-emerald-500 font-bold tracking-tight mt-1">Rp{(i.price * i.qty).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-3 bg-black/40 p-1.5 rounded-xl border border-white/5">
                <button onClick={() => updateQty(i.id, -1, i.stock)} className="p-1.5 text-slate-400 hover:text-white transition-colors"><Minus size={14}/></button>
                <span className="text-sm font-black text-white w-4 text-center">{i.qty}</span>
                <button onClick={() => updateQty(i.id, 1, i.stock)} className="p-1.5 text-emerald-500 hover:scale-125 transition-all"><Plus size={14}/></button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 bg-[#14181F] border-t border-white/10 space-y-5 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          <div className="flex justify-between items-end">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Total Tagihan</span>
            <span className="text-3xl font-light text-white tracking-tighter italic">Rp{total.toLocaleString()}</span>
          </div>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 font-bold text-xs uppercase">Cash</div>
            <input 
              type="number" 
              value={cash} 
              onChange={e => setCash(e.target.value)} 
              placeholder="0" 
              className="w-full pl-16 pr-4 py-4 bg-black rounded-2xl border border-white/5 text-emerald-400 text-xl font-bold outline-none focus:border-emerald-500/50 transition-all text-right"
            />
          </div>
          <button 
            onClick={() => setShowPrintConfirm(true)} 
            disabled={cart.length === 0 || Number(cash) < total} 
            className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-600/20 disabled:opacity-10 transition-all transform active:scale-95"
          >
            Selesaikan Bayar
          </button>
        </div>
      </aside>

      {/* MODAL PRINT */}
      {showPrintConfirm && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="bg-[#0F1218] border border-white/10 w-full max-w-sm rounded-[32px] p-8 text-center shadow-2xl">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500">
              <Printer size={40} className="animate-bounce" />
            </div>
            <h2 className="text-xl font-black text-white mb-2 uppercase italic tracking-tighter">Cetak Struk?</h2>
            <p className="text-xs text-slate-500 mb-8 uppercase tracking-widest font-bold">Kembalian: Rp{changeAmount.toLocaleString()}</p>
            <div className="space-y-3">
              <button onClick={() => finalizeTransaction(true)} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-600/20">Cetak & Simpan</button>
              <button onClick={() => finalizeTransaction(false)} className="w-full py-4 bg-white/5 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest border border-white/5">Hanya Simpan</button>
              <button onClick={() => setShowPrintConfirm(false)} className="w-full py-4 text-rose-500 text-xs font-black uppercase tracking-widest">Batal</button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS MESSAGE */}
      {success && (
        <div className="fixed inset-0 z-[300] bg-[#0A0C10] flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
          <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
             <CheckCircle2 size={48} className="text-emerald-500 animate-pulse"/>
          </div>
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Transaksi Berhasil</h2>
        </div>
      )}
    </div>
  );
}