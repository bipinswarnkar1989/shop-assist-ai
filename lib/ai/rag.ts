// lib/ai/rag.ts

/**
 * RAG (Retrieval Augmented Generation) Service
 *
 * STATUS: Layer 3 - Not implemented yet
 *
 * What this will do:
 * 1. Convert user query to vector embedding
 * 2. Search similar products in vector store
 * 3. Return relevant products as context for LLM
 */

import { Product } from "@/types";

/**
 * Search products by semantic similarity
 * TODO: Implement in Layer 3 (after DB setup)
 *
 * @param query - User's natural language search
 * @returns Relevant products
 */
export async function searchProducts(query: string): Promise<Product[]> {
  // TODO Layer 3: Implement vector search
  // const embedding = await createEmbedding(query);
  // const results = await vectorStore.similaritySearch(embedding);
  // return results;

  console.log("[RAG] searchProducts called - Layer 3 not implemented yet");
  return []; // Return empty for now
}

/**
 * Index a product into vector store
 * TODO: Implement in Layer 3
 */
export async function indexProduct(product: Product): Promise<void> {
  // TODO Layer 3: Store product embedding in vector DB
  console.log("[RAG] indexProduct called - Layer 3 not implemented yet");
}

/**
 * Build context string from products for LLM
 * This WILL be used once searchProducts returns real data
 */
export function buildProductContext(products: Product[]): string {
  if (products.length === 0) {
    return "No specific products found for this query.";
  }

  return products
    .map(
      (p) =>
        `Product: ${p.name}
         Price: €${p.price}
         Category: ${p.category}
         Description: ${p.description}`,
    )
    .join("\n---\n");
}
