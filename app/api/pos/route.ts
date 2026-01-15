import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'db.json');

const getDB = () => {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ products: [], transactions: [] }, null, 2));
  }
  const data = fs.readFileSync(dbPath, 'utf8');
  return JSON.parse(data || '{"products":[], "transactions":[]}');
};

const saveDB = (db: any) => fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

export async function GET() {
  return NextResponse.json(getDB());
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = getDB();
    const { type, data, id } = body;

    switch (type) {
      case 'ADD_PRODUCT':
        db.products.push({
          id: Date.now().toString(),
          name: data.name,
          price: Number(data.price) || 0,
          cost: Number(data.cost) || 0,
          stock: Number(data.stock) || 0,
          category: data.category || 'UMUM'
        });
        break;

      case 'UPDATE_PRODUCT':
        const pIdx = db.products.findIndex((p: any) => p.id === data.id);
        if (pIdx > -1) {
          db.products[pIdx] = { 
            ...data, 
            price: Number(data.price), 
            cost: Number(data.cost), 
            stock: Number(data.stock) 
          };
        }
        break;

      case 'DELETE_PRODUCT':
        db.products = db.products.filter((p: any) => p.id !== id);
        break;

      case 'ADD_TRANSACTION':
        const items = data.items || [];
        const totalJual = Number(data.totalPrice) || 0;
        const totalModal = items.reduce((acc: number, item: any) => {
          const p = db.products.find((prod: any) => prod.id === item.id);
          return acc + ((Number(p?.cost) || 0) * item.qty);
        }, 0);

        db.transactions.push({
          id: `TRX-${Date.now()}`,
          date: new Date().toISOString(),
          items,
          totalPrice: totalJual,
          profit: totalJual - totalModal
        });

        // Potong Stok
        items.forEach((item: any) => {
          const p = db.products.find((prod: any) => prod.id === item.id);
          if (p) p.stock = Math.max(0, Number(p.stock) - item.qty);
        });
        break;

      case 'DELETE_TRANSACTION':
        db.transactions = db.transactions.filter((t: any) => t.id !== id);
        break;

      case 'DELETE_ALL_HISTORY':
        db.transactions = [];
        break;
    }

    saveDB(db);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}