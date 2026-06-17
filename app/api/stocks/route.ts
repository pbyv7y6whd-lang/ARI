import { NextRequest, NextResponse } from "next/server";
import { getAllStocks, createStock, setupDb } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function GET(request: NextRequest) {
  await setupDb();
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || undefined;
  return NextResponse.json(await getAllStocks(type));
}

export async function POST(request: NextRequest) {
  await setupDb();

  const { name, ticker, sector, entity_type } = await request.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const id = uuidv4();
  await createStock({
    id,
    name: name.trim(),
    ticker: ticker?.trim() || null,
    sector: sector?.trim() || null,
    entity_type: entity_type || "corporate",
  });
  return NextResponse.json({ id });
}
