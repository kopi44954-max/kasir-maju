import { create } from "zustand";
import { persist } from "zustand/middleware";

// Type Product
export interface Product {
  id: string;
  name: string;
  costPrice: number;
  price: number;
  stock: number;
  category: string;
}

// Type Transaction
export interface Transaction {
  id: string;
  productId: string;
  quantity: number;
  total: number;
  date: string;
}

interface ProductStore {
  products: Product[];
  transactions: Transaction[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;

  addTransaction: (transaction: Transaction) => void;
  clearTransactions: () => void;
  deleteTransaction: (id: string) => void;

  reduceStock: (productId: string, quantity: number) => void; // ✅ Ini harus ada
}

export const useProductStore = create<ProductStore>()(
  persist(
    (set, get) => ({
      products: [],
      transactions: [],

      addProduct: (product) =>
        set((state) => ({ products: [...state.products, product] })),

      updateProduct: (product) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === product.id ? product : p
          ),
        })),

      deleteProduct: (id) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        })),

      addTransaction: (transaction) => {
        set((state) => ({ transactions: [...state.transactions, transaction] }));
        get().reduceStock(transaction.productId, transaction.quantity); // kurangi stok
      },

      clearTransactions: () => set({ transactions: [] }),
      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),

      reduceStock: (productId, quantity) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === productId
              ? { ...p, stock: p.stock - quantity }
              : p
          ),
        })),
    }),
    { name: "product-store" }
  )
);
