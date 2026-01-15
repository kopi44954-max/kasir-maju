import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Gunakan path absolut yang sangat jelas
const dbPath = path.resolve(process.cwd(), 'db.json');

const getDB = () => {
  try {
    if (!fs.existsSync(dbPath)) {
      fs.writeFileSync(dbPath, JSON.stringify({ products: [], transactions: [] }, null, 2));
    }
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data || '{"products":[], "transactions":[]}');
  } catch (e) {
    console.error("Gagal membaca database:", e);
    return { products: [], transactions: [] };
  }
};

const saveDB = (data: any) => {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error("Gagal menulis database:", e);
    return false;
  }
};

export async function GET() {
  return NextResponse.json(getDB());
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = getDB();
    const { type, data, id } = body;

    if (type === 'ADD_PRODUCT') {
      db.products.push({
        id: Date.now().toString(),
        name: data.name,
        price: Number(data.price) || 0,
        cost: Number(data.cost) || 0,
        stock: Number(data.stock) || 0,
        category: data.category || 'UMUM'
      });
    } 
    
    else if (type === 'ADD_TRANSACTION') {
      db.transactions.push({
        id: `TRX-${Date.now()}`,
        date: new Date().toISOString(),
        items: data.items,
        totalPrice: Number(data.totalPrice),
        profit: Number(data.profit || 0)
      });
      // Potong Stok
      data.items.forEach((item: any) => {
        const p = db.products.find((prod: any) => prod.id === item.id);
        if (p) p.stock = Math.max(0, p.stock - item.qty);
      });
    }

    else if (type === 'DELETE_PRODUCT') {
      db.products = db.products.filter((p: any) => p.id !== id);
    }

    const isSaved = saveDB(db);
    
    if (!isSaved) {
      return NextResponse.json({ success: false, error: "Izin tulis file ditolak server" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}