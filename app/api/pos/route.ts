import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export async function GET() {
  // Gunakan as any[] atau berikan default value array kosong untuk mencegah error .map()
  const products = (await kv.get<any[]>('toko_rahma_products')) || [];
  const transactions = (await kv.get<any[]>('toko_rahma_transactions')) || [];
  
  // Sekarang TypeScript tahu 'products' adalah array
  const categories = Array.from(new Set(products.map((p: any) => p.category)));
  
  return NextResponse.json({ 
    products, 
    transactions, 
    categories: categories.length > 0 ? categories : ["UMUM"] 
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  let products = (await kv.get<any[]>('toko_rahma_products')) || [];
  let transactions = (await kv.get<any[]>('toko_rahma_transactions')) || [];

  switch (body.type) {
    case 'TRANSACTION':
      body.cart.forEach((item: any) => {
        const idx = products.findIndex((p: any) => p.id === item.id);
        if (idx !== -1) products[idx].stock = Number(products[idx].stock) - Number(item.qty);
      });
      transactions.unshift(body.transaction);
      await kv.set('toko_rahma_products', products);
      await kv.set('toko_rahma_transactions', transactions);
      break;
    case 'ADD_PRODUCT':
      products.push({ ...body.data, id: Date.now() });
      await kv.set('toko_rahma_products', products);
      break;
    case 'UPDATE_PRODUCT':
      products = products.map((p: any) => p.id === body.data.id ? body.data : p);
      await kv.set('toko_rahma_products', products);
      break;
    case 'DELETE_PRODUCT':
      products = products.filter((p: any) => p.id !== body.id);
      await kv.set('toko_rahma_products', products);
      break;
    case 'DELETE_ALL_PRODUCTS':
      await kv.set('toko_rahma_products', []);
      break;
    case 'DELETE_TRANSACTION':
      transactions = transactions.filter((t: any) => t.id !== body.id);
      await kv.set('toko_rahma_transactions', transactions);
      break;
    case 'DELETE_ALL_TRANSACTIONS':
      await kv.set('toko_rahma_transactions', []);
      break;
  }
  return NextResponse.json({ success: true });
}