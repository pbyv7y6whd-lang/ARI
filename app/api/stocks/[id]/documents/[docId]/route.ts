import { NextRequest, NextResponse } from "next/server";
import { updateDocument, deleteDocument, setupDb } from "@/lib/db";

type Params = { params: Promise<{ id: string; docId: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  await setupDb();
  const { docId } = await params;
  const body = await request.json();
  await updateDocument(docId, {
    display_name: body.display_name ?? null,
    doc_type: body.doc_type,
    year: body.year ?? null,
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  await setupDb();
  const { docId } = await params;
  await deleteDocument(docId);
  return NextResponse.json({ ok: true });
}
