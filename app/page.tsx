"use client";
import React, { useState, useEffect } from 'react';
import { Search, Home, Settings, Receipt, Plus, Minus, Trash2, Package, ShoppingBag, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function KasirGlass() {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [bayarNominal, setBayarNominal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showCartMobile, setShowCartMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const [printData, setPrintData] = useState<any>({
    items: [],
    total: 0,
    cash: 0,
    change: 0,
    date: ""
  });

  useEffect(() => {
    setIsMounted(true);
    fetch('/api/pos').then(res => res.json()).then(data => setProducts(data.products || []));
  }, []);

  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const totalModal = cart.reduce((sum, item) => sum + (Number(item.cost || 0) * item.qty), 0);
  const kembalian = bayarNominal - total;

  const addToCart = (p: any) => {
    const exist = cart.find(item => item.id === p.id);
    if (exist) {
      setCart(cart.map(item => item.id === p.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...p, qty: 1 }]);
    }
  };

  const removeFromCart = (id: any) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateQtyManual = (id: any, value: string) => {
    const newQty = value === "" ? 0 : parseInt(value);
    setCart(cart.map(item => item.id === id ? { ...item, qty: isNaN(newQty) ? 0 : newQty } : item));
  };

  const finalize = async (shouldPrint: boolean) => {
    const validCart = cart.filter(item => item.qty > 0);
    if (validCart.length === 0) return alert("Keranjang kosong!");

    const currentTransaction = {
      items: [...validCart],
      total: total,
      cash: bayarNominal,
      change: kembalian,
      date: new Date().toLocaleString('id-ID')
    };
    setPrintData(currentTransaction);

    const res = await fetch('/api/pos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'TRANSACTION', 
        cart: validCart,
        transaction: { 
          items: validCart, 
          total, 
          profit: total - totalModal, 
          cash: bayarNominal, 
          change: kembalian, 
          date: new Date().toISOString() 
        }
      })
    });

    if (res.ok) {
      if (shouldPrint) {
        setTimeout(() => {
          window.print();
          resetApp();
        }, 800);
      } else {
        resetApp();
      }
    }
  };

  const resetApp = () => {
    setCart([]);
    setBayarNominal(0);
    setShowModal(false);
    fetch('/api/pos').then(res => res.json()).then(data => setProducts(data.products || []));
  };

  if (!isMounted) return null;

  return (
    <div className="h-screen bg-slate-50 flex flex-col md:flex-row font-sans overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden !important; }
          #section-to-print, #section-to-print * { visibility: visible !important; }
          #section-to-print { 
            position: absolute !important; 
            left: 0 !important; 
            top: 0 !important; 
            width: 100% !important; 
            display: block !important;
            background: white;
          }
          .no-print { display: none !important; }
          @page { size: auto; margin: 5mm; }
        }
      `}} />

      {/* STRUK AREA */}
      <div id="section-to-print" className="hidden print:block p-4 text-black font-mono text-[12px] leading-tight">
        <div className="text-center border-b border-dashed border-black pb-2 mb-2">
          <h2 className="font-bold text-sm uppercase">Toko Maju</h2>
          <p className="text-[10px]">{printData.date}</p>
        </div>
        <div className="space-y-1 mb-2 border-b border-dashed border-black pb-2">
          {printData.items.map((item: any, i: number) => (
            <div key={i} className="flex flex-col mb-1">
              <span className="uppercase">{item.name}</span>
              <div className="flex justify-between pl-2">
                <span>{item.qty} x {item.price.toLocaleString()}</span>
                <span>{(item.qty * item.price).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-1">
          <div className="flex justify-between font-bold">
            <span>TOTAL</span>
            <span>Rp{printData.total.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>TUNAI</span>
            <span>Rp{printData.cash.toLocaleString()}</span>
          </div>
          <div className="flex justify-between border-t border-dashed border-black pt-1 font-bold">
            <span>KEMBALI</span>
            <span>Rp{printData.change.toLocaleString()}</span>
          </div>
        </div>
        <div className="text-center mt-6 text-[10px] uppercase">
          Terima Kasih Atas Kunjungan Anda
        </div>
      </div>

      {/* SIDEBAR (Desktop) */}
      <aside className="hidden md:flex no-print w-20 bg-white border-r border-slate-200 flex-col items-center py-8 gap-6 h-full">
        <button onClick={() => window.location.href='/'} className="p-3 text-[#00AA5B] bg-green-50 rounded-xl"><Home size={22}/></button>
        <button onClick={() => window.location.href='/history'} className="p-3 text-slate-400 hover:text-[#00AA5B] transition-all"><Receipt size={22}/></button>
        <button onClick={() => window.location.href='/setting'} className="p-3 text-slate-400 hover:text-[#00AA5B] transition-all"><Settings size={22}/></button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-full no-print overflow-hidden">
        <header className="p-4 md:p-8 pb-2 md:pb-4 bg-slate-50 relative">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-black uppercase tracking-tighter text-slate-800">Toko<span className="text-[#00AA5B]">Maju</span></h1>
            
            {/* IKON KERANJANG POJOK KANAN ATAS (Mobile) */}
            <button 
              onClick={() => setShowCartMobile(true)} 
              className="md:hidden relative p-3 bg-white shadow-sm border border-slate-200 rounded-xl text-[#00AA5B]"
            >
              <ShoppingBag size={24}/>
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white animate-bounce">
                  {cart.length}
                </span>
              )}
            </button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Cari produk..." 
              className="w-full py-3 md:py-4 pl-12 pr-4 rounded-xl border border-slate-200 bg-white shadow-sm focus:ring-2 focus:ring-green-500/20 outline-none transition-all" 
            />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:px-8 pb-32">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map(p => (
              <motion.div 
                whileTap={{ scale: 0.97 }} 
                key={p.id} 
                onClick={() => addToCart(p)} 
                className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm hover:border-green-500 transition-all cursor-pointer flex flex-col justify-between h-[150px]"
              >
                <div className="flex justify-between items-start">
                  <span className="text-[9px] font-bold text-slate-400 px-1.5 py-0.5 bg-slate-50 rounded border border-slate-100 uppercase">Stok: {p.stock}</span>
                  <div className="bg-green-50 p-1 rounded-md text-green-600"><Plus size={14} /></div>
                </div>
                <div>
                  <h3 className="font-bold text-slate-700 text-xs line-clamp-2 uppercase mb-1">{p.name}</h3>
                  <p className="text-green-600 font-black text-sm">Rp{Number(p.price).toLocaleString()}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {/* BOTTOM NAV BAR (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center h-16 z-50 no-print">
        <button onClick={() => window.location.href='/'} className="flex flex-col items-center text-[#00AA5B]">
            <Home size={20}/><span className="text-[10px] font-bold mt-1">Home</span>
        </button>
        <button onClick={() => window.location.href='/history'} className="flex flex-col items-center text-slate-400">
            <Receipt size={20}/><span className="text-[10px] font-bold mt-1">Riwayat</span>
        </button>
        <button onClick={() => window.location.href='/setting'} className="flex flex-col items-center text-slate-400">
            <Settings size={20}/><span className="text-[10px] font-bold mt-1">Setelan</span>
        </button>
      </nav>

      {/* PANEL PESANAN */}
      <AnimatePresence>
        {(showCartMobile || (typeof window !== 'undefined' && window.innerWidth > 768)) && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowCartMobile(false)}
              className="md:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 no-print"
            />
            
            <motion.div 
              initial={window.innerWidth < 768 ? { y: "100%" } : { x: "100%" }} 
              animate={window.innerWidth < 768 ? { y: 0 } : { x: 0 }} 
              exit={window.innerWidth < 768 ? { y: "100%" } : { x: "100%" }}
              className={`fixed md:relative bottom-0 left-0 right-0 md:right-auto md:top-0 h-[85vh] md:h-screen w-full md:w-[400px] bg-white border-t md:border-t-0 md:border-l border-slate-200 flex flex-col z-[60] no-print shadow-2xl md:shadow-none transition-all rounded-t-[32px] md:rounded-none`}
            >
              <div className="p-5 border-b border-slate-100 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-500"><ShoppingBag size={20}/></div>
                  <h2 className="font-black text-lg uppercase tracking-tight">Detail Pesanan</h2>
                </div>
                <button onClick={() => setShowCartMobile(false)} className="md:hidden p-2 bg-slate-50 rounded-full"><X size={20}/></button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar">
                {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-60 italic">
                        <ShoppingBag size={40} className="mb-2"/>
                        <p className="text-xs uppercase font-bold">Belum ada item</p>
                    </div>
                ) : cart.map(item => (
                  <div key={item.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col gap-3 group transition-all hover:bg-white hover:border-green-200">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="font-bold text-[11px] uppercase truncate text-slate-700">{item.name}</p>
                        <p className="text-xs text-green-600 font-black">Rp{(item.price * item.qty).toLocaleString()}</p>
                      </div>
                      {/* TOMBOL HAPUS PRODUK */}
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-end gap-1">
                      <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                        <button onClick={() => setCart(cart.map(c => c.id === item.id ? { ...c, qty: Math.max(0, c.qty - 1) } : c))} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-md transition-all"><Minus size={14} /></button>
                        <input type="number" value={item.qty || ''} onChange={(e) => updateQtyManual(item.id, e.target.value)} className="w-8 text-center font-bold text-xs bg-transparent outline-none" />
                        <button onClick={() => setCart(cart.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c))} className="w-8 h-8 flex items-center justify-center text-green-600 hover:bg-green-50 rounded-md transition-all"><Plus size={14} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-5 border-t border-slate-100 bg-white space-y-4 shrink-0 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Bayar</span>
                  <span className="text-2xl font-black text-slate-800">Rp{total.toLocaleString()}</span>
                </div>
                
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Uang Tunai</label>
                    <button onClick={() => setBayarNominal(total)} className="text-[9px] font-bold text-green-600 uppercase bg-green-50 px-2 py-0.5 rounded">Uang Pas</button>
                  </div>
                  <input 
                    type="number" 
                    inputMode="numeric"
                    value={bayarNominal || ''} 
                    onChange={e => setBayarNominal(Number(e.target.value))} 
                    className="w-full p-3.5 bg-slate-50 rounded-xl border-2 border-slate-100 focus:border-green-500 focus:bg-white outline-none font-black text-right text-lg transition-all" 
                    placeholder="0" 
                  />
                </div>

                {bayarNominal >= total && total > 0 && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex justify-between items-center px-4 py-3 bg-green-600 text-white rounded-xl shadow-lg shadow-green-200">
                    <span className="text-[10px] font-black uppercase">Kembalian</span>
                    <span className="font-black text-lg">Rp{kembalian.toLocaleString()}</span>
                  </motion.div>
                )}

                <button 
                  onClick={() => setShowModal(true)} 
                  disabled={cart.length === 0 || bayarNominal < total} 
                  className="w-full py-4 bg-[#00AA5B] text-white rounded-xl font-black uppercase text-xs shadow-xl shadow-green-500/30 disabled:opacity-30 disabled:shadow-none active:scale-[0.98] transition-all"
                >
                  Proses Transaksi
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MODAL BERHASIL */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6 no-print">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div 
                initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%" }}
                className="relative bg-white p-6 md:p-8 rounded-t-[32px] md:rounded-[40px] shadow-2xl w-full max-w-md text-center"
            >
              <div className="w-20 h-20 bg-green-100 text-[#00AA5B] rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-inner">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-1 tracking-tight">TRANSAKSI SELESAI</h3>
              <p className="text-[10px] text-slate-400 font-bold mb-6 uppercase tracking-[0.2em]">Kembalian: Rp{kembalian.toLocaleString()}</p>
              
              <div className="grid grid-cols-1 gap-3">
                <button onClick={() => finalize(true)} className="py-4 bg-[#00AA5B] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-green-500/20">Cetak Struk</button>
                <button onClick={() => finalize(false)} className="py-4 bg-slate-50 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-100 transition-all">Selesai Tanpa Struk</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}