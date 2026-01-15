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
    setLoading(true);
    const res = await fetch('/api/pos');
    const data = await res.json();
    setProducts(data.products);
    setCategories(["SEMUA", ...data.categories]);
    setLoading(false);
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

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#07080A] text-slate-300 overflow-hidden">
      <style>{`@media print {.no-print {display:none} .print {display:block; font-family:monospace; color:black}} @media screen {.print {display:none}}`}</style>
      
      <div className="print p-4">
        <center>TOKO RAHMA<br/>{new Date().toLocaleString()}<br/>----------------</center>
        {cart.map(i=>(<div key={i.id} className="flex justify-between"><span>{i.name} x{i.qty}</span><span>{(i.price*i.qty).toLocaleString()}</span></div>))}
        <center>----------------<br/>TOTAL: Rp{total.toLocaleString()}<br/>TERIMA KASIH</center>
      </div>

      <nav className="no-print w-full md:w-20 bg-[#0F1218] border-r border-white/5 flex md:flex-col items-center py-6 gap-8 z-50 fixed bottom-0 md:relative">
        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-black mb-4"><ShoppingBag size={20}/></div>
        <Link href="/" className="p-3 text-emerald-500 bg-emerald-500/10 rounded-xl"><ShoppingCart size={24}/></Link>
        <Link href="/history" className="p-3 text-slate-500"><History size={24}/></Link>
        <Link href="/settings" className="p-3 text-slate-500"><Settings size={24}/></Link>
      </nav>

      <main className="no-print flex-1 flex flex-col pb-20 md:pb-0 overflow-hidden">
        <header className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-xl font-black italic text-white uppercase tracking-tighter">Rahma<span className="text-emerald-500">POS.</span></h1>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16}/>
            <input onChange={e=>setSearch(e.target.value)} placeholder="Cari barang..." className="w-full bg-[#0F1218] border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-sm outline-none focus:border-emerald-500/50 transition-all"/>
          </div>
        </header>

        <div className="px-6 flex gap-2 overflow-x-auto no-scrollbar mb-4">
          {categories.map(c => (
            <button key={c} onClick={()=>setActiveCat(c)} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase border transition-all ${activeCat === c ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-white/5 border-white/5 text-slate-500'}`}>{c}</button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {loading ? <Loader2 className="animate-spin mx-auto col-span-full opacity-20"/> : 
          products.filter(p=>(activeCat==="SEMUA"||p.category===activeCat)&&p.name.toLowerCase().includes(search.toLowerCase())).map(p=>(
            <button key={p.id} onClick={()=>addToCart(p)} disabled={p.stock<=0} className={`bg-[#0F1218] border border-white/5 p-4 rounded-[24px] text-left hover:scale-[1.02] transition-all ${p.stock<=0?'opacity-20':'hover:border-emerald-500/50'}`}>
              <span className="text-[9px] font-black text-emerald-500 uppercase block mb-1">{p.category}</span>
              <h3 className="text-white font-bold text-sm uppercase truncate mb-3">{p.name}</h3>
              <div className="flex justify-between items-end">
                <p className="text-lg font-light text-white italic">Rp{p.price.toLocaleString()}</p>
                <p className="text-[9px] font-bold text-slate-600">STOK: {p.stock}</p>
              </div>
            </button>
          ))}
        </div>
      </main>

      <aside className={`no-print fixed md:relative inset-y-0 right-0 w-full md:w-96 bg-[#0F1218] border-l border-white/5 flex flex-col transition-all z-[100] ${isCartOpen?'translate-x-0':'translate-x-full md:translate-x-0'}`}>
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h2 className="font-black text-white italic uppercase text-sm flex items-center gap-2"><ShoppingCart size={18} className="text-emerald-500"/> Keranjang</h2>
          <div className="flex gap-2">
            <button onClick={()=>{if(confirm("Hapus semua?"))setCart([])}} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg"><Trash2 size={18}/></button>
            <button onClick={()=>setIsCartOpen(false)} className="md:hidden p-2 text-slate-500"><X/></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.map(i=>(
            <div key={i.id} className="bg-white/5 p-4 rounded-2xl flex justify-between items-center">
              <div className="min-w-0 flex-1 pr-2">
                <p className="text-xs font-black text-white uppercase truncate">{i.name}</p>
                <p className="text-[10px] text-emerald-500 font-bold mt-1 italic">Rp{i.price.toLocaleString()}</p>
              </div>
              <input type="number" value={i.qty} onChange={e=>updateQty(i.id, e.target.value, i.stock)} className="w-12 bg-black/40 border border-white/10 rounded-lg py-1 text-center text-xs font-black text-white outline-none focus:border-emerald-500"/>
            </div>
          ))}
        </div>
        <div className="p-6 bg-[#14181F] border-t border-white/10 rounded-t-[32px] space-y-4 shadow-2xl">
          <div className="flex justify-between items-end"><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total</span><span className="text-3xl font-light text-white italic tracking-tighter font-mono">Rp{total.toLocaleString()}</span></div>
          <div className="relative">
            <input type="number" value={cash} onChange={e=>setCash(e.target.value)} placeholder="Uang Tunai..." className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-center text-emerald-400 font-black outline-none focus:border-emerald-500"/>
            <div className="text-center mt-2 text-[10px] font-black uppercase text-slate-600 tracking-widest">Kembalian: Rp{change.toLocaleString()}</div>
          </div>
          <button onClick={()=>bayar(false)} disabled={cart.length===0||Number(cash)<total} className="w-full py-4 bg-emerald-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-20">Selesaikan Bayar</button>
        </div>
      </aside>

      {success && <div className="fixed inset-0 z-[200] bg-emerald-500 flex flex-col items-center justify-center text-black animate-in fade-in zoom-in"><CheckCircle2 size={80} className="mb-4 animate-bounce"/><h2 className="text-4xl font-black italic uppercase">BERHASIL!</h2></div>}
    </div>
  );
}