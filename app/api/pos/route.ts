import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'db.json');

// Helper untuk baca/tulis DB
const getDB = () => JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const saveDB = (db: any) => fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

export async function GET() {
  return NextResponse.json(getDB());
}

export async function POST(req: Request) {
  const body = await req.json();
  const db = getDB();

  switch (body.type) {
    case 'ADD_TRANSACTION':
      const newTransaction = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        ...body.data
      };
      db.transactions.push(newTransaction);
      // Update stok otomatis
      body.data.items.forEach((item: any) => {
        const product = db.products.find((p: any) => p.id === item.id);
        if (product) product.stock = (Number(product.stock) || 0) - item.qty;
      });
      break;

    case 'DELETE_TRANSACTION':
      db.transactions = db.transactions.filter((t: any) => t.id !== body.id);
      break;

    case 'DELETE_ALL_HISTORY':
      db.transactions = [];
      break;

    case 'ADD_PRODUCT':
      db.products.push({ id: Date.now().toString(), ...body.data });
      break;

    case 'UPDATE_PRODUCT':
      const idx = db.products.findIndex((p: any) => p.id === body.data.id);
      if (idx > -1) db.products[idx] = body.data;
      break;

    case 'DELETE_PRODUCT':
      db.products = db.products.filter((p: any) => p.id !== body.id);
      break;
  }

  saveDB(db);
  return NextResponse.json({ success: true });
}