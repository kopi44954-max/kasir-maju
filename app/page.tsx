"use client";
import { useState, useEffect } from 'react';

export default function KasirFuturistik() {
  // State awal harus didefinisikan dengan benar
  const [db, setDb] = useState<{products: any[], transactions: any[]}>({ products: [], transactions: [] });
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', price: '', stock: '', category: 'UMUM' });

  const fetchData = async () => {
    try {
      const res = await fetch('/api/pos');
      const data = await res.json();
      // Pastikan data yang masuk memiliki struktur yang benar
      setDb({
        products: data?.products || [],
        transactions: data?.transactions || []
      });
    } catch (e) {
      console.error("Fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const saveToCloud = async (type: string, payload: any) => {
    try {
      await fetch('/api/pos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, ...payload })
      });
      fetchData();
    } catch (e) {
      alert("Gagal menyimpan ke cloud");
    }
  };

  // PENGAMAN: Jika data sedang loading, tampilkan layar loading
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1d] flex items-center justify-center">
        <div className="text-cyan-500 font-mono animate-pulse">SYSTEM INITIALIZING...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-200 p-4 md:p-8 font-sans">
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full -z-10"></div>

      {/* HEADER */}
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-8 bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-2xl">
        <h1 className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent tracking-tighter">NEO KASIR</h1>
        <div className="text-right">
          <div className="text-[10px] text-cyan-500 font-bold tracking-widest uppercase">Cloud Connection Status</div>
          <div className="text-xs text-green-400 font-mono">● ENCRYPTED & STABLE</div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* KOLOM 1: INVENTARIS */}
        <div className="lg:col-span-4 bg-white/5 backdrop-blur-lg p-6 rounded-3xl border border-white/10 shadow-xl">
          <h2 className="text-xs font-black mb-6 text-cyan-400 tracking-widest uppercase flex items-center gap-2">
            <span className="w-2 h-2 bg-cyan-400 shadow-[0_0_10px_cyan]"></span> Management
          </h2>
          
          <div className="space-y-3 mb-8 bg-black/20 p-4 rounded-2xl">
            <input placeholder="PRODUCT NAME" className="w-full p-3 bg-black/40 border border-white/5 rounded-xl focus:border-cyan-500/50 outline-none text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="PRICE" type="number" className="p-3 bg-black/40 border border-white/5 rounded-xl focus:border-cyan-500/50 outline-none text-sm" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
              <input placeholder="STOCK" type="number" className="p-3 bg-black/40 border border-white/5 rounded-xl focus:border-cyan-500/50 outline-none text-sm" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
            </div>
            {editingProduct ? (
              <div className="flex gap-2">
                <button onClick={() => { saveToCloud('UPDATE_PRODUCT', { data: { ...formData, id: editingProduct.id } }); setEditingProduct(null); setFormData({name:'', price:'', stock:'', category:'UMUM'}); }} className="flex-1 bg-cyan-500 text-black font-black p-3 rounded-xl uppercase text-xs tracking-widest">Update</button>
                <button onClick={() => setEditingProduct(null)} className="bg-white/10 px-4 rounded-xl text-xs">Batal</button>
              </div>
            ) : (
              <button onClick={() => { saveToCloud('ADD_PRODUCT', { data: formData }); setFormData({name:'', price:'', stock:'', category:'UMUM'}); }} className="w-full bg-cyan-600 text-white p-3 rounded-xl font-black uppercase text-xs tracking-widest">Register Item</button>
            )}
          </div>
          
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
            {db.products?.map((p: any) => (
              <div key={p.id} className="flex justify-between items-center p-4 bg-white/[0.02] rounded-2xl border border-white/5 group hover:bg-white/[0.05] transition-all">
                <div className="text-sm font-bold">{p.name} <span className="text-[10px] text-cyan-600 block">STOCK: {p.stock}</span></div>
                <div className="flex gap-4">
                  <button onClick={() => { setEditingProduct(p); setFormData({name:p.name, price:p.price, stock:p.stock, category:p.category}); }} className="text-cyan-500 text-[10px] font-bold">EDIT</button>
                  <button onClick={() => { if(confirm('Hapus?')) saveToCloud('DELETE_PRODUCT', { id: p.id }) }} className="text-rose-500 text-[10px] font-bold">DEL</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* KOLOM 2: TERMINAL KASIR */}
        <div className="lg:col-span-5 bg-white/5 backdrop-blur-lg p-6 rounded-3xl border border-white/10 shadow-xl">
          <h2 className="text-xs font-black mb-6 text-blue-400 tracking-widest uppercase flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-400 shadow-[0_0_10px_blue]"></span> Terminal
          </h2>
          <div className="grid grid-cols-2 gap-2 mb-8">
            {db.products?.map((p: any) => (
              <button key={p.id} onClick={() => {
                const exist = cart.find(x => x.id === p.id);
                if (exist) setCart(cart.map(x => x.id === p.id ? { ...exist, qty: exist.qty + 1 } : x));
                else setCart([...cart, { ...p, qty: 1 }]);
              }} className="p-3 text-[10px] font-bold bg-white/5 hover:bg-cyan-500 hover:text-black rounded-xl border border-white/5 transition-all uppercase">
                {p.name} (Rp{p.price})
              </button>
            ))}
          </div>

          <div className="bg-black/60 rounded-3xl p-6 border border-cyan-500/20">
            <div className="space-y-2 mb-6 min-h-[100px]">
              {cart.map((item, i) => (
                <div key={i} className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">{item.name} x{item.qty}</span>
                  <span>{(item.price * item.qty).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-end mb-6 pt-4 border-t border-white/10">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Total Bill</span>
              <span className="text-2xl font-black text-cyan-400">Rp {cart.reduce((a, b) => a + (b.price * b.qty), 0).toLocaleString()}</span>
            </div>
            <button onClick={async () => {
              const total = cart.reduce((a, b) => a + (b.price * b.qty), 0);
              const trans = { id: Date.now(), date: new Date().toLocaleString(), items: cart, total };
              await saveToCloud('TRANSACTION', { cart, transaction: trans });
              setCart([]);
              alert("TRANSACTION SUCCESS");
            }} disabled={cart.length === 0} className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-black py-4 rounded-2xl uppercase tracking-widest text-xs disabled:bg-slate-800">Execute Order</button>
          </div>
        </div>

        {/* KOLOM 3: LOGS */}
        <div className="lg:col-span-3 bg-white/5 backdrop-blur-lg p-6 rounded-3xl border border-white/10 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xs font-black text-purple-400 tracking-widest uppercase">Logs</h2>
            <button onClick={() => saveToCloud('DELETE_ALL_TRANSACTIONS', {})} className="text-[9px] text-rose-500 font-bold uppercase">Wipe</button>
          </div>
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {db.transactions?.slice().reverse().map((t: any) => (
              <div key={t.id} className="p-4 bg-black/40 rounded-2xl border border-white/5 relative group">
                <button onClick={() => saveToCloud('DELETE_TRANSACTION', { id: t.id })} className="absolute top-2 right-2 text-slate-600 hover:text-red-500">×</button>
                <div className="text-[9px] text-purple-500 mb-2">{t.date}</div>
                <div className="text-[10px] text-slate-300">Rp {t.total.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}