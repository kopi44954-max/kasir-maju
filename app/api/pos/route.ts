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

    switch (body.type) {
      case 'ADD_PRODUCT':
        db.products.push({ 
          id: Date.now().toString(), 
          ...body.data,
          price: Number(body.data.price) || 0,
          cost: Number(body.data.cost) || 0,
          stock: Number(body.data.stock) || 0
        });
        break;

      case 'UPDATE_PRODUCT':
        const idx = db.products.findIndex((p: any) => p.id === body.data.id);
        if (idx > -1) db.products[idx] = { 
          ...body.data,
          price: Number(body.data.price),
          cost: Number(body.data.cost),
          stock: Number(body.data.stock)
        };
        break;

      case 'DELETE_PRODUCT':
        db.products = db.products.filter((p: any) => p.id !== body.id);
        break;

      case 'ADD_TRANSACTION':
        const items = body.data.items || [];
        const totalPrice = Number(body.data.totalPrice) || 0;
        
        // Hitung Modal & Profit secara akurat
        const totalCost = items.reduce((acc: number, item: any) => {
          const product = db.products.find((p: any) => p.id === item.id);
          const costPrice = product ? (Number(product.cost) || 0) : 0;
          return acc + (costPrice * item.qty);
        }, 0);

        db.transactions.push({
          id: `INV-${Date.now()}`,
          date: new Date().toISOString(),
          items: items,
          totalPrice: totalPrice,
          profit: totalPrice - totalCost
        });

        // Potong stok otomatis
        items.forEach((item: any) => {
          const p = db.products.find((prod: any) => prod.id === item.id);
          if (p) p.stock = (Number(p.stock) || 0) - item.qty;
        });
        break;

      case 'DELETE_TRANSACTION':
        db.transactions = db.transactions.filter((t: any) => t.id !== body.id);
        break;

      case 'DELETE_ALL_HISTORY':
        db.transactions = [];
        break;
    }

    saveDB(db);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}