// lib/ai/embeddings.ts

/**
 * WHAT: Text → Vector embeddings service
 * WHY: Convert product descriptions to searchable vectors
 * HOW: Use Transformers.js (free, local embeddings)
 *
 * HinEnglish: Text ko numbers mein convert karta hai
 * taaki similar meanings dhundh sakein
 */

import { pipeline, env } from "@xenova/transformers";

// Disable local model caching for serverless (Next.js)
env.allowLocalModels = false;
env.useBrowserCache = false;

/**
 * Embedding model configuration
 * Model: all-MiniLM-L6-v2
 * - Size: Small (~25MB)
 * - Dimensions: 384
 * - Quality: Good for semantic search
 * - Speed: Fast
 */
const MODEL_NAME = "Xenova/all-MiniLM-L6-v2";

// Singleton pattern
let embedder: any = null;

/**
 * Get or create embedder instance
 */
async function getEmbedder() {
  if (!embedder) {
    console.log("[Embeddings] Loading model:", MODEL_NAME);
    embedder = await pipeline("feature-extraction", MODEL_NAME);
    console.log("[Embeddings] ✅ Model loaded");
  }
  return embedder;
}

/**
 * Create embedding from text
 *
 * @param text - Input text
 * @returns Array of 384 numbers representing meaning
 *
 * Example:
 * "laptop" → [0.23, 0.87, 0.45, ..., 0.12] (384 numbers)
 */
export async function createEmbedding(text: string): Promise<number[]> {
  if (!text || text.trim().length === 0) {
    throw new Error("Text cannot be empty");
  }

  const embedder = await getEmbedder();

  // Generate embedding
  const output = await embedder(text, {
    pooling: "mean",
    normalize: true,
  });

  // Convert to regular array
  const embedding = Array.from(output.data) as number[];

  console.log(
    `[Embeddings] Created embedding for: "${text.substring(0, 50)}..." (${embedding.length} dims)`,
  );

  return embedding;
}

/**
 * Create embeddings for multiple texts (batch processing)
 * More efficient than one-by-one
 */
export async function createEmbeddings(texts: string[]): Promise<number[][]> {
  const embeddings: number[][] = [];

  for (const text of texts) {
    const embedding = await createEmbedding(text);
    embeddings.push(embedding);
  }

  return embeddings;
}

/**
 * Calculate cosine similarity between two embeddings
 * Returns: 0 to 1 (1 = identical, 0 = completely different)
 *
 * HinEnglish: Do vectors kitne similar hain ye calculate karta hai
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must have same length");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
