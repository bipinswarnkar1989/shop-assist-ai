// types/index.ts

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  products?: Product[]; // ← Add this
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string | null;
  brand: string | null;
  image_url: string | null;
  stock: number;
  rating: number;
  specs: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ChatResponse {
  message: string;
  products?: Product[]; // ← Add this
  timestamp: string;
  error?: string;
}
