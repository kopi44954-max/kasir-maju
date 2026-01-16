import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

// Fungsi GET untuk mengambil data dari Upstash
export async function GET() {
  try {
    const products = await kv.get('products') || [];
    const transactions = await kv.get('transactions') || [];
    return NextResponse.json({ products, transactions });
  } catch (error) {
    console.error("Gagal mengambil data dari KV:", error);
    return NextResponse.json({ products: [], transactions: [] });
  }
}

// Fungsi POST untuk mengolah data di Upstash
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Ambil data terbaru dari KV
    let products: any[] = await kv.get('products') || [];
    let transactions: any[] = await kv.get('transactions') || [];

    switch (body.type) {
      case 'ADD_PRODUCT':
        products.push(body.data);
        break;

      case 'UPDATE_PRODUCT':
        products = products.map((p: any) => 
          p.id === body.data.id ? body.data : p
        );
        break;

      case 'DELETE_PRODUCT':
        products = products.filter((p: any) => p.id !== body.id);
        break;

      case 'TRANSACTION':
        // 1. Simpan riwayat transaksi
        const newTransaction = {
          ...body.transaction,
          id: Date.now(),
        };
        transactions.push(newTransaction);

        // 2. Potong stok produk otomatis
        body.cart.forEach((item: any) => {
          const productIndex = products.findIndex((p: any) => p.id === item.id);
          if (productIndex !== -1) {
            products[productIndex].stock = 
              Number(products[productIndex].stock) - Number(item.qty);
          }
        });
        break;

      case 'DELETE_TRANSACTION':
        transactions = transactions.filter((t: any) => t.id !== body.id);
        break;

      default:
        return NextResponse.json({ error: 'Invalid action type' }, { status: 400 });
    }

    // SIMPAN KEMBALI KE UPSTASH
    await kv.set('products', products);
    await kv.set('transactions', transactions);

    return NextResponse.json({ success: true, message: 'Data updated successfully to Upstash' });
  } catch (error) {
    console.error("Gagal mengupdate data ke KV:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}