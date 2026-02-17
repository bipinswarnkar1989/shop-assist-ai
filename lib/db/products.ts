// lib/db/products.ts

/**
 * WHAT: Functions to interact with products table
 * WHY: Abstraction layer (changes to DB logic only here)
 *
 * Senior Pattern: Don't write SQL everywhere, centralize here!
 */

// ✅ NEW (works everywhere):
import { getSupabaseClient } from "./supabase";
import { Database } from "./types";

// Type for Product (matches database row)
export type Product = Database["public"]["Tables"]["products"]["Row"];

// Then in each function, use:
const supabase = getSupabaseClient();

/**
 * Get all products
 *
 * WHAT: Fetch sabhi products
 * WHY: Admin dashboard, testing
 * WHEN: Rarely (usually search by category/price)
 */
export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("[DB Error] getAllProducts:", error);
    throw new Error("Failed to fetch products");
  }

  return data || [];
}

/**
 * Search products by keyword
 *
 * WHAT: Natural language search in name, description, brand
 * WHY: User types "gaming laptop" → finds relevant products
 * HOW: PostgreSQL full-text search (already set up!)
 *
 * HinEnglish: User jo bhi type kare, usse related products dhundho
 */
export async function searchProducts(query: string): Promise<Product[]> {
  // Clean the query (remove special characters)
  const cleanQuery = query.trim().toLowerCase();

  if (!cleanQuery) {
    return [];
  }

  // Use PostgreSQL full-text search
  // search_vector column automatically indexes name, description, brand, category
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .textSearch("search_vector", cleanQuery, {
      type: "websearch",
      config: "english",
    })
    .limit(10); // Max 10 results (enough for chat)

  if (error) {
    console.error("[DB Error] searchProducts:", error);
    // Fallback to basic search if full-text fails
    return searchProductsFallback(cleanQuery);
  }

  return data || [];
}

/**
 * Fallback search (if full-text search fails)
 *
 * WHAT: Simple LIKE search
 * WHY: Backup if advanced search breaks
 * HOW: Case-insensitive matching
 */
async function searchProductsFallback(query: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .or(
      `name.ilike.%${query}%,description.ilike.%${query}%,brand.ilike.%${query}%,category.ilike.%${query}%`,
    )
    .limit(10);

  if (error) {
    console.error("[DB Error] searchProductsFallback:", error);
    return [];
  }

  return data || [];
}

/**
 * Search products by category
 *
 * WHAT: Filter by exact category
 * WHY: User wants "show me all laptops"
 */
export async function getProductsByCategory(
  category: string,
): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category", category.toLowerCase())
    .order("rating", { ascending: false }); // Best rated first

  if (error) {
    console.error("[DB Error] getProductsByCategory:", error);
    throw new Error("Failed to fetch products by category");
  }

  return data || [];
}

/**
 * Search products with price filter
 *
 * WHAT: Find products within price range
 * WHY: User says "laptop under 1000 euros"
 *
 * HinEnglish: Price ke range mein products dhundho
 */
export async function searchProductsWithPrice(
  query: string,
  maxPrice?: number,
  minPrice?: number,
): Promise<Product[]> {
  let queryBuilder = supabase
    .from("products")
    .select("*")
    .textSearch("search_vector", query, {
      type: "websearch",
      config: "english",
    });

  // Add price filters if provided
  if (maxPrice !== undefined) {
    queryBuilder = queryBuilder.lte("price", maxPrice);
  }

  if (minPrice !== undefined) {
    queryBuilder = queryBuilder.gte("price", minPrice);
  }

  const { data, error } = await queryBuilder
    .order("price", { ascending: true }) // Cheapest first
    .limit(10);

  if (error) {
    console.error("[DB Error] searchProductsWithPrice:", error);
    return [];
  }

  return data || [];
}

/**
 * Get product by ID
 *
 * WHAT: Fetch single product details
 * WHY: User clicks on a product, wants more info
 */
export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("[DB Error] getProductById:", error);
    return null;
  }

  return data;
}

/**
 * Format product for LLM context
 *
 * WHAT: Convert product object to readable text
 * WHY: LLM needs text, not JSON objects
 *
 * HinEnglish: Product ka data LLM ko samajh aaye aise format mein convert karo
 */
export function formatProductForLLM(product: Product): string {
  return `
Product: ${product.name}
Brand: ${product.brand || "N/A"}
Price: €${product.price.toFixed(2)}
Rating: ${product.rating}/5
Description: ${product.description}
Stock: ${product.stock > 0 ? "In Stock" : "Out of Stock"}
`.trim();
}

/**
 * Format multiple products for LLM
 *
 * WHAT: Convert array of products to text
 * WHY: Give LLM context of available products
 */
export function formatProductsForLLM(products: Product[]): string {
  if (products.length === 0) {
    return "No products found matching your criteria.";
  }

  return products
    .map((p, idx) => `${idx + 1}. ${formatProductForLLM(p)}`)
    .join("\n\n---\n\n");
}
