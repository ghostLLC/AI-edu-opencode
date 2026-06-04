/**
 * KB Tier 1 retriever: cosine similarity over kb_entries.embedding.
 *
 * Uses pgvector <=> operator (cosine distance). Returns top-K entries
 * with similarity >= minSimilarity. Embedding failures degrade to
 * an empty result instead of throwing.
 */

import { sql } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { embedText } from './embedder';

export interface RetrievedKB {
  id: string;
  domain: string;
  language: string;
  title: string;
  description: string | null;
  similarity: number;
}

export interface RetrieveKBOptions {
  query: string;
  language?: 'en' | 'zh';
  domain?: string;
  topK?: number;
  minSimilarity?: number;
}

export async function retrieveKB(opts: RetrieveKBOptions): Promise<RetrievedKB[]> {
  const { query, language, domain, topK = 5, minSimilarity = 0.6 } = opts;

  const queryEmbedding = await embedText(query);
  if (!queryEmbedding || queryEmbedding.length === 0) {
    console.warn('[kb.retriever] no embedding (embedder failed), returning []');
    return [];
  }

  // pgvector literal format
  const vectorStr = `[${queryEmbedding.join(',')}]`;

  // Build WHERE clauses dynamically
  const filters = [sql`status = 'active'`];
  if (language) filters.push(sql`language = ${language}`);
  if (domain) filters.push(sql`domain = ${domain}`);
  const whereClause = sql.join(filters, sql` AND `);

  const result = await db.execute(sql`
    SELECT
      id,
      domain,
      language,
      title,
      description,
      1 - (embedding <=> ${vectorStr}::vector) AS similarity
    FROM kb_entries
    WHERE ${whereClause}
    ORDER BY embedding <=> ${vectorStr}::vector
    LIMIT ${topK}
  `);

  // drizzle/postgres-js returns { rows: [...] } shape
  const rawRows = (result as unknown as { rows?: unknown }).rows ?? result;
  const rows = rawRows as Array<{
    id: string;
    domain: string;
    language: string;
    title: string;
    description: string | null;
    similarity: string | number;
  }>;

  const hits = rows
    .map((r) => ({
      id: r.id,
      domain: r.domain,
      language: r.language,
      title: r.title,
      description: r.description,
      similarity:
        typeof r.similarity === 'string' ? Number.parseFloat(r.similarity) : r.similarity,
    }))
    .filter((r) => r.similarity >= minSimilarity);

  // Observability: log KB hit rate. Used for tuning the threshold + seeding strategy.
  // Format: [kb.retriever] queryLen=42 hits=3/5 topSim=0.82 lang=en domain=frontend
  const totalBeforeFilter = rows.length;
  const topSim = hits[0]?.similarity ?? 0;
  console.log(
    `[kb.retriever] queryLen=${query.length} hits=${hits.length}/${totalBeforeFilter} topSim=${topSim.toFixed(3)} lang=${language ?? '-'} domain=${domain ?? '-'} minSim=${minSimilarity}`,
  );

  return hits;
}
