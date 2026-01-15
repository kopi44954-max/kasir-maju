import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server';

const redis = new Redis({
  url: process.env.KV_REST_API_URL || '',
  token: process.env.KV_REST_API_TOKEN || '',
})

const DB_KEY = 'db_kasir';

export async function GET() {
  try {
    const data = await redis.get(DB_KEY);
    // Jika data kosong, kirimkan struktur default agar frontend tidak error
    return NextResponse.json(data || { products: [], transactions: [] }, {
      headers: { 'Cache-Control': 'no-store, max-age=0' }
    });
  } catch (e) {
    return NextResponse.json({ products: [], transactions: [] });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let db: any = await redis.get(DB_KEY) || { products: [], transactions: [] };

    // Pastikan properti selalu ada
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
        body.cart.forEach((item: any) => {
          const idx = db.products.findIndex((p: any) => p.id === item.id);
          if (idx !== -1) db.products[idx].stock = Number(db.products[idx].stock) - Number(item.qty);
        });
        db.transactions.push(body.transaction);
        break;
      case 'DELETE_TRANSACTION':
        db.transactions = db.transactions.filter((t: any) => t.id !== body.id);
        break;
      case 'DELETE_ALL_TRANSACTIONS':
        db.transactions = [];
        break;
    }

    await redis.set(DB_KEY, db);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}