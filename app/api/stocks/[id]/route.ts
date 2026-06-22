import { NextRequest, NextResponse } from "next/server";
import { getStock, deleteStock, updateStock, getDocumentsForStock, setupDb } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await setupDb();
  const { id } = await params;
  const stock = await getStock(id);
  if (!stock) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const documents = await getDocumentsForStock(id);
  return NextResponse.json({ ...stock, documents });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await setupDb();
  const { id } = await params;
  const body = await req.json();
  await updateStock(id, body);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await setupDb();
  const { id } = await params;
  await deleteStock(id);
  return NextResponse.json({ ok: true });
}
