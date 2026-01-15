import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

// Inisialisasi Redis sesuai instruksi Vercel
const redis = Redis.fromEnv();
const DB_KEY = 'db_kasir';

export async function GET() {
  try {
    const data = await redis.get(DB_KEY);
    const safeData = data || { products: [], transactions: [] };
    return NextResponse.json(safeData, {
      headers: { 'Cache-Control': 'no-store' }
    });
  } catch (e) {
    return NextResponse.json({ products: [], transactions: [] });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let db: any = await redis.get(DB_KEY) || { products: [], transactions: [] };

    // Pastikan struktur array tersedia
    if (!db.products) db.products = [];
    if (!db.transactions) db.transactions = [];

    switch (body.type) {
      case 'ADD_PRODUCT':
        db.products.push({ ...body.data, id: Date.now() });
        break;
      
      case 'UPDATE_PRODUCT':
        const uIdx = db.products.findIndex((p: any) => p.id === body.data.id);
        if (uIdx !== -1) db.products[uIdx] = { ...body.data };
        break;

      case 'DELETE_PRODUCT':
        db.products = db.products.filter((p: any) => p.id !== body.id);
        break;

      case 'TRANSACTION':
        let totalProfit = 0;
        // Proses setiap item di keranjang
        body.cart.forEach((item: any) => {
          const idx = db.products.findIndex((p: any) => p.id === item.id);
          if (idx !== -1) {
            // Hitung Laba: (Harga Jual - Harga Modal) * Qty
            // 'cost' adalah harga modal, 'price' adalah harga jual
            const costPrice = Number(db.products[idx].cost) || 0;
            const sellPrice = Number(item.price);
            totalProfit += (sellPrice - costPrice) * Number(item.qty);

            // Update Stok
            db.products[idx].stock = Number(db.products[idx].stock) - Number(item.qty);
          }
        });
        
        // Simpan transaksi beserta data labanya
        db.transactions.push({ 
          ...body.transaction, 
          profit: totalProfit 
        });
        break;

      case 'DELETE_TRANSACTION':
        db.transactions = db.transactions.filter((t: any) => t.id !== body.id);
        break;

      case 'DELETE_ALL_TRANSACTIONS':
        db.transactions = [];
        break;
    }

    // Simpan kembali ke Cloud Redis
    await redis.set(DB_KEY, db);
    return NextResponse.json({ success: true });

  } catch (e: any) {
    console.error("API Error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}