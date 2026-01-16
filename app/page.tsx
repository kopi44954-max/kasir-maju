"use client";
import React, { useState, useEffect } from 'react';
import { Search, Home, Settings, Receipt, Plus, Minus, Trash2, ShoppingBag, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function KasirGlass() {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [bayarNominal, setBayarNominal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showCartMobile, setShowCartMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const [printData, setPrintData] = useState<any>({ items: [], total: 0, cash: 0, change: 0, date: "" });

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/pos?t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchData();
  }, []);

  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const totalModal = cart.reduce((sum, item) => sum + (Number(item.cost || 0) * item.qty), 0);
  const kembalian = bayarNominal - total;

  const addToCart = (p: any) => {
    if (p.stock <= 0) return alert("Stok habis!");
    const exist = cart.find(item => item.id === p.id);
    if (exist) {
      setCart(cart.map(item => item.id === p.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...p, qty: 1 }]);
    }
  };

  const finalize = async (shouldPrint: boolean) => {
    const validCart = cart.filter(item => item.qty > 0);
    if (validCart.length === 0) return alert("Keranjang kosong!");

    const transactionPayload = {
      type: 'TRANSACTION',
      cart: validCart,
      transaction: {
        items: validCart,
        total: total,
        profit: total - totalModal,
        cash: bayarNominal,
        change: kembalian,
        date: new Date().toISOString()
      }
    };

    try {
      const res = await fetch('/api/pos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionPayload)
      });

      if (res.ok) {
        if (shouldPrint) {
          setPrintData({ ...transactionPayload.transaction, date: new Date().toLocaleString() });
          setTimeout(() => { window.print(); resetApp(); }, 800);
        } else {
          resetApp();
        }
      }
    } catch (error) { alert("Gagal memproses transaksi"); }
  };

  const resetApp = () => {
    setCart([]); setBayarNominal(0); setShowModal(false); fetchData();
  };

  if (!isMounted) return null;

  return (
    <div className="h-screen bg-slate-50 flex flex-col md:flex-row font-sans overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: `@media print { body * { visibility: hidden !important; } #section-to-print, #section-to-print * { visibility: visible !important; } #section-to-print { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; display: block !important; background: white; } .no-print { display: none !important; } @page { size: auto; margin: 5mm; } }`}} />

      {/* STRUK AREA */}
      <div id="section-to-print" className="hidden print:block p-4 text-black font-mono text-[12px] leading-tight">
        <div className="text-center border-b border-dashed border-black pb-2 mb-2 uppercase font-bold">Toko Maju<br/><span className="text-[10px] font-normal">{printData.date}</span></div>
        <div className="space-y-1 mb-2 border-b border-dashed border-black pb-2">
          {printData.items.map((item: any, i: number) => (
            <div key={i} className="flex justify-between"><span>{item.qty}x {item.name}</span><span>{(item.qty * item.price).toLocaleString()}</span></div>
          ))}
        </div>
        <div className="flex justify-between font-bold"><span>TOTAL</span><span>Rp{printData.total.toLocaleString()}</span></div>
        <div className="flex justify-between"><span>TUNAI</span><span>Rp{printData.cash.toLocaleString()}</span></div>
        <div className="flex justify-between border-t border-dashed border-black pt-1 font-bold"><span>KEMBALI</span><span>Rp{printData.change.toLocaleString()}</span></div>
      </div>

      <aside className="hidden md:flex no-print w-20 bg-white border-r border-slate-200 flex-col items-center py-8 gap-6 h-full">
        <button onClick={() => window.location.href='/'} className="p-3 text-[#00AA5B] bg-green-50 rounded-xl"><Home size={22}/></button>
        <button onClick={() => window.location.href='/history'} className="p-3 text-slate-400 hover:text-[#00AA5B] transition-all"><Receipt size={22}/></button>
        <button onClick={() => window.location.href='/setting'} className="p-3 text-slate-400 hover:text-[#00AA5B] transition-all"><Settings size={22}/></button>
      </aside>

      <main className="flex-1 flex flex-col h-full no-print overflow-hidden">
        <header className="p-4 md:p-8 bg-slate-50 relative">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-black uppercase tracking-tighter text-slate-800">Toko<span className="text-[#00AA5B]">Maju</span></h1>
            <button onClick={() => setShowCartMobile(true)} className="md:hidden relative p-3 bg-white border border-slate-200 rounded-xl text-[#00AA5B]"><ShoppingBag size={24}/>{cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white">{cart.length}</span>}</button>
          </div>
          <div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input onChange={e => setSearch(e.target.value)} placeholder="Cari produk..." className="w-full py-3 pl-12 pr-4 rounded-xl border border-slate-200 bg-white shadow-sm outline-none focus:ring-2 focus:ring-green-500/20" /></div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:px-8 pb-32">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map(p => (
              <motion.div whileTap={{ scale: 0.95 }} key={p.id} onClick={() => addToCart(p)} className={`bg-white p-3 rounded-xl border border-slate-200 shadow-sm hover:border-green-500 transition-all cursor-pointer flex flex-col justify-between h-[140px] ${p.stock <= 0 ? 'opacity-50 grayscale' : ''}`}>
                <div className="flex justify-between items-start"><span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${p.stock <= 5 ? 'bg-red-50 text-red-500 border-red-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>Stok: {p.stock}</span><div className="bg-green-50 p-1 rounded-md text-green-600"><Plus size={14} /></div></div>
                <div><h3 className="font-bold text-slate-700 text-xs line-clamp-2 uppercase">{p.name}</h3><p className="text-green-600 font-black text-sm">Rp{Number(p.price).toLocaleString()}</p></div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center h-16 z-50 no-print">
        <button onClick={() => window.location.href='/'} className="text-[#00AA5B] flex flex-col items-center"><Home size={20}/><span className="text-[10px] font-bold">Home</span></button>
        <button onClick={() => window.location.href='/history'} className="text-slate-400 flex flex-col items-center"><Receipt size={20}/><span className="text-[10px] font-bold">Riwayat</span></button>
        <button onClick={() => window.location.href='/setting'} className="text-slate-400 flex flex-col items-center"><Settings size={20}/><span className="text-[10px] font-bold">Setelan</span></button>
      </nav>

      <AnimatePresence>
        {(showCartMobile || (isMounted && window.innerWidth > 768)) && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCartMobile(false)} className="md:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="fixed md:relative bottom-0 w-full md:w-[400px] h-[85vh] md:h-screen bg-white border-l border-slate-200 flex flex-col z-[60] shadow-2xl md:shadow-none rounded-t-[32px] md:rounded-none">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center"><h2 className="font-black text-lg uppercase">Detail Pesanan</h2><button onClick={() => setShowCartMobile(false)} className="md:hidden p-2 bg-slate-50 rounded-full"><X size={20}/></button></div>
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {cart.map(item => (
                  <div key={item.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col gap-2">
                    <div className="flex justify-between items-start"><p className="font-bold text-[11px] uppercase truncate flex-1">{item.name}</p><button onClick={() => setCart(cart.filter(c => c.id !== item.id))} className="text-slate-300 hover:text-red-500"><Trash2 size={16} /></button></div>
                    <div className="flex justify-between items-center"><p className="text-xs text-green-600 font-black">Rp{(item.price * item.qty).toLocaleString()}</p><div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-slate-200"><button onClick={() => setCart(cart.map(c => c.id === item.id ? { ...c, qty: Math.max(1, c.qty - 1) } : c))}><Minus size={14}/></button><span className="text-xs font-bold">{item.qty}</span><button onClick={() => setCart(cart.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c))}><Plus size={14}/></button></div></div>
                  </div>
                ))}
              </div>
              <div className="p-5 border-t border-slate-100 space-y-4">
                <div className="flex justify-between items-center"><span className="text-[10px] font-black text-slate-400 uppercase">Total Bayar</span><span className="text-2xl font-black">Rp{total.toLocaleString()}</span></div>
                <input type="number" value={bayarNominal || ''} onChange={e => setBayarNominal(Number(e.target.value))} className="w-full p-3 bg-slate-50 rounded-xl border-2 border-slate-100 font-black text-right text-lg outline-none focus:border-green-500" placeholder="Uang Tunai" />
                <button onClick={() => setShowModal(true)} disabled={cart.length === 0 || bayarNominal < total} className="w-full py-4 bg-[#00AA5B] text-white rounded-xl font-black uppercase text-xs shadow-xl shadow-green-500/30 disabled:opacity-30">Proses Transaksi</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6 no-print">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%" }} className="relative bg-white p-8 rounded-t-[32px] md:rounded-[40px] shadow-2xl w-full max-w-md text-center">
              <div className="w-20 h-20 bg-green-100 text-[#00AA5B] rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle2 size={40} /></div>
              <h3 className="text-2xl font-black text-slate-800 mb-1">TRANSAKSI SELESAI</h3>
              <p className="text-[10px] text-slate-400 font-bold mb-6 uppercase">Kembalian: Rp{kembalian.toLocaleString()}</p>
              <div className="grid grid-cols-1 gap-3"><button onClick={() => finalize(true)} className="py-4 bg-[#00AA5B] text-white rounded-2xl font-black uppercase text-[10px]">Cetak Struk</button><button onClick={() => finalize(false)} className="py-4 bg-slate-50 text-slate-400 rounded-2xl font-black uppercase text-[10px]">Tanpa Struk</button></div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}