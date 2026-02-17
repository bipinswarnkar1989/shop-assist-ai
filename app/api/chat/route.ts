// app/api/chat/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getChatCompletion } from "@/lib/ai/llm";
import {
  searchProducts,
  formatProductsForLLM,
  Product,
} from "@/lib/db/products";
import { z } from "zod";

/**
 * WHAT: Enhanced chat API with product search
 * WHY: Show real products, not LLM hallucinations
 * HOW: Search DB → Format products → Send to LLM as context
 *
 * HinEnglish: User ka message leke pehle products dhundho,
 * phir LLM ko bolo "in products ke baare mein baat karo"
 */

const ChatRequestSchema = z.object({
  message: z.string().min(1).max(1000),
  conversationId: z.string().optional(),
});

/**
 * Enhanced system prompt with product context
 */
const SYSTEM_PROMPT = `You are ShopAssist AI, a helpful customer support assistant for an electronics retail company.

CRITICAL RULES:
1. ONLY recommend products from the "Available Products" context provided below
2. NEVER make up product names, prices, or features
3. If no products match, say so honestly and suggest alternatives
4. Always mention exact prices in euros (€)
5. Be conversational and helpful, not robotic

You help customers with:
- Finding products (laptops, phones, TVs, headphones, etc.)
- Product comparisons and recommendations
- Explaining specifications
- Price ranges and budgets

Guidelines:
- Be friendly and concise
- Ask clarifying questions when needed
- Compare products when relevant
- Highlight key features that matter to the user`;

/**
 * Extract search intent from user message
 *
 * WHAT: Detect if user wants product search
 * WHY: Know when to query database
 * HOW: Look for keywords like "show me", "find", product categories
 *
 * HinEnglish: User kya chahta hai ye samajhna - products dhundne hain ya simple chat?
 */
function detectSearchIntent(message: string): {
  shouldSearch: boolean;
  query: string;
} {
  const lowerMessage = message.toLowerCase();

  // Keywords that indicate product search
  const searchKeywords = [
    "show me",
    "find",
    "looking for",
    "need",
    "want",
    "recommend",
    "suggest",
    "best",
    "cheapest",
    "affordable",
    "laptop",
    "phone",
    "tv",
    "headphone",
    "smartphone",
    "under",
    "below",
    "budget",
    "price",
  ];

  const hasSearchKeyword = searchKeywords.some((keyword) =>
    lowerMessage.includes(keyword),
  );

  return {
    shouldSearch: hasSearchKeyword,
    query: message,
  };
}

/**
 * Extract price range from user message
 *
 * WHAT: Parse "under 1000 euros" or "between 500 and 1000"
 * WHY: Filter products by budget
 * HOW: Regex to find numbers + price keywords
 */
function extractPriceRange(message: string): {
  maxPrice?: number;
  minPrice?: number;
} {
  const lowerMessage = message.toLowerCase();

  // Match "under X", "below X", "less than X"
  const underMatch = lowerMessage.match(
    /(?:under|below|less than|max|maximum)\s*€?\s*(\d+)/,
  );
  if (underMatch) {
    return { maxPrice: parseInt(underMatch[1]) };
  }

  // Match "between X and Y"
  const rangeMatch = lowerMessage.match(
    /between\s*€?\s*(\d+)\s*and\s*€?\s*(\d+)/,
  );
  if (rangeMatch) {
    return {
      minPrice: parseInt(rangeMatch[1]),
      maxPrice: parseInt(rangeMatch[2]),
    };
  }

  // Match "above X", "over X", "more than X"
  const aboveMatch = lowerMessage.match(
    /(?:above|over|more than|min|minimum)\s*€?\s*(\d+)/,
  );
  if (aboveMatch) {
    return { minPrice: parseInt(aboveMatch[1]) };
  }

  return {};
}

/**
 * POST /api/chat
 * Main chat endpoint with product integration
 */
export async function POST(req: NextRequest) {
  try {
    // Step 1: Validate input
    const body = await req.json();
    const validatedData = ChatRequestSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validatedData.error.issues },
        { status: 400 },
      );
    }

    const { message } = validatedData.data;

    // Step 2: Detect if user wants product search
    const { shouldSearch, query } = detectSearchIntent(message);

    let productsContext = "";
    let foundProducts: Product[] = [];

    if (shouldSearch) {
      console.log("[Chat API] Searching products for:", query);

      // Step 3: Search products
      const products = await searchProducts(query);
      foundProducts = products;

      console.log(`[Chat API] Found ${products.length} products`);

      // Step 4: Format products for LLM
      productsContext =
        products.length > 0
          ? `\n\nAvailable Products:\n${formatProductsForLLM(products)}`
          : "\n\nNo products found matching this query.";
    }

    // Step 5: Build enhanced prompt
    const enhancedPrompt = `${SYSTEM_PROMPT}${productsContext}`;

    // Step 6: Get AI response
    const aiResponse = await getChatCompletion(message, enhancedPrompt);

    // Step 7: Return response with products
    return NextResponse.json({
      message: aiResponse,
      products: foundProducts.slice(0, 3), // Send top 3 products to frontend
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Chat API Error]:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
