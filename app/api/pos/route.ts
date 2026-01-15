import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'db.json');

const getDB = () => {
  if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({ products: [], transactions: [] }));
  return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
};

const saveDB = (data: any) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

export async function GET() {
  return NextResponse.json(getDB());
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = getDB();

    if (body.type === 'ADD_PRODUCT') {
      db.products.push({
        id: Date.now().toString(),
        name: body.data.name,
        price: Number(body.data.price) || 0,
        cost: Number(body.data.cost) || 0,
        stock: Number(body.data.stock) || 0,
        category: body.data.category || 'UMUM'
      });
    } else if (body.type === 'ADD_TRANSACTION') {
      const items = body.data.items || [];
      const totalJual = Number(body.data.totalPrice) || 0;
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

      items.forEach((item: any) => {
        const p = db.products.find((prod: any) => prod.id === item.id);
        if (p) p.stock = Math.max(0, Number(p.stock) - item.qty);
      });
    }

    saveDB(db);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}