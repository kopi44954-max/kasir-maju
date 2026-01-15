"use client";
import { useState, useEffect } from 'react';

export default function KasirMaju() {
  const [db, setDb] = useState<{products: any[], transactions: any[]}>({ products: [], transactions: [] });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [cart, setCart] = useState<any[]>([]);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', price: '', stock: '', category: 'UMUM' });

  const MY_PIN = "1234"; 

  const fetchData = async () => {
    try {
      const res = await fetch('/api/pos');
      const data = await res.json();
      setDb(data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { if (isLoggedIn) fetchData(); }, [isLoggedIn]);

  const saveToCloud = async (type: string, payload: any) => {
    await fetch('/api/pos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, ...payload })
    });
    fetchData();
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === MY_PIN) {
      setIsLoggedIn(true);
    } else {
      alert("PIN Salah!");
      setPinInput("");
    }
  };

  // --- TAMPILAN LOGIN ---
  if (!isLoggedIn) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
        <form onSubmit={handleLogin} style={{ padding: '2rem', backgroundColor: 'white', borderRadius: '1rem', boxShadow: '0 10px 15px rgba(0,0,0,0.1)', width: '300px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>KASIR MAJU 🔐</h1>
          <input 
            type="password" 
            placeholder="Masukkan PIN"
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem', marginBottom: '1rem', textAlign: 'center', fontSize: '1.25rem' }}
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            autoFocus
          />
          <button type="submit" style={{ width: '100%', padding: '0.75rem', backgroundColor: '#2563eb', color: 'white', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}>
            MASUK
          </button>
          <p style={{ marginTop: '1rem', color: '#9ca3af', fontSize: '0.875rem' }}>Gunakan PIN: 1234</p>
        </form>
      </div>
    );
  }

  // --- TAMPILAN APLIKASI KASIR ---
  return (
    <div style={{ padding: '20px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#2563eb', padding: '15px', borderRadius: '8px', color: 'white', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>🛒 KASIR MAJU</h2>
        <button onClick={() => setIsLoggedIn(false)} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '5px', cursor: 'pointer' }}>Keluar</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
        
        {/* KOLOM 1: STOK */}
        <div style={{ background: 'white', padding: '15px', borderRadius: '8px', border: '1px solid #ddd' }}>
          <h3 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '10px' }}>📦 Inventaris</h3>
          <div style={{ marginBottom: '15px' }}>
            <input placeholder="Nama" style={{ width: '100%', padding: '8px', marginBottom: '5px' }} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <input placeholder="Harga" type="number" style={{ width: '100%', padding: '8px', marginBottom: '5px' }} value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
            <input placeholder="Stok" type="number" style={{ width: '100%', padding: '8px', marginBottom: '10px' }} value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
            
            {editingProduct ? (
              <div style={{ display: 'flex', gap: '5px' }}>
                <button onClick={() => { saveToCloud('UPDATE_PRODUCT', { data: { ...formData, id: editingProduct.id } }); setEditingProduct(null); setFormData({name:'', price:'', stock:'', category:'UMUM'}); }} style={{ flex: 1, backgroundColor: '#f97316', color: 'white', padding: '10px', border: 'none', borderRadius: '5px' }}>Update</button>
                <button onClick={() => setEditingProduct(null)} style={{ backgroundColor: '#9ca3af', color: 'white', padding: '10px', border: 'none', borderRadius: '5px' }}>Batal</button>
              </div>
            ) : (
              <button onClick={() => { saveToCloud('ADD_PRODUCT', { data: formData }); setFormData({name:'', price:'', stock:'', category:'UMUM'}); }} style={{ width: '100%', backgroundColor: '#16a34a', color: 'white', padding: '10px', border: 'none', borderRadius: '5px' }}>+ Tambah</button>
            )}
          </div>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {db.products.map((p: any) => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee', fontSize: '14px' }}>
                <span>{p.name} (Rp{p.price})</span>
                <div>
                  <button onClick={() => { setEditingProduct(p); setFormData({name:p.name, price:p.price, stock:p.stock, category:p.category}); }} style={{ color: 'blue', background: 'none', border: 'none', cursor: 'pointer', marginRight: '10px' }}>Edit</button>
                  <button onClick={() => saveToCloud('DELETE_PRODUCT', { id: p.id })} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}>Hapus</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* KOLOM 2: PENJUALAN */}
        <div style={{ background: 'white', padding: '15px', borderRadius: '8px', border: '1px solid #ddd' }}>
          <h3 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '10px' }}>💰 Jualan</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', marginBottom: '15px' }}>
            {db.products.map((p: any) => (
              <button key={p.id} onClick={() => {
                const exist = cart.find(x => x.id === p.id);
                if (exist) setCart(cart.map(x => x.id === p.id ? { ...exist, qty: exist.qty + 1 } : x));
                else setCart([...cart, { ...p, qty: 1 }]);
              }} style={{ padding: '10px', fontSize: '12px', cursor: 'pointer' }}>{p.name}</button>
            ))}
          </div>
          <div style={{ borderTop: '2px solid #eee', paddingTop: '10px' }}>
            {cart.map((item, i) => <div key={i} style={{ fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}><span>{item.name} x{item.qty}</span><span>Rp{item.price * item.qty}</span></div>)}
            <h4 style={{ textAlign: 'right', margin: '10px 0' }}>Total: Rp{cart.reduce((a, b) => a + (b.price * b.qty), 0)}</h4>
            <button onClick={async () => {
              const trans = { id: Date.now(), date: new Date().toLocaleString(), items: cart, total: cart.reduce((a, b) => a + (b.price * b.qty), 0) };
              await saveToCloud('TRANSACTION', { cart, transaction: trans });
              setCart([]);
              alert("Sukses!");
            }} disabled={cart.length === 0} style={{ width: '100%', padding: '15px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>BAYAR</button>
          </div>
        </div>

        {/* KOLOM 3: RIWAYAT */}
        <div style={{ background: 'white', padding: '15px', borderRadius: '8px', border: '1px solid #ddd' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
            <h3 style={{ margin: 0 }}>📊 Riwayat</h3>
            <button onClick={() => saveToCloud('DELETE_ALL_TRANSACTIONS', {})} style={{ fontSize: '10px', color: 'red' }}>Hapus Semua</button>
          </div>
          <div style={{ maxHeight: '450px', overflowY: 'auto' }}>
            {db.transactions.slice().reverse().map((t: any) => (
              <div key={t.id} style={{ padding: '10px', backgroundColor: '#f9fafb', marginBottom: '10px', borderRadius: '5px', fontSize: '11px' }}>
                <div style={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                   <span>{t.date}</span>
                   <button onClick={() => saveToCloud('DELETE_TRANSACTION', { id: t.id })} style={{ color: 'red', border: 'none', background: 'none' }}>x</button>
                </div>
                {t.items.map((it: any, i: number) => <div key={i}>{it.name} x{it.qty}</div>)}
                <div style={{ textAlign: 'right', fontWeight: 'bold', marginTop: '5px' }}>Rp{t.total}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}