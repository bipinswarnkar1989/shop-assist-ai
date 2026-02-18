// lib/db/rpc-types.ts

/**
 * WHAT: Type definitions for custom Supabase RPC functions
 * WHY: TypeScript type safety for database functions
 */

export interface MatchProductsParams {
  query_embedding: number[];
  match_threshold: number;
  match_count: number;
}

export interface MatchProductsWithPriceParams {
  query_embedding: number[];
  match_threshold: number;
  match_count: number;
  min_price: number;
  max_price: number;
}

export interface ProductWithSimilarity {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string | null;
  image_url: string | null;
  stock: number;
  rating: number;
  specs: Record<string, any>;
  search_vector: unknown;
  created_at: string;
  updated_at: string;
  embedding: number[];
  similarity: number; // ← This is new!
}
