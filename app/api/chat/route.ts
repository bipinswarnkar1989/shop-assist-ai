// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getChatCompletion } from "@/lib/ai/llm";
import { z } from "zod";

/**
 * Input validation schema
 * Senior Principle: NEVER trust user input
 */
const ChatRequestSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty")
    .max(1000, "Message too long"),
  conversationId: z.string().optional(),
});

/**
 * System prompt for our e-commerce assistant
 * Senior Principle: Keep prompts configurable, not hardcoded deep in logic
 */
const SYSTEM_PROMPT = `You are ShopAssist AI, a helpful customer support assistant 
for an electronics retail company.

You help customers with:
- Finding products (laptops, phones, TVs, headphones, etc.)
- Product comparisons and recommendations
- Order tracking and status
- Return and refund policies
- Technical specifications

Guidelines:
- Be friendly, concise, and helpful
- Ask clarifying questions when needed
- If you don't know something, say so honestly
- Keep responses under 150 words unless detail is needed`;

/**
 * POST /api/chat
 *
 * Current Layer 1: Basic chat with LLM
 * TODO Layer 2: Add product search from DB
 * TODO Layer 3: Add RAG semantic search
 * TODO Layer 4: Add conversation history
 */
export async function POST(req: NextRequest) {
  try {
    // Step 1: Parse and validate request
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

    // Step 2: Get AI response (Layer 1 - direct LLM call)
    // Later we'll add: const products = await searchProducts(message);
    const aiResponse = await getChatCompletion(message, SYSTEM_PROMPT);

    // Step 3: Return response
    // Later we'll add: await saveMessage(message, aiResponse);
    return NextResponse.json({
      message: aiResponse,
      timestamp: new Date().toISOString(),
      // Later we'll add: products, conversationId
    });
  } catch (error) {
    console.error("[Chat API Error]:", error);

    // Different error types need different responses
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 },
      );
    }

    // LLM errors
    if (error instanceof Error && error.message.includes("429")) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment." },
        { status: 429 },
      );
    }

    // Generic server error
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
