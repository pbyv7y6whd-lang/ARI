import { NextRequest, NextResponse } from "next/server";
import { getStock, deleteStock, getDocumentsForStock, setupDb } from "@/lib/db";
import { requireAuth } from "@/lib/session";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  await setupDb();
  const { id } = await params;
  const stock = await getStock(id);
  if (!stock) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const documents = await getDocumentsForStock(id);
  return NextResponse.json({ ...stock, documents });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  await setupDb();
  const { id } = await params;
  await deleteStock(id);
  return NextResponse.json({ ok: true });
}
