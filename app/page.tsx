"use client";
import React, { useState, useEffect } from 'react';
import { Search, Home, Settings, Receipt, Plus, Minus, Trash2, Package, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function KasirGlass() {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [bayarNominal, setBayarNominal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showCartMobile, setShowCartMobile] = useState(false);

  useEffect(() => {
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

  const updateQtyManual = (id: any, value: string) => {
    const newQty = value === "" ? 0 : parseInt(value);
    setCart(cart.map(item => 
      item.id === id ? { ...item, qty: isNaN(newQty) ? 0 : newQty } : item
    ));
  };

  const finalize = async (shouldPrint: boolean) => {
    const validCart = cart.filter(item => item.qty > 0);
    if (validCart.length === 0) return alert("Keranjang kosong!");

    const res = await fetch('/api/pos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'TRANSACTION', cart: validCart,
        transaction: { items: validCart, total, profit: total - totalModal, cash: bayarNominal, change: kembalian, date: new Date().toISOString() }
      })
    });
    if (res.ok) {
      if (shouldPrint) window.print();
      setCart([]); setBayarNominal(0); setShowModal(false); window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-green-50 via-white to-blue-50 flex flex-col md:flex-row font-sans pb-20 md:pb-0">
      
      {/* SIDEBAR (Desktop) */}
      <aside className="hidden md:flex w-20 bg-white/40 backdrop-blur-xl border-r border-white/60 flex-col items-center py-8 gap-6 h-screen sticky top-0 z-20">
        <button onClick={() => window.location.href='/'} className="p-3 text-[#00AA5B] bg-white/80 rounded-xl shadow-sm border border-white"><Home size={22}/></button>
        <button onClick={() => window.location.href='/history'} className="p-3 text-gray-400 hover:text-orange-500 transition-all"><Receipt size={22}/></button>
        <button onClick={() => window.location.href='/setting'} className="p-3 text-gray-400 hover:text-blue-600 transition-all"><Settings size={22}/></button>
      </aside>

      {/* BOTTOM NAV (Mobile) */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 bg-white/70 backdrop-blur-2xl border border-white h-16 rounded-2xl flex items-center justify-around z-40 shadow-2xl">
        <button onClick={() => window.location.href='/'} className="p-3 text-[#00AA5B] bg-white rounded-xl shadow-inner"><Home size={24}/></button>
        <button onClick={() => setShowCartMobile(!showCartMobile)} className="p-3 text-gray-500 relative">
          <ShoppingBag size={24}/>
          {cart.length > 0 && <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full">{cart.length}</span>}
        </button>
        <button onClick={() => window.location.href='/history'} className="p-3 text-gray-500"><Receipt size={24}/></button>
        <button onClick={() => window.location.href='/setting'} className="p-3 text-gray-500"><Settings size={24}/></button>
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="flex flex-col gap-4 mb-6">
          <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-800">Toko<span className="text-[#00AA5B]">Maju</span></h1>
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Cari barang..." 
              className="w-full py-4 pl-12 pr-4 rounded-2xl border border-white bg-white/50 backdrop-blur-md outline-none focus:ring-2 focus:ring-[#00AA5B]/20 shadow-sm transition-all" 
            />
          </div>
        </div>

        {/* GRID PRODUK */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map(p => (
            <motion.div 
              whileTap={{ scale: 0.95 }} 
              key={p.id} 
              onClick={() => addToCart(p)} 
              className="bg-white/40 backdrop-blur-md p-4 rounded-2xl border border-white shadow-sm hover:bg-white/60 transition-all cursor-pointer flex flex-col justify-between min-h-[140px]"
            >
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-white/50 px-2 py-0.5 w-fit rounded-full border border-white mb-2">Stok: {p.stock}</p>
              <div>
                <h3 className="font-bold text-slate-700 uppercase text-xs line-clamp-2 mb-1">{p.name}</h3>
                <p className="text-[#00AA5B] font-black text-sm">Rp{Number(p.price).toLocaleString()}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* PANEL KERANJANG */}
      <AnimatePresence>
        {(showCartMobile || (typeof window !== 'undefined' && window.innerWidth > 768)) && (
          <motion.div 
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            className="fixed md:relative inset-0 md:inset-auto bottom-0 md:top-0 w-full md:w-[400px] bg-white/90 md:bg-white/60 backdrop-blur-3xl border-l border-white p-6 flex flex-col shadow-2xl z-50 md:z-10 rounded-t-[32px] md:rounded-none h-[90vh] md:h-screen"
          >
            <div className="md:hidden w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6" onClick={() => setShowCartMobile(false)} />
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-black text-lg uppercase flex items-center gap-2">Pesanan</h2>
              <button className="md:hidden text-slate-400 font-bold text-xs" onClick={() => setShowCartMobile(false)}>Tutup</button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-20 text-slate-400">
                  <Package size={48}/><p className="text-[10px] font-black mt-2 tracking-[0.2em]">KOSONG</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="bg-white/60 p-3 rounded-2xl border border-white flex justify-between items-center shadow-sm gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[11px] uppercase truncate">{item.name}</p>
                      <p className="text-[9px] text-[#00AA5B] font-black">Rp{item.price.toLocaleString()}</p>
                    </div>
                    
                    <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-white/50">
                      <button onClick={() => setCart(cart.map(c => c.id === item.id ? { ...c, qty: Math.max(0, c.qty - 1) } : c))} className="w-8 h-8 flex items-center justify-center text-slate-400"><Minus size={14} /></button>
                      <input 
                        type="number" 
                        value={item.qty || ''} 
                        onChange={(e) => updateQtyManual(item.id, e.target.value)}
                        className="w-10 text-center font-black text-xs bg-transparent outline-none"
                      />
                      <button onClick={() => setCart(cart.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c))} className="w-8 h-8 flex items-center justify-center text-[#00AA5B]"><Plus size={14} /></button>
                    </div>

                    <button onClick={() => setCart(cart.filter(c => c.id !== item.id))} className="text-slate-300 hover:text-red-500"><Trash2 size={16}/></button>
                  </div>
                ))
              )}
            </div>

            {/* CHECKOUT AREA */}
            <div className="mt-6 pt-6 border-t border-white space-y-4">
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subtotal</span>
                <span className="font-black text-xl text-slate-800">Rp{total.toLocaleString()}</span>
              </div>
              
              <div className="space-y-2">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">Cash</span>
                  <input 
                    type="number" 
                    value={bayarNominal || ''} 
                    onChange={e => setBayarNominal(Number(e.target.value))} 
                    className="w-full p-4 pl-14 bg-white/50 rounded-2xl border border-white font-black text-lg text-right outline-none focus:ring-2 focus:ring-[#00AA5B]/20" 
                    placeholder="0" 
                  />
                </div>
                
                {/* Fitur Kembalian: Muncul Hanya Jika Tunai > 0 */}
                {bayarNominal > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex justify-between items-center p-4 rounded-2xl border border-dashed transition-all ${kembalian < 0 ? 'bg-red-50 border-red-200' : 'bg-[#00AA5B]/5 border-[#00AA5B]/20'}`}
                  >
                    <span className="text-[10px] font-black uppercase text-slate-500">{kembalian < 0 ? 'Kurang' : 'Kembali'}</span>
                    <span className={`font-black text-lg ${kembalian < 0 ? 'text-red-500' : 'text-[#00AA5B]'}`}>Rp{Math.abs(kembalian).toLocaleString()}</span>
                  </motion.div>
                )}
              </div>

              <button 
                onClick={() => setShowModal(true)} 
                disabled={cart.length === 0 || total === 0 || bayarNominal < total} 
                className="w-full py-4 bg-[#00AA5B] text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-green-200 disabled:opacity-30 active:scale-95 transition-all"
              >
                Proses Transaksi
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL BERHASIL */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="relative bg-white p-8 rounded-[32px] shadow-2xl w-full max-w-sm text-center">
              <div className="w-20 h-20 bg-green-100 text-[#00AA5B] rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Receipt size={40} />
              </div>
              <h3 className="text-xl font-black mb-2 text-slate-800 uppercase tracking-tighter">Berhasil</h3>
              <p className="text-xs text-slate-400 font-bold mb-8 uppercase tracking-widest">Transaksi telah disimpan</p>
              <div className="grid gap-3">
                <button onClick={() => finalize(true)} className="py-4 bg-[#00AA5B] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-green-200">Cetak Struk</button>
                <button onClick={() => finalize(false)} className="py-4 bg-slate-50 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest">Tanpa Struk</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}