"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ShoppingCart, Search, History, Loader2, X, Settings, ShoppingBag, CheckCircle2, Trash2, Home } from 'lucide-react';

export default function TokopediaPOS() {
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
    <div className="flex flex-col md:flex-row h-screen bg-[#F0F3F7] overflow-hidden text-[#212121]">
      
      {/* SIDEBAR NAV (Desktop) */}
      <nav className="hidden md:flex flex-col w-20 bg-white border-r border-gray-200 py-6 items-center gap-8 z-50">
        <div className="w-12 h-12 bg-[#00AA5B] rounded-xl flex items-center justify-center text-white shadow-md shadow-green-200"><ShoppingBag size={24}/></div>
        <div className="flex flex-col gap-6">
          <Link href="/" className="p-3 text-[#00AA5B] bg-green-50 rounded-xl transition-all border border-green-100"><Home size={24}/></Link>
          <Link href="/history" className="p-3 text-gray-400 hover:text-[#00AA5B] transition-all"><History size={24}/></Link>
          <Link href="/settings" className="p-3 text-gray-400 hover:text-[#00AA5B] transition-all"><Settings size={24}/></Link>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-full overflow-hidden pb-16 md:pb-0">
        <header className="px-6 py-4 bg-white shadow-sm flex flex-col md:flex-row gap-4 items-center z-40">
          <div className="flex w-full md:w-auto justify-between items-center">
            <h1 className="text-xl font-bold text-[#00AA5B] tracking-tight">Rahma<span className="text-[#212121]">pedia.</span></h1>
            <button onClick={() => setIsCartOpen(true)} className="md:hidden relative p-2 text-[#00AA5B] bg-green-50 rounded-lg">
              <ShoppingCart size={20}/>
              {cart.length > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">{cart.length}</span>}
            </button>
          </div>
          <div className="relative w-full max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
            <input onChange={e=>setSearch(e.target.value)} placeholder="Cari di Rahmapedia" className="w-full bg-white border border-gray-300 rounded-lg pl-11 pr-4 py-2 text-sm outline-none focus:border-[#00AA5B] transition-all"/>
          </div>
        </header>

        {/* CATEGORIES */}
        <div className="px-6 py-4 flex gap-2 overflow-x-auto no-scrollbar bg-white shrink-0 border-b border-gray-100">
          {categories.map(c => (
            <button key={c} onClick={()=>setActiveCat(c)} className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${activeCat === c ? 'bg-[#00AA5B] border-[#00AA5B] text-white shadow-md shadow-green-100' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}>{c}</button>
          ))}
        </div>

        {/* PRODUCTS GRID */}
        <div className="flex-1 overflow-y-auto px-4 py-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 content-start">
          {loading ? <Loader2 className="animate-spin mx-auto col-span-full text-[#00AA5B] mt-20" size={32}/> : 
          filtered.map(p=>(
            <button key={p.id} onClick={()=>addToCart(p)} disabled={p.stock<=0} className={`bg-white rounded-xl shadow-tokopedia overflow-hidden text-left transition-all ${p.stock<=0?'opacity-40 grayscale':'active:scale-95'}`}>
              <div className="h-32 bg-gray-50 flex items-center justify-center text-gray-200">
                <ShoppingBag size={48} strokeWidth={1}/>
              </div>
              <div className="p-3">
                <h3 className="text-xs font-normal line-clamp-2 mb-1 h-8 leading-relaxed">{p.name}</h3>
                <p className="text-sm font-bold text-[#212121] mb-1">Rp{p.price.toLocaleString()}</p>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-medium text-gray-400">Stok: {p.stock}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </main>

      {/* CART OVERLAY / SIDEBAR */}
      <div className={`fixed inset-0 z-[100] transition-opacity duration-300 md:relative md:inset-auto md:z-0 md:flex ${isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto'}`}>
        <div className="absolute inset-0 bg-black/40 md:hidden" onClick={() => setIsCartOpen(false)} />
        <aside className={`absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white flex flex-col transition-transform duration-300 transform md:relative md:w-[400px] md:translate-x-0 ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-bold text-gray-800 text-sm">Keranjang Belanja</h2>
            <div className="flex gap-1">
               <button onClick={()=>setCart([])} className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={20}/></button>
               <button onClick={() => setIsCartOpen(false)} className="md:hidden p-2 text-gray-400"><X/></button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
            {cart.map(i=>(
              <div key={i.id} className="flex gap-3 pb-4 border-b border-gray-50">
                <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center text-gray-300"><ShoppingBag size={24}/></div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate uppercase">{i.name}</p>
                  <p className="text-sm font-bold text-[#00AA5B] mt-1">Rp{i.price.toLocaleString()}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <button onClick={() => updateQty(i.id, i.qty - 1, i.stock)} className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-[#00AA5B] hover:bg-green-50">-</button>
                    <span className="text-xs font-bold w-4 text-center">{i.qty}</span>
                    <button onClick={() => updateQty(i.id, i.qty + 1, i.stock)} className="w-7 h-7 rounded-full border border-[#00AA5B] flex items-center justify-center text-white bg-[#00AA5B] shadow-sm shadow-green-100">+</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-4px_10px_rgba(0,0,0,0.03)] space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Total Harga</span>
              <span className="font-bold text-lg text-[#00AA5B]">Rp{total.toLocaleString()}</span>
            </div>
            
            <div className="space-y-3">
              <input type="number" value={cash} onChange={e=>setCash(e.target.value)} placeholder="Masukkan nominal uang..." className="w-full bg-white border border-gray-200 rounded-lg p-3 text-center text-gray-800 font-bold text-lg outline-none focus:border-[#00AA5B]"/>
              <div className="bg-gray-50 rounded-lg p-3 flex justify-between items-center">
                <span className="text-xs text-gray-500">Kembalian</span>
                <span className={`font-bold ${change < 0 ? 'text-red-500' : 'text-gray-800'}`}>Rp{change.toLocaleString()}</span>
              </div>
            </div>

            <button onClick={bayar} disabled={cart.length===0||Number(cash)<total} className="w-full py-4 bg-[#00AA5B] hover:bg-[#009650] text-white rounded-xl font-bold uppercase text-xs tracking-wider transition-all disabled:opacity-30">Bayar Sekarang</button>
          </div>
        </aside>
      </div>

      {/* MOBILE NAV BOTTOM */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-3 z-50">
        <Link href="/" className="flex flex-col items-center gap-1 text-[#00AA5B]"><Home size={20}/><span className="text-[10px] font-medium">Home</span></Link>
        <Link href="/history" className="flex flex-col items-center gap-1 text-gray-400"><History size={20}/><span className="text-[10px] font-medium">Riwayat</span></Link>
        <Link href="/settings" className="flex flex-col items-center gap-1 text-gray-400"><Settings size={20}/><span className="text-[10px] font-medium">Setelan</span></Link>
      </nav>

      {success && (
        <div className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center text-[#00AA5B] animate-in fade-in">
          <CheckCircle2 size={80} className="mb-4 animate-bounce"/>
          <h2 className="text-2xl font-bold text-[#212121]">Transaksi Selesai</h2>
        </div>
      )}
    </div>
  );
}