export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: string | Date;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
}
