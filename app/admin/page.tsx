"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useProductStore } from "../store/useProductStore";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit3,
  Package,
} from "lucide-react";

/* =======================
   TYPE
======================= */
export type Product = {
  id: string;
  name: string;
  costPrice: number;
  price: number;
  stock: number;
  category: string;
};

type NewProductForm = {
  id: string;
  name: string;
  costPrice: string;
  price: string;
  stock: string;
};

export default function AdminPage() {
  const { products, addProduct, deleteProduct, updateProduct } =
    useProductStore();

  const [isAdd, setIsAdd] = useState(false);
  const [edit, setEdit] = useState<Product | null>(null);

  const [newItem, setNewItem] = useState<NewProductForm>({
    id: "",
    name: "",
    costPrice: "",
    price: "",
    stock: "",
  });

  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  /* =======================
     AUTH CHECK (CLIENT)
  ======================= */
  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      if (localStorage.getItem("isLoggedIn") !== "true") {
        router.push("/login");
      }
    }
  }, [router]);

  /* =======================
     SAVE NEW PRODUCT
  ======================= */
  const saveItem = () => {
    if (!newItem.id || !newItem.name || !newItem.price || !newItem.stock) {
      alert("Mohon isi semua data (ID, Nama, Harga, dan Stok)!");
      return;
    }

    if (products.some((p: Product) => p.id === newItem.id)) {
      alert("ID Produk sudah terdaftar!");
      return;
    }

    const payload: Product = {
      id: newItem.id,
      name: newItem.name,
      costPrice: Number(newItem.costPrice) || 0,
      price: Number(newItem.price),
      stock: Number(newItem.stock),
      category: "Umum",
    };

    addProduct(payload);

    setIsAdd(false);
    setNewItem({
      id: "",
      name: "",
      costPrice: "",
      price: "",
      stock: "",
    });
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-12 text-slate-900">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <header className="flex justify-between items-center mb-8 bg-white p-6 rounded border shadow-sm">
          <div>
            <h1 className="text-lg font-black uppercase flex items-center gap-2">
              <Package size={20} className="text-emerald-500" />
              Inventaris Barang
            </h1>
            <Link
              href="/"
              className="text-[10px] font-bold text-slate-400 hover:text-emerald-600 flex items-center gap-1 mt-1 uppercase"
            >
              <ArrowLeft size={12} /> Kembali ke Kasir
            </Link>
          </div>

          <button
            onClick={() => setIsAdd(!isAdd)}
            className="bg-slate-900 text-white px-5 py-2.5 rounded text-[10px] font-bold uppercase flex items-center gap-2 hover:bg-emerald-600"
          >
            {isAdd ? "Batal" : (<><Plus size={16} /> Tambah Produk</>)}
          </button>
        </header>

        {/* FORM TAMBAH */}
        {isAdd && (
          <div className="bg-white p-8 rounded border shadow mb-8">
            <h3 className="text-[10px] font-black uppercase text-emerald-600 mb-6">
              Informasi Barang Baru
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <input
                placeholder="ID / SKU"
                className="p-3 border rounded text-xs font-bold"
                value={newItem.id}
                onChange={(e) =>
                  setNewItem({ ...newItem, id: e.target.value })
                }
              />

              <input
                placeholder="Nama Produk"
                className="p-3 border rounded text-xs font-bold"
                value={newItem.name}
                onChange={(e) =>
                  setNewItem({ ...newItem, name: e.target.value })
                }
              />

              <input
                type="number"
                placeholder="Harga Modal"
                className="p-3 border rounded text-xs"
                value={newItem.costPrice}
                onChange={(e) =>
                  setNewItem({ ...newItem, costPrice: e.target.value })
                }
              />

              <input
                type="number"
                placeholder="Harga Jual"
                className="p-3 border rounded text-xs font-bold text-emerald-600"
                value={newItem.price}
                onChange={(e) =>
                  setNewItem({ ...newItem, price: e.target.value })
                }
              />

              <input
                type="number"
                placeholder="Stok"
                className="p-3 border rounded text-xs font-bold text-blue-600"
                value={newItem.stock}
                onChange={(e) =>
                  setNewItem({ ...newItem, stock: e.target.value })
                }
              />
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={saveItem}
                className="px-6 py-2.5 bg-emerald-600 text-white rounded text-[10px] font-bold uppercase"
              >
                Simpan Produk
              </button>
              <button
                onClick={() => setIsAdd(false)}
                className="px-6 py-2.5 bg-slate-100 rounded text-[10px] font-bold"
              >
                Batal
              </button>
            </div>
          </div>
        )}

        {/* TABLE */}
        <div className="bg-white rounded border shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[9px] uppercase text-slate-400">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Produk</th>
                <th className="px-6 py-4 text-center">Stok</th>
                <th className="px-6 py-4 text-right">Modal</th>
                <th className="px-6 py-4 text-right">Jual</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {products.map((p: Product) => (
                <tr key={p.id} className="border-t">
                  <td className="px-6 py-4 text-xs font-mono">{p.id}</td>
                  <td className="px-6 py-4 text-xs font-bold">{p.name}</td>
                  <td className="px-6 py-4 text-center text-xs font-bold">
                    {p.stock}
                  </td>
                  <td className="px-6 py-4 text-right text-xs">
                    Rp {p.costPrice.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-xs font-bold text-emerald-600">
                    Rp {p.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center space-x-2">
                    <button onClick={() => setEdit(p)}>
                      <Edit3 size={14} />
                    </button>
                    <button onClick={() => deleteProduct(p.id)}>
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {products.length === 0 && (
            <div className="p-10 text-center text-xs text-slate-400">
              Belum ada barang
            </div>
          )}
        </div>
      </div>

      {/* MODAL EDIT */}
      {edit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-full max-w-md">
            <h2 className="text-xs font-bold mb-4">
              Edit Produk: {edit.id}
            </h2>

            <input
              className="w-full p-3 border rounded mb-2"
              value={edit.name}
              onChange={(e) =>
                setEdit({ ...edit, name: e.target.value })
              }
            />

            <input
              type="number"
              className="w-full p-3 border rounded mb-2"
              value={edit.costPrice}
              onChange={(e) =>
                setEdit({ ...edit, costPrice: Number(e.target.value) })
              }
            />

            <input
              type="number"
              className="w-full p-3 border rounded mb-2"
              value={edit.price}
              onChange={(e) =>
                setEdit({ ...edit, price: Number(e.target.value) })
              }
            />

            <input
              type="number"
              className="w-full p-3 border rounded mb-4"
              value={edit.stock}
              onChange={(e) =>
                setEdit({ ...edit, stock: Number(e.target.value) })
              }
            />

            <div className="flex gap-2">
              <button
                onClick={() => {
                  updateProduct(edit);
                  setEdit(null);
                }}
                className="flex-1 bg-slate-900 text-white py-2 rounded"
              >
                Update
              </button>
              <button
                onClick={() => setEdit(null)}
                className="px-4 bg-slate-100 rounded"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
