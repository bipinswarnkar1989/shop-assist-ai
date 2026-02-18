// app/api/chat/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getChatCompletion } from "@/lib/ai/llm";
import {
  searchProducts,
  searchProductsWithPrice,
  formatProductsForLLM,
  Product,
  semanticSearchProductsWithPrice,
  semanticSearchProducts,
} from "@/lib/db/products";
import { z } from "zod";

/**
 * WHAT: Enhanced chat API with product search + RAG
 * WHY: Show real products, prevent LLM hallucinations
 * HOW: Search DB → Format products → Send to LLM as strict context
 *
 * HinEnglish: User ka message leke pehle products dhundho,
 * phir LLM ko SIRF un products ke baare mein bolne do
 */

// ==================== VALIDATION ====================

const ChatRequestSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty")
    .max(1000, "Message too long"),
  conversationId: z.string().optional(),
});

// ==================== SYSTEM PROMPT ====================

const SYSTEM_PROMPT = `You are ShopAssist AI, a helpful electronics retail assistant.

⚠️ CRITICAL RULES - NEVER BREAK THESE:

1. You will receive "AVAILABLE PRODUCTS" below
2. ONLY recommend products from that list
3. Use EXACT product names and EXACT prices (with € symbol)
4. NEVER invent or make up products, prices, or specifications
5. If a product is not in the AVAILABLE PRODUCTS list, it does NOT exist
6. If no products are available, say "I don't have any products matching that criteria right now"

Response Guidelines:
- Be friendly and conversational
- Use product names EXACTLY as shown
- Always include the exact price with € symbol
- Mention key features from the description
- Ask clarifying questions when helpful
- Compare products when relevant

Remember: ONLY use products from the AVAILABLE PRODUCTS section!`;

// ==================== HELPER FUNCTIONS ====================

/**
 * Detect if user wants product search
 *
 * WHAT: Check if message indicates product search intent
 * WHY: Don't query DB for simple greetings like "hello"
 * HOW: Look for product keywords and search phrases
 */
function detectSearchIntent(message: string): {
  shouldSearch: boolean;
  query: string;
} {
  const lowerMessage = message.toLowerCase();

  // Keywords that indicate product search
  const searchKeywords = [
    "show me",
    "show",
    "find",
    "looking for",
    "looking",
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
    "television",
    "headphone",
    "smartphone",
    "under",
    "below",
    "budget",
    "price",
    "buy",
    "purchase",
    "get",
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
 * WHY: Filter products by user's budget
 * HOW: Regex patterns to find price indicators
 *
 * Examples:
 * - "laptop under 1000" → maxPrice: 1000
 * - "between 500 and 1000" → minPrice: 500, maxPrice: 1000
 * - "above 2000" → minPrice: 2000
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
 * Validate LLM response doesn't contain hallucinated products
 *
 * Senior Technique: Check if LLM used real product names
 * If validation fails, we can retry with stricter prompt
 */
function validateResponse(
  aiResponse: string,
  validProducts: Product[],
): boolean {
  if (validProducts.length === 0) {
    return true; // No products to validate against
  }

  const validProductNames = validProducts.map((p) => p.name.toLowerCase());
  const responseLower = aiResponse.toLowerCase();

  // Check if response contains at least one valid product name
  const hasValidProduct = validProductNames.some((name) =>
    responseLower.includes(name.toLowerCase()),
  );

  return hasValidProduct;
}

// ==================== MAIN API ENDPOINT ====================

/**
 * POST /api/chat
 *
 * Main chat endpoint with RAG (Retrieval Augmented Generation)
 *
 * Flow:
 * 1. Validate user input
 * 2. Detect if product search is needed
 * 3. Search database for relevant products
 * 4. Format products as context for LLM
 * 5. Send to LLM with strict instructions
 * 6. Validate response (optional)
 * 7. Return response + products to frontend
 */
export async function POST(req: NextRequest) {
  try {
    // ===== STEP 1: Validate Input =====
    const body = await req.json();
    const validatedData = ChatRequestSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          details: validatedData.error.issues,
        },
        { status: 400 },
      );
    }

    const { message } = validatedData.data;

    // ===== STEP 2: Detect Search Intent =====
    const { shouldSearch, query } = detectSearchIntent(message);

    let productsContext = "";
    let foundProducts: Product[] = [];

    if (shouldSearch) {
      console.log("[Chat API] 🔍 Searching products for:", query);

      // ===== STEP 3: Extract Price Filter =====
      const priceRange = extractPriceRange(message);
      console.log("[Chat API] 💰 Price filter:", priceRange);

      // ===== STEP 4: SEMANTIC SEARCH =====
      let products: Product[];

      if (priceRange.maxPrice || priceRange.minPrice) {
        // Search with price filter
        products = await semanticSearchProductsWithPrice(
          query,
          priceRange.maxPrice,
          priceRange.minPrice,
        );
      } else {
        //  SEMANTIC search
        console.log("[Chat API] 🎯 Using SEMANTIC search");
        products = await semanticSearchProducts(query);
      }

      foundProducts = products;
      console.log(`[Chat API] ✅ Found ${products.length} products`);

      // ===== STEP 5: Format Products for LLM =====
      if (products.length > 0) {
        productsContext = `

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AVAILABLE PRODUCTS (ONLY USE THESE - DO NOT MAKE UP PRODUCTS!)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${formatProductsForLLM(products)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
END OF AVAILABLE PRODUCTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ CRITICAL REMINDER:
- Recommend ONLY products from the list above
- Use EXACT product names and EXACT prices
- Do NOT invent or make up any products
`;
      } else {
        productsContext = `

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AVAILABLE PRODUCTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

No products found matching this search criteria.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ IMPORTANT:
Tell the user politely that we don't have products matching their criteria.
Suggest they try:
- Different price range
- Different category (laptops, phones, TVs, headphones)
- Broader search terms
`;
      }
    }

    // ===== STEP 6: Build Full Prompt =====
    const fullPrompt = `${SYSTEM_PROMPT}${productsContext}`;

    // Debug: Log what we're sending to LLM
    console.log("========== CONTEXT SENT TO LLM ==========");
    console.log(fullPrompt);
    console.log("=========================================");

    // ===== STEP 7: Get AI Response =====
    const aiResponse = await getChatCompletion(message, fullPrompt);

    // ===== STEP 8: Validate Response (Optional) =====
    if (
      foundProducts.length > 0 &&
      !validateResponse(aiResponse, foundProducts)
    ) {
      console.warn("⚠️ [Chat API] LLM may have hallucinated products!");
      // In production, you might want to retry with stricter prompt
      // For now, we'll just log the warning
    }

    // ===== STEP 9: Return Response =====
    return NextResponse.json({
      message: aiResponse,
      products: foundProducts.slice(0, 3), // Top 3 products for UI cards
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ [Chat API Error]:", error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.issues,
        },
        { status: 400 },
      );
    }

    // Handle LLM errors
    if (error instanceof Error && error.message.includes("429")) {
      return NextResponse.json(
        {
          error: "Too many requests. Please wait a moment and try again.",
        },
        { status: 429 },
      );
    }

    // Generic error
    return NextResponse.json(
      {
        error: "Something went wrong. Please try again.",
      },
      { status: 500 },
    );
  }
}
