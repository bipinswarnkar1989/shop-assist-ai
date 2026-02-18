// lib/db/types.ts

/**
 * WHAT: TypeScript types matching our database schema
 * WHY: Type safety - catches errors at compile time
 *
 * HinEnglish: Database ka naksha (blueprint) TypeScript mein
 * Agar galat field access karoge, VS Code turant batayega!
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          description: string;
          price: number;
          category: string;
          brand: string | null;
          image_url: string | null;
          stock: number;
          rating: number;
          specs: Json;
          search_vector: unknown | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          price: number;
          category: string;
          brand?: string | null;
          image_url?: string | null;
          stock?: number;
          rating?: number;
          specs?: Json;
          search_vector?: unknown | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          price?: number;
          category?: string;
          brand?: string | null;
          image_url?: string | null;
          stock?: number;
          rating?: number;
          specs?: Json;
          search_vector?: unknown | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string | null;
          order_number: string;
          status: string;
          total_amount: number;
          items: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          order_number: string;
          status?: string;
          total_amount: number;
          items: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          order_number?: string;
          status?: string;
          total_amount?: number;
          items?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          user_id: string | null;
          messages: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          messages?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          messages?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      Functions: {
        match_products: {
          Args: {
            query_embedding: number[];
            match_threshold: number;
            match_count: number;
          };
          Returns: Database["public"]["Tables"]["products"]["Row"][];
        };
        match_products_with_price: {
          Args: {
            query_embedding: number[];
            match_threshold: number;
            match_count: number;
            min_price: number;
            max_price: number;
          };
          Returns: Database["public"]["Tables"]["products"]["Row"][];
        };
      };
    };
  };
}
