"use client";
import { useState, useEffect } from 'react';

export default function KasirApp() {
  const [db, setDb] = useState({ products: [], transactions: [] });
  const [pinInput, setPinInput] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // GANTI PIN DI SINI
  const MY_PIN = "1234"; 

  const fetchData = async () => {
    const res = await fetch('/api/pos');
    const data = await res.json();
    setDb(data);
  };

  useEffect(() => {
    if (isLoggedIn) fetchData();
  }, [isLoggedIn]);

  // Logika Login
  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-md">
          <h1 className="mb-4 text-xl font-bold text-center">MASUK KASIR</h1>
          <input 
            type="password" 
            placeholder="Masukkan PIN"
            className="w-full p-2 border rounded mb-4 text-center"
            value={pinInput}
            onChange={(e) => {
                setPinInput(e.target.value);
                if(e.target.value === MY_PIN) setIsLoggedIn(true);
            }}
          />
          <p className="text-sm text-gray-400 text-center">Masukkan PIN untuk akses</p>
        </div>
      </div>
    );
  }

  // --- LANJUTAN KODE TAMPILAN KASIR ANDA DI BAWAH ---
  // Pastikan saat fungsi update produk dipanggil, gunakan body: JSON.stringify({ type: 'UPDATE_PRODUCT', data: dataBaru })
  // Lalu setelah fetch, panggil fetchData() agar layar langsung update.
  
  return (
    <div>
       {/* Isi tampilan kasir, tombol, dan tabel Anda */}
       <h1>Selamat Datang di Kasir</h1>
       {/* ... */}
    </div>
  );
}