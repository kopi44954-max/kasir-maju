import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

const redis = Redis.fromEnv();
const DB_KEY = 'db_kasir';

export async function GET() {
  try {
    const data = await redis.get(DB_KEY);
    return NextResponse.json(data || { products: [], transactions: [] }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    return NextResponse.json({ products: [], transactions: [] });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let db: any = await redis.get(DB_KEY) || { products: [], transactions: [] };

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
        let calculatedProfit = 0;
        body.cart.forEach((item: any) => {
          const pIdx = db.products.findIndex((p: any) => p.id === item.id);
          if (pIdx !== -1) {
            // Logika Laba: (Jual - Modal) * Qty
            const cost = Number(db.products[pIdx].cost) || 0;
            const price = Number(item.price);
            calculatedProfit += (price - cost) * Number(item.qty);
            db.products[pIdx].stock = Number(db.products[pIdx].stock) - Number(item.qty);
          }
        });
        db.transactions.push({ ...body.transaction, profit: calculatedProfit });
        break;
      case 'DELETE_TRANSACTION':
        db.transactions = db.transactions.filter((t: any) => t.id !== body.id);
        break;
    }
    await redis.set(DB_KEY, db);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}