import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'db.json');

const readDb = () => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content || '{"products":[], "transactions":[]}');
  } catch {
    return { products: [], transactions: [] };
  }
};

export async function GET() {
  const data = readDb();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = readDb();

    if (body.type === 'TRANSACTION') {
      data.transactions.unshift(body.transaction);
      body.cart.forEach((item: any) => {
        const p = data.products.find((p: any) => p.id === item.id);
        if (p) p.stock -= item.qty;
      });
    }

    if (body.type === 'ADD_PRODUCT') {
      data.products.push({ ...body.data, id: Date.now() });
    }

    if (body.type === 'UPDATE_PRODUCT') {
      data.products = data.products.map((p: any) => p.id === body.data.id ? body.data : p);
    }

    if (body.type === 'DELETE_PRODUCT') {
      data.products = data.products.filter((p: any) => p.id !== body.id);
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Gagal menyimpan" }, { status: 500 });
  }
}