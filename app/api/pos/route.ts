import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Tentukan lokasi file database JSON
const DB_PATH = path.join(process.cwd(), 'db.json');

// Fungsi pembantu untuk membaca data dari file JSON
const readDB = () => {
  if (!fs.existsSync(DB_PATH)) {
    const initialData = { products: [], transactions: [] };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  const data = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(data);
};

// Fungsi pembantu untuk menulis data ke file JSON
const writeDB = (data: any) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};

export async function GET() {
  const data = readDB();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const data = readDB();

  switch (body.type) {
    // --- FITUR PRODUK (SETTING) ---
    case 'ADD_PRODUCT':
      data.products.push(body.data);
      break;

    case 'UPDATE_PRODUCT':
      data.products = data.products.map((p: any) => 
        p.id === body.data.id ? body.data : p
      );
      break;

    case 'DELETE_PRODUCT':
      data.products = data.products.filter((p: any) => p.id !== body.id);
      break;

    // --- FITUR TRANSAKSI (KASIR) ---
    case 'TRANSACTION':
      // 1. Simpan riwayat transaksi
      const newTransaction = {
        ...body.transaction,
        id: Date.now(), // Berikan ID unik untuk transaksi
      };
      data.transactions.push(newTransaction);

      // 2. Potong stok produk otomatis
      body.cart.forEach((item: any) => {
        const productIndex = data.products.findIndex((p: any) => p.id === item.id);
        if (productIndex !== -1) {
          data.products[productIndex].stock = 
            Number(data.products[productIndex].stock) - Number(item.qty);
        }
      });
      break;

    // --- FITUR HAPUS RIWAYAT (HISTORY) ---
    case 'DELETE_TRANSACTION':
      // Memastikan ID transaksi yang dihapus sesuai dengan yang dikirim frontend
      data.transactions = data.transactions.filter((t: any) => t.id !== body.id);
      break;

    default:
      return NextResponse.json({ error: 'Invalid action type' }, { status: 400 });
  }

  // Simpan semua perubahan ke file db.json
  writeDB(data);
  return NextResponse.json({ success: true, message: 'Data updated successfully' });
}