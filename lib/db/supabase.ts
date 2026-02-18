// lib/db/supabase.ts

/**
 * WHAT: Supabase database client
 * WHY: To connect our Next.js app to PostgreSQL database
 * HOW: Singleton pattern (ek hi instance reuse karte hain)
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Database } from "./types";

// Singleton instance (senior pattern - memory bachane ke liye)
let supabaseInstance: SupabaseClient<Database> | null = null;

/**
 * Get Supabase client
 *
 * WHAT: Function to get database connection
 * WHY: Reuse same connection (faster, efficient)
 *
 * HinEnglish: Ek baar connection banao, baar baar use karo
 */
export function getSupabaseClient() {
  // If already created, return it (don't create again)
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // Get credentials from environment variables
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://rmdnnsdyyequglbixocw.supabase.co";
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtZG5uc2R5eWVxdWdsYml4b2N3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyODI1NDgsImV4cCI6MjA4Njg1ODU0OH0.uLgD_JJ7YWtzQrdlNUOm9cH5NHZEgX-QFN7M_oQb2EQ";

  // Safety check (good practice)
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase credentials in .env.local");
  }

  // Create new client
  supabaseInstance = createClient<Database>(supabaseUrl, supabaseKey);

  return supabaseInstance;
}

// Helper function for convenience
export function getSupabase() {
  return getSupabaseClient();
}
