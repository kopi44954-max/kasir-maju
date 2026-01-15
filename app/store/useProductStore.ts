import { create } from "zustand";
import { persist } from "zustand/middleware";

/* =======================
   TYPES
======================= */
export type Product = {
  id: string;
  name: string;
  costPrice: number;
  price: number;
  stock: number;
  category: string;
};

export type TransactionItem = {
  productId: string;
  name: string;
  price: number;
  qty: number;
  subtotal: number;
};

export type Transaction = {
  id: string;
  date: string;
  items: TransactionItem[];
  total: number;
};

type ProductStore = {
  /* PRODUCT */
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;

  /* TRANSACTION */
  transactions: Transaction[];
  addTransaction: (trx: Transaction) => void;
  deleteTransaction: (id: string) => void;
  clearTransactions: () => void;
};

/* =======================
   STORE
======================= */
export const useProductStore = create<ProductStore>()(
  persist(
    (set) => ({
      /* PRODUCTS */
      products: [],

      addProduct: (product) =>
        set((state) => ({
          products: [...state.products, product],
        })),

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

      /* TRANSACTIONS */
      transactions: [],

      addTransaction: (trx) =>
        set((state) => ({
          transactions: [trx, ...state.transactions],
        })),

      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),

      clearTransactions: () =>
        set(() => ({
          transactions: [],
        })),
    }),
    {
      name: "kasir-storage",
    }
  )
);
