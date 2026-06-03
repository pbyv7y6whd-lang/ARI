import { NextRequest, NextResponse } from "next/server";
import { getAllStocks, createStock, setupDb } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  await setupDb();
  return NextResponse.json(await getAllStocks());
}

export async function POST(request: NextRequest) {
  await setupDb();

  const { name, ticker, sector } = await request.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const id = uuidv4();
  await createStock({ id, name: name.trim(), ticker: ticker?.trim() || null, sector: sector?.trim() || null });
  return NextResponse.json({ id });
}
