/**
 * Embed text into a 1024-dim vector using the configured embedding model.
 *
 * Provider: DeepSeek-compatible API (bge-m3 via /v1/embeddings).
 * Graceful degradation: returns null on any failure so the caller can
 * skip RAG instead of crashing the whole stage.
 */

import { embed } from 'ai';
import { modelProvider } from '../providers';

export const EMBEDDING_MODEL = 'deepseek-embedding' as const;
export const EMBEDDING_DIMENSIONS = 1024;

export async function embedText(text: string): Promise<number[] | null> {
  const trimmed = text.trim();
  if (!trimmed) return null;

  try {
    const { embedding } = await embed({
      model: modelProvider.textEmbeddingModel(EMBEDDING_MODEL),
      value: trimmed,
    });
    if (!embedding || embedding.length !== EMBEDDING_DIMENSIONS) {
      console.warn(
        `[embedder] unexpected embedding length: ${embedding?.length ?? 0} (expected ${EMBEDDING_DIMENSIONS})`,
      );
    }
    return embedding ?? null;
  } catch (err) {
    console.warn('[embedder] embedding failed, KB will be empty for this call:', err);
    return null;
  }
}
