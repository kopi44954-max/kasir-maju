"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ShoppingCart, Search, History, Loader2, X, Settings, ShoppingBag, CheckCircle2, Trash2, Home, ChevronRight } from 'lucide-react';

export default function TokoRahmaPOS() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("SEMUA");
  const [cash, setCash] = useState<number | string>("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // LOAD DATA DENGAN PENGAMAN JSON ERROR
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/pos');
      if (!res.ok) throw new Error("Server error");
      
      const text = await res.text();
      const data = text ? JSON.parse(text) : { products: [], transactions: [] };
      
      setProducts(data.products || []);
      const uniqueCats = Array.from(new Set((data.products || []).map((p: any) => p.category)));
      setCategories(["SEMUA", ...uniqueCats as string[]]);
    } catch (e) { 
      console.error("Gagal load data:", e); 
      setProducts([]);
      setCategories(["SEMUA"]);
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const addToCart = (p: any) => {
    if (p.stock <= 0) return;
    setCart(prev => {
      const ex = prev.find(i => i.id === p.id);
      if (ex) return prev.map(i => i.id === p.id ? { ...i, qty: Math.min(Number(i.qty) + 1, p.stock) } : i);
      return [...prev, { ...p, qty: 1 }];
    });
  };

  const updateQty = (id: any, val: any, stock: any) => {
    if (val === "") {
      setCart(prev => prev.map(i => i.id === id ? { ...i, qty: "" } : i));
      return;
    }
    const q = Math.min(Math.max(0, parseInt(val) || 0), stock);
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: q } : i));
  };

  const handleBlur = () => {
    setCart(prev => prev.filter(i => Number(i.qty) > 0));
  };

  const total = cart.reduce((a, i) => a + (Number(i.price) * (Number(i.qty) || 0)), 0);
  const change = Number(cash) > 0 ? Number(cash) - total : 0;

  const bayar = async () => {
    const trx = { id: `TRX-${Date.now()}`, items: cart, totalPrice: total, date: new Date().toISOString() };
    try {
        await fetch('/api/pos', { method: 'POST', body: JSON.stringify({ type: 'TRANSACTION', cart, transaction: trx }) });
        setSuccess(true);
        setTimeout(() => { setSuccess(false); setCart([]); setCash(""); setIsCartOpen(false); loadData(); }, 1500);
    } catch (e) { alert("Gagal memproses transaksi"); }
  };

  const filtered = products.filter(p => (activeCat === "SEMUA" || p.category === activeCat) && p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#F0F3F7] overflow-hidden text-[#212121] font-sans">
      
      {/* SIDEBAR NAV (Desktop) */}
      <nav className="hidden md:flex flex-col w-20 bg-white border-r border-gray-200 py-6 items-center gap-8 z-50">
        <div className="w-12 h-12 bg-[#00AA5B] rounded-xl flex items-center justify-center text-white shadow-md shadow-green-200"><ShoppingBag size={24}/></div>
        <div className="flex flex-col gap-6">
          <Link href="/" className="p-3 text-[#00AA5B] bg-green-50 rounded-xl transition-all border border-green-100"><Home size={24}/></Link>
          <Link href="/history" className="p-3 text-gray-400 hover:text-[#00AA5B] transition-all"><History size={24}/></Link>
          <Link href="/settings" className="p-3 text-gray-400 hover:text-[#00AA5B] transition-all"><Settings size={24}/></Link>
        </div>
      </nav>

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="px-6 py-4 bg-white shadow-sm flex flex-col md:flex-row gap-4 items-center z-40 shrink-0">
          <div className="flex w-full md:w-auto justify-between items-center">
            <h1 className="text-xl font-bold text-[#00AA5B] tracking-tight whitespace-nowrap">Toko <span className="text-[#212121]">Rahma.</span></h1>
            <div className="md:hidden w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400"><ShoppingBag size={18}/></div>
          </div>
          <div className="relative w-full max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
            <input onChange={e=>setSearch(e.target.value)} placeholder="Cari di Toko Rahma" className="w-full bg-white border border-gray-300 rounded-lg pl-11 pr-4 py-2 text-sm outline-none focus:border-[#00AA5B] transition-all"/>
          </div>
        </header>

        {/* CATEGORIES */}
        <div className="px-6 py-4 flex gap-2 overflow-x-auto no-scrollbar bg-white shrink-0 border-b border-gray-100">
          {categories.map(c => (
            <button key={c} onClick={()=>setActiveCat(c)} className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all whitespace-nowrap ${activeCat === c ? 'bg-[#00AA5B] border-[#00AA5B] text-white shadow-md shadow-green-100' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}>{c}</button>
          ))}
        </div>

        {/* PRODUCT GRID - TEXT MODE & WRAP TEXT */}
        <div className="flex-1 overflow-y-auto px-4 py-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 content-start pb-40 md:pb-10">
          {loading ? (
            <div className="col-span-full flex flex-col items-center mt-20 gap-3">
                <Loader2 className="animate-spin text-[#00AA5B]" size={32}/>
                <p className="text-xs text-gray-400 font-medium">Memuat Produk...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="col-span-full text-center py-20 text-gray-400 text-sm">Produk tidak ditemukan</div>
          ) : filtered.map(p=>(
            <button key={p.id} onClick={()=>addToCart(p)} disabled={p.stock<=0} className={`bg-white rounded-xl border border-gray-200 p-4 text-left transition-all hover:shadow-md hover:border-[#00AA5B]/30 flex flex-col justify-between min-h-[140px] ${p.stock<=0?'opacity-40 grayscale':'active:scale-95'}`}>
              <div className="space-y-2">
                <span className="text-[9px] font-bold text-[#00AA5B] bg-green-50 px-2 py-0.5 rounded uppercase leading-none tracking-tighter">{p.category}</span>
                <h3 className="text-[13px] font-bold text-gray-800 leading-tight break-words uppercase">{p.name}</h3>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-50">
                <p className="text-sm font-black text-[#212121]">Rp{p.price.toLocaleString()}</p>
                <p className="text-[10px] font-medium text-gray-400 mt-0.5">Stok: {p.stock}</p>
              </div>
            </button>
          ))}
        </div>
      </main>

      {/* MOBILE FLOATING CHECKOUT BAR */}
      {cart.length > 0 && !isCartOpen && (
        <div className="md:hidden fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom-6 duration-300">
          <button onClick={() => setIsCartOpen(true)} className="w-full bg-[#00AA5B] shadow-2xl shadow-green-200 rounded-2xl p-4 flex items-center justify-between text-white border-2 border-white/20">
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingCart size={24}/>
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#00AA5B]">{cart.length}</span>
              </div>
              <div className="text-left leading-tight">
                <p className="text-[10px] font-bold opacity-80 uppercase">Total</p>
                <p className="text-base font-bold tracking-tight">Rp{total.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 font-bold text-[10px] uppercase tracking-widest bg-white/20 px-3 py-2 rounded-lg">
              Check Out <ChevronRight size={14}/>
            </div>
          </button>
        </div>
      )}

      {/* CART OVERLAY (SIDEBAR) */}
      <div className={`fixed inset-0 z-[100] transition-opacity duration-300 md:relative md:inset-auto md:z-0 md:flex ${isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto'}`}>
        <div className="absolute inset-0 bg-black/40 md:hidden" onClick={() => setIsCartOpen(false)} />
        <aside className={`absolute right-0 top-0 bottom-0 w-full md:w-[400px] bg-white flex flex-col transition-transform duration-300 transform md:translate-x-0 ${isCartOpen ? 'translate-y-0' : 'translate-y-full md:translate-y-0'}`}>
          <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
            <div className="flex items-center gap-2">
                <ShoppingCart className="text-[#00AA5B]" size={20}/>
                <h2 className="font-bold text-gray-800 text-sm">Keranjang Belanja</h2>
            </div>
            <button onClick={() => setIsCartOpen(false)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><X size={24}/></button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar pb-10">
            {cart.map(i=>(
              <div key={i.id} className="p-3 bg-gray-50/50 rounded-xl border border-gray-100 flex justify-between items-center group">
                <div className="flex-1 min-w-0 pr-3">
                  <p className="text-[11px] font-bold text-gray-800 uppercase leading-tight">{i.name}</p>
                  <p className="text-xs font-bold text-[#00AA5B] mt-1">Rp{i.price.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <input type="number" value={i.qty} onChange={(e) => updateQty(i.id, e.target.value, i.stock)} onBlur={handleBlur} className="w-12 bg-white border border-gray-200 rounded-lg py-1.5 text-center text-xs font-bold outline-none focus:border-[#00AA5B] shadow-sm"/>
                  <button onClick={()=>updateQty(i.id, 0, i.stock)} className="p-1.5 text-gray-300 hover:text-red-500"><Trash2 size={16}/></button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 bg-white border-t border-gray-100 space-y-4 shadow-[0_-10px_20px_rgba(0,0,0,0.03)]">
            <div className="flex justify-between items-center font-bold">
                <span className="text-xs text-gray-400 uppercase tracking-tighter">Ringkasan Pembayaran</span>
                <span className="text-xl text-[#00AA5B]">Rp{total.toLocaleString()}</span>
            </div>
            
            <div className="space-y-2">
              <div className="relative">
                <input type="number" value={cash} onChange={e=>setCash(e.target.value)} placeholder="0" className="w-full bg-gray-50 border-2 border-transparent focus:border-[#00AA5B]/20 rounded-xl pt-7 pb-3 px-4 text-right text-gray-800 font-black text-xl outline-none transition-all"/>
                <span className="absolute left-4 top-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tunai Diterima</span>
              </div>
              <div className="bg-green-50/50 rounded-xl p-3.5 flex justify-between items-center border border-green-100">
                <span className="text-xs text-gray-500 font-bold uppercase">Kembalian</span>
                <span className={`font-black text-lg ${change < 0 ? 'text-red-500' : 'text-[#00AA5B]'}`}>Rp{change.toLocaleString()}</span>
              </div>
            </div>
            <button onClick={bayar} disabled={cart.length===0||Number(cash)<total} className="w-full py-4 bg-[#00AA5B] hover:bg-[#009650] text-white rounded-xl font-bold uppercase text-[11px] tracking-[0.2em] transition-all shadow-lg shadow-green-100 disabled:opacity-30 disabled:shadow-none">Konfirmasi Bayar</button>
          </div>
        </aside>
      </div>

      {/* MOBILE NAV BOTTOM (ALWAYS PERSISTENT) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-3 z-[60] shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <Link href="/" className="flex flex-col items-center gap-1 text-[#00AA5B]"><Home size={20}/><span className="text-[10px] font-bold">Beranda</span></Link>
        <Link href="/history" className="flex flex-col items-center gap-1 text-gray-300"><History size={20}/><span className="text-[10px] font-bold">Transaksi</span></Link>
        <Link href="/settings" className="flex flex-col items-center gap-1 text-gray-300"><Settings size={20}/><span className="text-[10px] font-bold">Inventaris</span></Link>
      </nav>

      {/* SUCCESS MODAL */}
      {success && (
        <div className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center animate-in fade-in duration-300">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 size={64} className="text-[#00AA5B] animate-bounce"/>
          </div>
          <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tighter">Lunas!</h2>
          <p className="text-sm text-gray-400 mt-2">Terima kasih telah belanja di Toko Rahma</p>
        </div>
      )}
    </div>
  );
}