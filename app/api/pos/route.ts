import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'db.json');

const getDB = () => {
  if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({ products: [], transactions: [] }));
  return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
};

const saveDB = (data: any) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

export async function GET() {
  const db = getDB();
  // Ambil daftar kategori unik dari produk yang ada
  const categories = Array.from(new Set(db.products.map((p: any) => p.category))).filter(Boolean);
  return NextResponse.json({ ...db, categories });
}

export async function POST(req: Request) {
  try {
    const { type, data, cart, transaction, id } = await req.json();
    const db = getDB();

    if (type === 'ADD_PRODUCT') {
      db.products.push({
        id: Date.now(),
        name: data.name,
        price: Number(data.price),
        cost: Number(data.cost),
        stock: Number(data.stock),
        category: data.category || 'UMUM'
      });
    } 
    
    else if (type === 'TRANSACTION') {
      // Simpan riwayat transaksi
      db.transactions.push(transaction);

      // Kurangi stok produk berdasarkan isi keranjang (cart)
      cart.forEach((item: any) => {
        const productIndex = db.products.findIndex((p: any) => p.id === item.id);
        if (productIndex !== -1) {
          db.products[productIndex].stock -= item.qty;
        }
      });
    }

    else if (type === 'DELETE_PRODUCT') {
      db.products = db.products.filter((p: any) => p.id !== id);
    }

    saveDB(db);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}