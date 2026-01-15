"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User } from 'lucide-react';

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Ganti 'admin123' dengan password yang Anda inginkan
    if (password === "admin123") {
      localStorage.setItem("isLoggedIn", "true");
      router.push("/admin");
    } else {
      alert("Password Salah!");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-blue-600" size={30} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Akses Admin</h1>
          <p className="text-slate-500 text-sm">Masukkan password untuk kelola menu</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1">Password</label>
            <input 
              type="password" 
              className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition"
          >
            Masuk Sekarang
          </button>
        </form>
      </div>
    </div>
  );
}