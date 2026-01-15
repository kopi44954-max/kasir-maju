import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'data', 'db.json');

const readDB = () => {
  const defaultData = { products: [], transactions: [], categories: ["UMUM", "DAHAREUN", "INUMAN"] };
  try {
    if (!fs.existsSync(filePath)) {
      const dirPath = path.dirname(filePath);
      if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
      fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
      return defaultData;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return content.trim() ? JSON.parse(content) : defaultData;
  } catch (error) { return defaultData; }
};

const writeDB = (data: any) => fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');

export async function GET() {
  return NextResponse.json(readDB(), { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(req: Request) {
  try {
    const db = readDB();
    const body = await req.json();

    switch (body.type) {
      case 'TRANSACTION':
        body.cart.forEach((item: any) => {
          const idx = db.products.findIndex((p: any) => p.id === item.id);
          if (idx !== -1) db.products[idx].stock = Number(db.products[idx].stock) - Number(item.qty);
        });
        db.transactions.push(body.transaction);
        break;
      case 'DELETE_TRANSACTION':
        db.transactions = db.transactions.filter((t: any) => t.id !== body.id);
        break;
      case 'DELETE_ALL_TRANSACTIONS':
        db.transactions = [];
        break;
      case 'ADD_PRODUCT':
        db.products.push({ ...body.data, id: Date.now() });
        break;
      case 'UPDATE_PRODUCT':
        const uIdx = db.products.findIndex((p: any) => p.id === body.data.id);
        if (uIdx !== -1) db.products[uIdx] = { ...body.data };
        break;
      case 'DELETE_PRODUCT':
        db.products = db.products.filter((p: any) => p.id !== body.id);
        break;
    }
    writeDB(db);
    return NextResponse.json({ success: true });
  } catch (error) { return NextResponse.json({ success: false }, { status: 500 }); }
}