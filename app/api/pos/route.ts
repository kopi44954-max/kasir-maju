import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export async function GET() {
  try {
    const data: any = await redis.get('toko_rahma_db');
    return NextResponse.json(data || { products: [], transactions: [] });
  } catch (error) {
    return NextResponse.json({ products: [], transactions: [] });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let data: any = await redis.get('toko_rahma_db') || { products: [], transactions: [] };

    if (body.type === 'TRANSACTION') {
      data.transactions.unshift(body.transaction);
      body.cart.forEach((item: any) => {
        const p = data.products.find((p: any) => p.id === item.id);
        if (p) p.stock = Number(p.stock) - Number(item.qty);
      });
    }

    if (body.type === 'ADD_PRODUCT') {
      data.products.push({ ...body.data, id: Date.now() });
    }

    if (body.type === 'UPDATE_PRODUCT') {
      data.products = data.products.map((p: any) => p.id === body.data.id ? body.data : p);
    }

    if (body.type === 'DELETE_PRODUCT') {
      data.products = data.products.filter((p: any) => p.id !== body.id);
    }

    await redis.set('toko_rahma_db', JSON.stringify(data));
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Gagal" }, { status: 500 });
  }
}