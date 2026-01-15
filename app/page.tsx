"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  ShoppingCart, Search, Plus, Minus, CheckCircle2, 
  History, Trash2, Printer, Loader2, X, Settings 
} from 'lucide-react';

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
      // Ambil kategori unik dari produk
      const uniqueCats = Array.from(new Set((data.products || []).map((p: any) => p.category))).filter(Boolean);
      setCategories(["SADAYA", ...uniqueCats as string[]]);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, []);

  useEffect(() => { setMounted(true); loadData(); }, [loadData]);

  const addToCart = (p: any) => {
    if (p.stock <= 0) return;
    setCart(prev => {
      const exist = prev.find(i => i.id === p.id);
      if (exist) return prev.map(i => i.id === p.id ? { ...i, qty: Math.min(Number(i.qty) + 1, p.stock) } : i);
      return [...prev, { ...p, qty: 1 }];
    });
  };

  const updateQty = (id: number, delta: number, stock: number) => {
    setCart(prev => {
      const updated = prev.map(i => {
        if (i.id === id) {
          const newQty = Math.min(Math.max(0, Number(i.qty) + delta), stock);
          return { ...i, qty: newQty };
        }
        return i;
      });
      return updated.filter(i => i.qty > 0);
    });
  };

  const handleManualInput = (id: number, value: string, stock: number) => {
    if (value === "") {
      setCart(prev => prev.map(i => i.id === id ? { ...i, qty: "" as any } : i));
      return;
    }
    const val = parseInt(value);
    if (isNaN(val)) return;
    const safeVal = Math.min(Math.max(0, val), stock);
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: safeVal } : i));
  };

  const handleBlur = (id: number, qty: any) => {
    if (qty === "" || qty === 0) {
      setCart(prev => prev.filter(i => i.id !== id));
    }
  };

  const total = cart.reduce((acc, i) => acc + (Number(i.price) * (Number(i.qty) || 0)), 0);
  const changeAmount = Number(cash) > 0 ? Number(cash) - total : 0;
  const invoiceNum = mounted ? `INV-${Date.now()}` : '';

  // FUNGSI FINALIZE DENGAN LOGIKA LABA
  const finalizeTransaction = async (shouldPrint: boolean) => {
    if (shouldPrint) setTimeout(() => { window.print(); }, 150);
    
    // Hitung Laba di Sini sebelum dikirim
    let totalProfit = 0;
    cart.forEach(item => {
        const prod = products.find(p => p.id === item.id);
        const modal = Number(prod?.cost || 0);
        const jual = Number(item.price);
        totalProfit += (jual - modal) * Number(item.qty);
    });

    const trx = { 
        id: invoiceNum, 
        items: cart, 
        totalPrice: total, 
        profit: totalProfit, // Kirim profit ke database
        cash: Number(cash), 
        change: changeAmount, 
        date: new Date().toISOString() 
    };

    try {
      const res = await fetch('/api/pos', { 
        method: 'POST', 
        headers: {'Content-Type': 'application/json'}, 
        body: JSON.stringify({ type: 'TRANSACTION', cart, transaction: trx }) 
      });
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
      <style dangerouslySetInnerHTML={{ __html: `
        @media screen { .print-only { display: none !important; } }
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; width: 58mm; background: white; color: black; padding: 4mm; font-family: monospace; font-size: 9pt; }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
      `}} />

      {/* STRUK PRINT */}
      <div className="print-only">
        <center>
          <h2 style={{ margin: 0 }}>TOKO RAHMA</h2>
          <p style={{ fontSize: '8pt' }}>{new Date().toLocaleString('id-ID')}</p>
        </center>
        <div style={{ borderTop: '1px dashed black', margin: '2mm 0' }}></div>
        {cart.map(i => (
          <div key={i.id} style={{ marginBottom: '1mm' }}>
            <div>{i.name.toUpperCase()}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{i.qty} x {Number(i.price).toLocaleString()}</span>
              <span>{(Number(i.price) * Number(i.qty)).toLocaleString()}</span>
            </div>
          </div>
        ))}
        <div style={{ borderTop: '1px dashed black', margin: '2mm 0' }}></div>
        <div style={{ fontWeight: 'bold' }}>TOTAL: Rp {total.toLocaleString()}</div>
        <div>TUNAI: Rp {Number(cash).toLocaleString()}</div>
        <div>KEMBALI: Rp {changeAmount.toLocaleString()}</div>
      </div>

      {/* SIDEBAR NAVIGATION */}
      <nav className="no-print fixed bottom-0 left-0 w-full h-16 md:relative md:w-20 md:h-full bg-[#0F1218] border-t md:border-t-0 md:border-r border-white/5 flex items-center justify-around md:flex-col md:justify-start md:pt-8 md:gap-6 z-[100] shrink-0">
        <Link href="/history" className="p-3 text-slate-500 hover:text-white transition-all hover:bg-white/5 rounded-xl"><History size={22}/></Link>
        <button onClick={() => setIsCartOpen(true)} className="relative p-4 bg-emerald-600 text-white rounded-xl shadow-lg active:scale-95 md:hidden">
          <ShoppingCart size={24}/>
          {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-rose-500 text-[10px] w-5 h-5 rounded-lg flex items-center justify-center font-bold border-2 border-[#0F1218]">{cart.length}</span>}
        </button>
        <Link href="/settings" className="p-3 text-slate-500 hover:text-blue-400 transition-all hover:bg-white/5 rounded-xl"><Settings size={22}/></Link>
      </nav>

      {/* PRODUCT GRID SECTION */}
      <main className="no-print flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 bg-[#0A0C10]/90 backdrop-blur-xl border-b border-white/5 px-6 flex items-center justify-between shrink-0">
          <h1 className="text-lg font-bold text-white tracking-tight">TOKO<span className="text-emerald-500 font-black">RAHMA</span></h1>
          <div className="flex-1 max-w-xs ml-6 relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
             <input type="text" placeholder="Cari produk..." className="w-full pl-10 pr-4 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-sm outline-none focus:border-emerald-500/50 transition-all" onChange={e => setSearch(e.target.value)} />
          </div>
        </header>

        <div className="flex gap-2 p-4 bg-[#0A0C10] overflow-x-auto no-scrollbar shrink-0">
          {categories.map(c => (
            <button key={c} onClick={() => setActiveCat(c)} className={`px-5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap border transition-all ${activeCat === c ? 'bg-emerald-600 border-emerald-500 text-white shadow-md' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}>{c}</button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-24 md:pb-6 no-scrollbar">
          {loading ? (
            <div className="col-span-full py-20 flex justify-center"><Loader2 className="animate-spin text-emerald-500" /></div>
          ) : filtered.map(p => (
            <button key={p.id} onClick={() => addToCart(p)} disabled={p.stock <= 0} className="group h-44 flex flex-col bg-[#0F1218] border border-white/5 p-4 rounded-xl text-left hover:border-emerald-500/30 transition-all disabled:opacity-40">
              <div className="flex justify-between items-start mb-2">
                 <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/5 px-2 py-0.5 rounded-md uppercase">{p.category}</span>
                 <span className="text-[10px] text-slate-500">Stok: {p.stock}</span>
              </div>
              <h3 className="font-semibold text-sm text-white line-clamp-2 mb-2 leading-snug flex-1 uppercase tracking-tight">{p.name}</h3>
              <div className="flex items-center justify-between">
                <p className="font-bold text-white tracking-tight text-sm">Rp{Number(p.price).toLocaleString()}</p>
                <div className="p-1.5 bg-emerald-600/10 text-emerald-500 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-all"><Plus size={14} /></div>
              </div>
            </button>
          ))}
        </div>
      </main>

      {/* CHECKOUT SIDEBAR */}
      <section className={`no-print fixed inset-0 z-[200] md:relative md:inset-auto md:flex md:w-[400px] bg-[#0F1218] md:border-l border-white/5 transition-all duration-500 flex flex-col h-full ${isCartOpen ? 'translate-y-0' : 'translate-y-full md:translate-y-0'}`}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3">
             <ShoppingCart size={20} className="text-emerald-500"/>
             <h2 className="text-sm font-bold text-white uppercase tracking-wider">Checkout</h2>
          </div>
          <button onClick={() => setIsCartOpen(false)} className="md:hidden p-2 text-slate-500"><X size={24}/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3 no-scrollbar">
            {cart.map(i => (
              <div key={i.id} className="bg-white/[0.02] p-4 rounded-xl border border-white/5">
                <div className="flex justify-between items-start mb-3">
                  <p className="text-xs font-bold text-white uppercase line-clamp-1">{i.name}</p>
                  <button onClick={() => setCart(cart.filter(c => c.id !== i.id))} className="text-slate-600 hover:text-rose-500"><Trash2 size={14}/></button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center bg-[#0A0C10] rounded-lg border border-white/5 p-1">
                    <button onClick={() => updateQty(i.id, -1, i.stock)} className="w-7 h-7 flex items-center justify-center hover:bg-white/5 rounded-md text-slate-400"><Minus size={14}/></button>
                    <input 
                      type="number" 
                      inputMode="numeric"
                      value={i.qty} 
                      onChange={(e) => handleManualInput(i.id, e.target.value, i.stock)}
                      onBlur={() => handleBlur(i.id, i.qty)}
                      className="w-10 text-center bg-transparent text-xs font-bold text-white outline-none" 
                    />
                    <button onClick={() => updateQty(i.id, 1, i.stock)} className="w-7 h-7 flex items-center justify-center hover:bg-white/5 rounded-md text-slate-400"><Plus size={14}/></button>
                  </div>
                  <p className="text-sm font-bold text-white italic">Rp{( (Number(i.qty) || 0) * Number(i.price)).toLocaleString()}</p>
                </div>
              </div>
            ))}
        </div>

        <div className="bg-[#14181F] border-t border-white/10 p-6 space-y-4 shrink-0">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase text-slate-500">Total Tagihan</span>
            <span className="text-white font-black text-2xl tracking-tighter italic">Rp{total.toLocaleString()}</span>
          </div>
          
          <div className="space-y-2">
            <input type="number" inputMode="numeric" value={cash} onChange={e => setCash(e.target.value)} placeholder="Uang Tunai..." className="w-full h-12 bg-[#0A0C10] border border-white/10 rounded-xl px-4 text-emerald-500 font-bold text-lg outline-none" />
            <div className="flex justify-between items-center px-4 py-2 bg-white/5 rounded-lg border border-white/5">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Kembalian</span>
              <span className={`text-sm font-bold ${changeAmount >= 0 ? 'text-yellow-500' : 'text-rose-500'}`}>Rp{changeAmount.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => {setCart([]); setCash("");}} className="px-4 py-4 bg-white/5 text-slate-500 rounded-xl text-[10px] font-bold uppercase">Reset</button>
            <button onClick={() => setShowPrintConfirm(true)} disabled={cart.length === 0 || Number(cash) < total} className="flex-1 py-4 bg-emerald-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest disabled:opacity-20 active:scale-95 shadow-lg shadow-emerald-900/20">Proses Bayar</button>
          </div>
        </div>
      </section>

      {/* MODAL PRINT */}
      {showPrintConfirm && (
        <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 no-print">
          <div className="bg-[#0F1218] border border-white/10 w-full max-w-xs rounded-2xl p-6 text-center shadow-2xl">
            <Printer size={32} className="text-emerald-500 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-white mb-6 uppercase tracking-tighter">Konfirmasi Struk</h2>
            <div className="space-y-3">
              <button onClick={() => finalizeTransaction(true)} className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest">Cetak & Simpan</button>
              <button onClick={() => finalizeTransaction(false)} className="w-full py-4 bg-white/5 text-slate-400 rounded-xl font-bold text-xs uppercase border border-white/5">Simpan Saja</button>
              <button onClick={() => setShowPrintConfirm(false)} className="block w-full pt-4 text-[10px] text-slate-600 font-bold uppercase">Batal</button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS */}
      {success && (
        <div className="fixed inset-0 z-[400] bg-[#0A0C10] flex items-center justify-center no-print">
          <div className="text-center">
            <CheckCircle2 size={80} className="text-emerald-500 mx-auto mb-4 animate-pulse" />
            <h2 className="text-xl font-black text-white tracking-widest uppercase italic">Transaksi Sukses</h2>
          </div>
        </div>
      )}
    </div>
  );
}