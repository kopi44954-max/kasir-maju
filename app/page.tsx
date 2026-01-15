"use client";
import { useState, useEffect } from 'react';

export default function KasirFuturistik() {
  const [db, setDb] = useState<{products: any[], transactions: any[]}>({ products: [], transactions: [] });
  const [cart, setCart] = useState<any[]>([]);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', price: '', stock: '', category: 'UMUM' });

  const fetchData = async () => {
    try {
      const res = await fetch('/api/pos');
      const data = await res.json();
      setDb(data);
    } catch (e) { console.error("Gagal load data"); }
  };

  useEffect(() => { fetchData(); }, []);

  const saveToCloud = async (type: string, payload: any) => {
    await fetch('/api/pos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, ...payload })
    });
    fetchData();
  };

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-200 p-4 md:p-8 font-sans selection:bg-cyan-500/30">
      
      {/* GLOW DECORATION */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full -z-10"></div>
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full -z-10"></div>

      {/* HEADER */}
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-8 bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-2xl">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent tracking-tighter">
            NEO KASIR
          </h1>
          <p className="text-cyan-500/60 text-xs font-bold tracking-[0.2em] uppercase">Futuristic POS System v2.0</p>
        </div>
        <div className="hidden md:flex items-center gap-6 text-xs font-mono">
          <div className="flex flex-col items-end">
            <span className="text-slate-500 uppercase">Database Status</span>
            <span className="text-cyan-400">ONLINE // ENCRYPTED</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* KOLOM 1: INVENTARIS */}
        <div className="lg:col-span-4 bg-white/5 backdrop-blur-lg p-6 rounded-3xl border border-white/10 shadow-xl">
          <h2 className="text-sm font-black mb-6 flex items-center gap-2 text-cyan-400 tracking-widest uppercase">
            <span className="w-2 h-2 bg-cyan-400 shadow-[0_0_10px_cyan]"></span> Management
          </h2>
          
          <div className="space-y-3 mb-8">
            <input placeholder="PRODUCT NAME" className="w-full p-3 bg-black/40 border border-white/5 rounded-xl focus:border-cyan-500/50 outline-none transition-all text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="PRICE" type="number" className="p-3 bg-black/40 border border-white/5 rounded-xl focus:border-cyan-500/50 outline-none text-sm" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
              <input placeholder="STOCK" type="number" className="p-3 bg-black/40 border border-white/5 rounded-xl focus:border-cyan-500/50 outline-none text-sm" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
            </div>
            
            {editingProduct ? (
              <div className="flex gap-2">
                <button onClick={() => { saveToCloud('UPDATE_PRODUCT', { data: { ...formData, id: editingProduct.id } }); setEditingProduct(null); setFormData({name:'', price:'', stock:'', category:'UMUM'}); }} className="flex-1 bg-cyan-500 text-black font-black p-3 rounded-xl hover:bg-cyan-400 transition-all uppercase text-xs tracking-widest">Update Data</button>
                <button onClick={() => setEditingProduct(null)} className="bg-white/10 text-white px-4 rounded-xl text-xs">X</button>
              </div>
            ) : (
              <button onClick={() => { saveToCloud('ADD_PRODUCT', { data: formData }); setFormData({name:'', price:'', stock:'', category:'UMUM'}); }} className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white p-3 rounded-xl font-black shadow-lg shadow-cyan-900/20 hover:scale-[1.02] transition-all uppercase text-xs tracking-widest">+ Register Item</button>
            )}
          </div>
          
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {db.products.map((p: any) => (
              <div key={p.id} className="flex justify-between items-center p-4 bg-white/[0.02] rounded-2xl border border-white/5 group hover:bg-white/[0.05] transition-all">
                <div>
                  <div className="font-bold text-slate-200 text-sm tracking-wide">{p.name}</div>
                  <div className="text-[10px] text-cyan-500 font-mono uppercase">ID: {p.id.toString().slice(-5)} // STK: {p.stock}</div>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <div className="text-xs font-bold text-slate-400">Rp {Number(p.price).toLocaleString()}</div>
                  <div className="flex gap-3">
                    <button onClick={() => { setEditingProduct(p); setFormData({name:p.name, price:p.price, stock:p.stock, category:p.category}); }} className="text-cyan-500 text-[10px] uppercase font-bold hover:text-cyan-300">Edit</button>
                    <button onClick={() => { if(confirm('Delete?')) saveToCloud('DELETE_PRODUCT', { id: p.id }) }} className="text-rose-500 text-[10px] uppercase font-bold hover:text-rose-300">Del</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* KOLOM 2: KASIR */}
        <div className="lg:col-span-5 bg-white/5 backdrop-blur-lg p-6 rounded-3xl border border-white/10 shadow-xl">
          <h2 className="text-sm font-black mb-6 flex items-center gap-2 text-blue-400 tracking-widest uppercase">
            <span className="w-2 h-2 bg-blue-400 shadow-[0_0_10px_blue]"></span> Terminal
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-8">
            {db.products.map((p: any) => (
              <button key={p.id} onClick={() => {
                const exist = cart.find(x => x.id === p.id);
                if (exist) setCart(cart.map(x => x.id === p.id ? { ...exist, qty: exist.qty + 1 } : x));
                else setCart([...cart, { ...p, qty: 1 }]);
              }} className="p-3 text-[10px] font-bold bg-white/5 hover:bg-cyan-500 hover:text-black rounded-xl border border-white/5 transition-all uppercase tracking-tighter">
                {p.name}
              </button>
            ))}
          </div>

          <div className="bg-black/60 rounded-3xl p-6 border border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-xs text-cyan-500 uppercase tracking-[0.3em]">Checkout_List</h3>
              <span className="text-[10px] font-mono text-slate-500">Items: {cart.length}</span>
            </div>
            
            <div className="space-y-3 mb-8 min-h-[150px]">
              {cart.map((item, i) => (
                <div key={i} className="flex justify-between items-center text-xs font-mono border-b border-white/5 pb-2">
                  <span className="text-slate-400">{item.name} <span className="text-cyan-400">x{item.qty}</span></span>
                  <span className="text-slate-200">{(item.price * item.qty).toLocaleString()}</span>
                </div>
              ))}
            </div>
            
            <div className="pt-4 mb-6">
              <div className="flex justify-between items-end">
                <span className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">Total_Amount</span>
                <span className="text-3xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                  <span className="text-sm text-cyan-500 mr-2 font-mono">IDR</span>
                  {cart.reduce((a, b) => a + (b.price * b.qty), 0).toLocaleString()}
                </span>
              </div>
            </div>
            
            <button 
              onClick={async () => {
                const total = cart.reduce((a, b) => a + (b.price * b.qty), 0);
                const trans = { id: Date.now(), date: new Date().toLocaleString(), items: cart, total };
                await saveToCloud('TRANSACTION', { cart, transaction: trans });
                setCart([]);
                alert("TRANSACTION COMPLETED");
              }} 
              disabled={cart.length === 0} 
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-black py-4 rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.4)] disabled:bg-slate-800 disabled:text-slate-600 disabled:shadow-none transition-all uppercase tracking-widest text-xs"
            >
              Execute Transaction
            </button>
          </div>
        </div>

        {/* KOLOM 3: RIWAYAT */}
        <div className="lg:col-span-3 bg-white/5 backdrop-blur-lg p-6 rounded-3xl border border-white/10 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-sm font-black text-purple-400 tracking-widest uppercase flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-400 shadow-[0_0_10px_purple]"></span> Logs
            </h2>
            <button onClick={() => { if(confirm('Wipe all logs?')) saveToCloud('DELETE_ALL_TRANSACTIONS', {}) }} className="text-[9px] font-bold text-rose-500/50 hover:text-rose-500 uppercase tracking-tighter">Wipe</button>
          </div>
          
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
            {db.transactions.slice().reverse().map((t: any) => (
              <div key={t.id} className="p-4 bg-black/40 rounded-2xl border border-white/5 group relative hover:border-purple-500/30 transition-all">
                <button onClick={() => saveToCloud('DELETE_TRANSACTION', { id: t.id })} className="absolute top-2 right-2 text-slate-700 hover:text-rose-500 transition-all font-bold">×</button>
                <div className="text-[9px] font-mono text-purple-500/60 mb-2 tracking-tighter">{t.date}</div>
                {t.items.map((it: any, i: number) => (
                  <div key={i} className="text-[10px] text-slate-400 font-mono">
                    {it.name.slice(0,15)}.. <span className="text-purple-400">x{it.qty}</span>
                  </div>
                ))}
                <div className="mt-3 text-xs font-black text-slate-200 border-t border-white/5 pt-2 flex justify-between font-mono">
                  <span className="text-slate-500 font-normal">SUM:</span>
                  <span>{t.total.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}