import { sql } from "@vercel/postgres";

export async function setupDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS stocks (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      ticker TEXT,
      sector TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      progress INTEGER NOT NULL DEFAULT 0,
      progress_message TEXT,
      analysis JSONB,
      doc_count INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE stocks ADD COLUMN IF NOT EXISTS entity_type TEXT NOT NULL DEFAULT 'corporate'`;

  await sql`
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      stock_id TEXT NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
      file_name TEXT NOT NULL,
      doc_type TEXT NOT NULL DEFAULT 'annual_report',
      year TEXT,
      blob_url TEXT NOT NULL,
      page_count INTEGER,
      word_count INTEGER,
      parsed_content JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  // Add parsed_content column to existing tables that predate this migration
  await sql`ALTER TABLE documents ADD COLUMN IF NOT EXISTS parsed_content JSONB`;
}

export async function createStock(stock: {
  id: string;
  name: string;
  ticker: string | null;
  sector: string | null;
  entity_type?: string;
}) {
  const entityType = stock.entity_type || "corporate";
  await sql`
    INSERT INTO stocks (id, name, ticker, sector, entity_type, status, progress)
    VALUES (${stock.id}, ${stock.name}, ${stock.ticker}, ${stock.sector}, ${entityType}, 'pending', 0)
  `;
}

export async function addDocument(doc: {
  id: string;
  stock_id: string;
  file_name: string;
  doc_type: string;
  year: string | null;
  blob_url: string;
  page_count: number | null;
  word_count: number | null;
  parsed_content?: object | null;
}) {
  await sql`
    INSERT INTO documents (id, stock_id, file_name, doc_type, year, blob_url, page_count, word_count, parsed_content)
    VALUES (${doc.id}, ${doc.stock_id}, ${doc.file_name}, ${doc.doc_type}, ${doc.year}, ${doc.blob_url}, ${doc.page_count}, ${doc.word_count}, ${doc.parsed_content ? JSON.stringify(doc.parsed_content) : null}::jsonb)
  `;
  await sql`
    UPDATE stocks SET doc_count = doc_count + 1, updated_at = NOW() WHERE id = ${doc.stock_id}
  `;
}

export async function getDocumentsForStock(stockId: string) {
  const result = await sql`
    SELECT * FROM documents WHERE stock_id = ${stockId} ORDER BY year DESC, created_at DESC
  `;
  return result.rows;
}

export async function updateStock(
  id: string,
  fields: {
    status?: string;
    progress?: number;
    progress_message?: string;
    analysis?: object;
    sector?: string;
  }
) {
  if (fields.analysis !== undefined) {
    await sql`
      UPDATE stocks SET
        status = COALESCE(${fields.status ?? null}, status),
        progress = COALESCE(${fields.progress ?? null}, progress),
        progress_message = COALESCE(${fields.progress_message ?? null}, progress_message),
        analysis = ${JSON.stringify(fields.analysis)}::jsonb,
        sector = COALESCE(${fields.sector ?? null}, sector),
        updated_at = NOW()
      WHERE id = ${id}
    `;
  } else {
    await sql`
      UPDATE stocks SET
        status = COALESCE(${fields.status ?? null}, status),
        progress = COALESCE(${fields.progress ?? null}, progress),
        progress_message = COALESCE(${fields.progress_message ?? null}, progress_message),
        sector = COALESCE(${fields.sector ?? null}, sector),
        updated_at = NOW()
      WHERE id = ${id}
    `;
  }
}

export async function getStock(id: string) {
  const result = await sql`SELECT * FROM stocks WHERE id = ${id}`;
  return result.rows[0] ?? null;
}

export async function getAllStocks(entityType?: string) {
  if (entityType) {
    const result = await sql`
      SELECT
        id, name, ticker, sector, entity_type, status, progress, progress_message,
        doc_count, created_at, updated_at,
        analysis->'overallScore' as overall_score,
        analysis->'snapshot' as snapshot,
        analysis->'creditVerdict' as credit_verdict,
        analysis->'bullCase'->'points'->0->>'title' as top_bull,
        analysis->'bearCase'->'points'->0->>'title' as top_bear,
        analysis->'fiscalProfile' as fiscal_profile,
        analysis->'externalSector' as external_sector,
        analysis->'creditMetrics' as credit_metrics
      FROM stocks
      WHERE entity_type = ${entityType}
      ORDER BY updated_at DESC
    `;
    return result.rows;
  }
  const result = await sql`
    SELECT
      id, name, ticker, sector, entity_type, status, progress, progress_message,
      doc_count, created_at, updated_at,
      analysis->'overallScore' as overall_score,
      analysis->'snapshot' as snapshot,
      analysis->'creditVerdict' as credit_verdict,
      analysis->'bullCase'->'points'->0->>'title' as top_bull,
      analysis->'bearCase'->'points'->0->>'title' as top_bear,
      analysis->'fiscalProfile' as fiscal_profile,
      analysis->'externalSector' as external_sector,
      analysis->'creditMetrics' as credit_metrics
    FROM stocks
    ORDER BY updated_at DESC
  `;
  return result.rows;
}

export async function deleteStock(id: string) {
  await sql`DELETE FROM stocks WHERE id = ${id}`;
}
