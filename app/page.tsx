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

  // FUNGSI LOAD DATA DENGAN PENGAMAN (ANTI-ERROR)
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/pos', { cache: 'no-store' });
      const data = await res.json();
      
      // Ambil produk dan pastikan itu array
      const productList = data.products || [];
      setProducts(productList);
      
      // Ambil kategori unik secara otomatis dari produk
      const uniqueCats: string[] = Array.from(new Set(productList.map((p: any) => p.category)));
      setCategories(["SADAYA", ...uniqueCats]);
    } catch (err) { 
      console.error("Gagal memuat data:", err); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { 
    setMounted(true); 
    loadData(); 
  }, [loadData]);

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
          const newQty = Math.min(Math.max(0, (Number(i.qty) || 0) + delta), stock);
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

  const finalizeTransaction = async (shouldPrint: boolean) => {
    if (shouldPrint) setTimeout(() => { window.print(); }, 150);
    const trx = { 
      id: invoiceNum, 
      items: cart, 
      totalPrice: total, 
      cash: Number(cash), 
      change: changeAmount, 
      date: new Date().toLocaleString('id-ID') 
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
        setTimeout(() => { 
          setSuccess(false); 
          setCart([]); 
          setCash(""); 
          setIsCartOpen(false); 
          loadData(); 
        }, 1500);
      }
    } catch (err) { alert("Koneksi gagal!"); }
  };

  if (!mounted) return null;

  const filtered = products.filter(p => 
    (activeCat === "SADAYA" || p.category === activeCat) && 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

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

      {/* STRUK PRINT 58MM */}
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
              <span>{(i.price * i.qty).toLocaleString()}</span>
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

      {/* MAIN CONTENT */}
      <main className="no-print flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 bg-[#0A0C10]/90 backdrop-blur-xl border-b border-white/5 px-6 flex items-center justify-between shrink-0">
          <h1 className="text-lg font-bold text-white tracking-tight italic">TOKO<span className="text-emerald-500 font-black">RAHMA</span></h1>
          <div className="flex-1 max-w-xs ml-6 relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
             <input type="text" placeholder="Cari produk..." className="w-full pl-10 pr-4 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-sm outline-none focus:border-emerald-500/50 transition-all" onChange={e => setSearch(e.target.value)} />
          </div>
        </header>

        <div className="flex gap-2 p-4 bg-[#0A0C10] overflow-x-auto no-scrollbar shrink-0">
          {categories.map(c => (
            <button key={c} onClick={() => setActiveCat(c)} className={`px-5 py-2 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all border ${activeCat === c ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}>{c}</button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-24 md:pb-6 no-scrollbar">
          {loading ? (
            <div className="col-span-full py-20 flex justify-center"><Loader2 className="animate-spin text-emerald-500" /></div>
          ) : filtered.map(p => (
            <button key={p.id} onClick={() => addToCart(p)} disabled={p.stock <= 0} className="group h-44 flex flex-col bg-[#0F1218] border border-white/5 p-4 rounded-xl text-left hover:border-emerald-500/30 transition-all disabled:opacity-40 relative overflow-hidden">
              <div className="flex justify-between items-start mb-2">
                 <span className="text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded uppercase tracking-tighter">{p.category}</span>
                 <span className={`text-[10px] font-bold ${p.stock < 10 ? 'text-rose-500' : 'text-slate-500'}`}>SISA: {p.stock}</span>
              </div>
              <h3 className="font-bold text-xs text-white line-clamp-2 mb-2 leading-snug flex-1 uppercase tracking-tight">{p.name}</h3>
              <div className="flex items-center justify-between">
                <p className="font-black text-white tracking-tighter text-sm italic">Rp{Number(p.price).toLocaleString()}</p>
                <div className="p-1.5 bg-emerald-600/10 text-emerald-500 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-all"><Plus size={14} /></div>
              </div>
            </button>
          ))}
        </div>
      </main>

      {/* CHECKOUT SIDEBAR */}
      <section className={`no-print fixed inset-0 z-[200] md:relative md:inset-auto md:flex md:w-[380px] bg-[#0F1218] md:border-l border-white/5 transition-all duration-500 flex flex-col h-full ${isCartOpen ? 'translate-y-0' : 'translate-y-full md:translate-y-0'}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3">
             <ShoppingCart size={18} className="text-emerald-500"/>
             <h2 className="text-xs font-black text-white uppercase tracking-[0.2em]">Keranjang</h2>
          </div>
          <button onClick={() => setIsCartOpen(false)} className="md:hidden p-2 text-slate-500"><X size={24}/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3 no-scrollbar">
            {cart.map(i => (
              <div key={i.id} className="bg-white/[0.02] p-4 rounded-xl border border-white/5">
                <div className="flex justify-between items-start mb-3">
                  <p className="text-[10px] font-black text-white uppercase line-clamp-1 flex-1 pr-2 tracking-tight">{i.name}</p>
                  <button onClick={() => setCart(cart.filter(c => c.id !== i.id))} className="text-slate-700 hover:text-rose-500 transition-colors"><Trash2 size={14}/></button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center bg-[#0A0C10] rounded-lg border border-white/5 p-1">
                    <button onClick={() => updateQty(i.id, -1, i.stock)} className="w-7 h-7 flex items-center justify-center hover:bg-white/5 rounded-md text-slate-400"><Minus size={12}/></button>
                    <input 
                      type="number" 
                      value={i.qty} 
                      onChange={(e) => handleManualInput(i.id, e.target.value, i.stock)}
                      onBlur={() => handleBlur(i.id, i.qty)}
                      className="w-10 text-center bg-transparent text-xs font-black text-emerald-500 outline-none" 
                    />
                    <button onClick={() => updateQty(i.id, 1, i.stock)} className="w-7 h-7 flex items-center justify-center hover:bg-white/5 rounded-md text-slate-400"><Plus size={12}/></button>
                  </div>
                  <p className="text-sm font-black text-white italic tracking-tighter">Rp{((Number(i.qty) || 0) * i.price).toLocaleString()}</p>
                </div>
              </div>
            ))}
            {cart.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-700 opacity-20 mt-20">
                <ShoppingCart size={64} className="mb-4" />
                <p className="font-black uppercase tracking-widest text-xs">Kosong</p>
              </div>
            )}
        </div>

        {/* PAYMENT FOOTER */}
        <div className="bg-[#14181F] border-t border-white/10 p-6 space-y-4 shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.4)]">
          <div className="flex justify-between items-end">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Total_Tagihan</span>
            <span className="text-emerald-500 font-black text-3xl tracking-tighter italic">Rp{total.toLocaleString()}</span>
          </div>
          
          <div className="space-y-2">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-600">TUNAI</span>
              <input type="number" inputMode="numeric" value={cash} onChange={e => setCash(e.target.value)} className="w-full h-14 bg-[#0A0C10] border border-white/10 rounded-xl pl-16 pr-4 text-white font-black text-xl outline-none focus:border-emerald-500/40 transition-all shadow-inner" placeholder="0" />
            </div>
            <div className="flex justify-between items-center px-4 py-3 bg-white/[0.02] rounded-xl border border-white/5">
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Kembali</span>
              <span className={`text-lg font-black italic tracking-tighter ${changeAmount >= 0 ? 'text-yellow-500' : 'text-rose-500'}`}>Rp{changeAmount.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => {setCart([]); setCash("");}} className="px-5 py-4 bg-white/5 text-slate-600 rounded-xl text-[10px] font-black uppercase hover:bg-rose-500/10 hover:text-rose-500 transition-all">Clear</button>
            <button onClick={() => setShowPrintConfirm(true)} disabled={cart.length === 0 || Number(cash) < total} className="flex-1 py-4 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] disabled:opacity-10 active:scale-95 shadow-xl shadow-emerald-900/40 hover:bg-emerald-500 transition-all">Selesaikan Transaksi</button>
          </div>
        </div>
      </section>

      {/* MODAL PRINT */}
      {showPrintConfirm && (
        <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-md flex items-center justify-center p-6 no-print">
          <div className="bg-[#0F1218] border border-white/10 w-full max-w-xs rounded-3xl p-8 text-center shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
               <Printer size={32} className="text-emerald-500" />
            </div>
            <h2 className="text-sm font-black text-white mb-8 uppercase tracking-[0.3em]">Cetak Struk?</h2>
            <div className="space-y-3">
              <button onClick={() => finalizeTransaction(true)} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/40">Ya, Cetak & Simpan</button>
              <button onClick={() => finalizeTransaction(false)} className="w-full py-4 bg-white/5 text-slate-400 rounded-2xl font-black text-[10px] uppercase border border-white/5 hover:bg-white/10 transition-all">Simpan Tanpa Struk</button>
              <button onClick={() => setShowPrintConfirm(false)} className="block w-full pt-6 text-[9px] text-slate-600 font-black uppercase tracking-widest hover:text-slate-400">Kembali</button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS POPUP */}
      {success && (
        <div className="fixed inset-0 z-[400] bg-[#0A0C10] flex items-center justify-center no-print animate-in fade-in duration-300">
          <div className="text-center">
            <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
               <CheckCircle2 size={48} className="text-emerald-500 animate-bounce" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-[0.3em] uppercase italic">Transaksi Berhasil</h2>
          </div>
        </div>
      )}
    </div>
  );
}