import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export async function GET() {
  try {
    // Ambil data dari KV (jika kosong, kembalikan array kosong)
    const products: any[] = (await kv.get('toko_rahma_products')) || [];
    const transactions: any[] = (await kv.get('toko_rahma_transactions')) || [];
    
    const categories = Array.from(new Set(products.map((p: any) => p.category)));

    return NextResponse.json({
      products,
      transactions,
      categories: categories.length > 0 ? categories : ["UMUM", "DAHAREUN", "INUMAN"]
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ error: "KV_ERROR" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let products: any[] = (await kv.get('toko_rahma_products')) || [];
    let transactions: any[] = (await kv.get('toko_rahma_transactions')) || [];

    switch (body.type) {
      case 'TRANSACTION':
        // 1. Update Stok di Array Products
        body.cart.forEach((item: any) => {
          const idx = products.findIndex((p: any) => p.id === item.id);
          if (idx !== -1) {
            products[idx].stock = Number(products[idx].stock) - Number(item.qty);
          }
        });
        // 2. Tambah Transaksi ke Array
        transactions.unshift(body.transaction); // Tambah ke urutan paling atas
        
        // 3. Simpan kembali ke KV
        await kv.set('toko_rahma_products', products);
        await kv.set('toko_rahma_transactions', transactions);
        break;

      case 'ADD_PRODUCT':
        const newProd = { ...body.data, id: Date.now() };
        products.push(newProd);
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

      case 'DELETE_TRANSACTION':
        transactions = transactions.filter((t: any) => t.id !== body.id);
        await kv.set('toko_rahma_transactions', transactions);
        break;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}