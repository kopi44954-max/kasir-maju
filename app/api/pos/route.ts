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
    const { type, data, id } = await req.json();
    const db = getDB();

    if (type === 'ADD_PRODUCT') {
      db.products.push({
        id: Date.now().toString(),
        name: data.name,
        price: Number(data.price) || 0,
        cost: Number(data.cost) || 0,
        stock: Number(data.stock) || 0,
        category: data.category || 'GENERAL'
      });
    } 
    
    else if (type === 'ADD_TRANSACTION') {
      const totalJual = Number(data.totalPrice);
      const totalModal = data.items.reduce((acc: number, item: any) => {
        const p = db.products.find((prod: any) => prod.id === item.id);
        return acc + ((Number(p?.cost) || 0) * item.qty);
      }, 0);

      db.transactions.push({
        id: `NEX-${Date.now()}`,
        date: new Date().toISOString(),
        items: data.items,
        totalPrice: totalJual,
        profit: totalJual - totalModal
      });

      // Update Stock
      data.items.forEach((item: any) => {
        const p = db.products.find((prod: any) => prod.id === item.id);
        if (p) p.stock = Math.max(0, p.stock - item.qty);
      });
    }

    else if (type === 'DELETE_PRODUCT') {
      db.products = db.products.filter((p: any) => p.id !== id);
    }

    saveDB(db);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}