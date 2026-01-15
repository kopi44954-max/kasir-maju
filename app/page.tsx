"use client";
import React, { useState, useEffect } from 'react';
import { ShoppingCart, Package, Search, Trash2, Home, Settings, Receipt, Minus, Plus } from 'lucide-react';

export default function KasirFinal() {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [bayarNominal, setBayarNominal] = useState(0);

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

  const handleBayar = async () => {
    if (bayarNominal < total) return alert("Uang kurang!");
    const res = await fetch('/api/pos', {
      method: 'POST',
      body: JSON.stringify({
        type: 'TRANSACTION',
        cart,
        transaction: { items: cart, total, profit: total - totalModal, cash: bayarNominal, change: kembalian }
      })
    });
    if (res.ok) {
      window.print(); // Cetak struk
      setCart([]);
      setBayarNominal(0);
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 md:pb-0 flex flex-col md:flex-row font-sans">
      {/* SIDEBAR DESKTOP */}
      <aside className="hidden md:flex w-20 bg-white border-r flex-col items-center py-8 gap-8 sticky top-0 h-screen">
        <div className="w-12 h-12 bg-[#00AA5B] rounded-xl flex items-center justify-center text-white font-black">R</div>
        <button className="p-3 text-[#00AA5B] bg-green-50 rounded-xl"><Home size={24}/></button>
        <button onClick={() => window.location.href='/settings'} className="p-3 text-gray-400 hover:text-[#00AA5B]"><Settings size={24}/></button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-black text-gray-800 uppercase">Kasir Toko Rahma</h1>
          <div className="relative w-1/2">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input onChange={e=>setSearch(e.target.value)} placeholder="Cari barang..." className="w-full p-2.5 pl-10 rounded-xl bg-white border-none shadow-sm outline-none focus:ring-2 focus:ring-[#00AA5B]"/>
          </div>
        </div>

        {/* GRID PRODUK TANPA POTONG TEKS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {products.filter(p=>p.name.toLowerCase().includes(search.toLowerCase())).map(p => (
            <div key={p.id} onClick={() => addToCart(p)} className="bg-white p-4 rounded-2xl shadow-sm border border-transparent hover:border-[#00AA5B] cursor-pointer transition-all">
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">{p.category}</p>
              <h3 className="font-black text-gray-800 leading-tight mb-2 break-words whitespace-normal uppercase">{p.name}</h3>
              <p className="text-[#00AA5B] font-black">Rp{Number(p.price).toLocaleString()}</p>
              <div className="mt-3 pt-2 border-t text-[10px] text-gray-400 font-bold uppercase">Stok: {p.stock}</div>
            </div>
          ))}
        </div>
      </main>

      {/* PANEL PESANAN */}
      <div className="w-full md:w-[400px] bg-white border-l p-6 flex flex-col shadow-xl">
        <h2 className="font-black text-lg mb-6 flex items-center gap-2 uppercase tracking-tighter">Pesanan Baru</h2>
        <div className="flex-1 overflow-y-auto space-y-4">
          {cart.map(item => (
            <div key={item.id} className="flex justify-between items-start gap-4 p-2">
              <div className="flex-1">
                <p className="font-bold text-xs uppercase leading-tight">{item.name}</p>
                <p className="text-[#00AA5B] font-black text-xs">Rp{item.price.toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={()=>setCart(cart.map(c=>c.id===item.id?{...c, qty:Math.max(1,c.qty-1)}:c))} className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center font-bold">-</button>
                <span className="font-bold text-sm">{item.qty}</span>
                <button onClick={()=>setCart(cart.map(c=>c.id===item.id?{...c, qty:c.qty+1}:c))} className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center font-bold">+</button>
              </div>
            </div>
          ))}
        </div>

        {/* FITUR KEMBALIAN & BAYAR */}
        <div className="mt-6 pt-6 border-t border-dashed space-y-3">
          <div className="flex justify-between font-bold text-gray-400 uppercase text-[10px]"><span>Subtotal</span><span>Rp{total.toLocaleString()}</span></div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase">Uang Tunai (Rp)</label>
            <input type="number" value={bayarNominal} onChange={e=>setBayarNominal(Number(e.target.value))} className="w-full p-3 bg-gray-50 border-none rounded-xl font-black text-lg outline-none focus:ring-2 focus:ring-[#00AA5B]"/>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="font-black text-sm uppercase">Kembalian</span>
            <span className={`font-black text-xl ${kembalian < 0 ? 'text-red-500' : 'text-[#00AA5B]'}`}>Rp{kembalian.toLocaleString()}</span>
          </div>
          <button onClick={handleBayar} className="w-full py-4 bg-[#00AA5B] text-white rounded-2xl font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">Konfirmasi & Cetak</button>
        </div>
      </div>

      {/* BOTTOM NAV MOBILE */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-4 z-[100]">
        <button onClick={()=>window.location.href='/'} className="flex flex-col items-center text-[#00AA5B]"><Home size={20}/><span className="text-[10px] font-bold">Kasir</span></button>
        <button onClick={()=>window.location.href='/settings'} className="flex flex-col items-center text-gray-400"><Receipt size={20}/><span className="text-[10px] font-bold">Laporan</span></button>
        <button onClick={()=>window.location.href='/settings'} className="flex flex-col items-center text-gray-400"><Settings size={20}/><span className="text-[10px] font-bold">Stok</span></button>
      </nav>

      {/* CSS KHUSUS CETAK STRUK */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; left: 0; top: 0; width: 80mm; font-family: monospace; }
        }
      `}</style>
      <div id="print-area" className="hidden print:block text-xs">
        <center>
          <p className="font-bold">TOKO RAHMA</p>
          <p>Jl. Contoh No. 123</p>
          <p>-------------------------</p>
        </center>
        {cart.map(it=>(
          <div key={it.id} className="flex justify-between"><span>{it.name} x{it.qty}</span><span>{(it.price*it.qty).toLocaleString()}</span></div>
        ))}
        <p>-------------------------</p>
        <div className="flex justify-between font-bold"><span>TOTAL</span><span>{total.toLocaleString()}</span></div>
        <div className="flex justify-between"><span>BAYAR</span><span>{bayarNominal.toLocaleString()}</span></div>
        <div className="flex justify-between"><span>KEMBALI</span><span>{kembalian.toLocaleString()}</span></div>
        <center><p className="mt-4">Terima Kasih</p></center>
      </div>
    </div>
  );
}