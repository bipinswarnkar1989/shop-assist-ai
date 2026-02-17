// lib/ai/llm.ts
import { ChatOpenAI } from "@langchain/openai";
import {
  HumanMessage,
  SystemMessage,
  AIMessage,
} from "@langchain/core/messages";

/**
 * Groq Configuration
 * Using Llama 3.3 70B - best free model available
 */
const GROQ_CONFIG = {
  modelName: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
  temperature: 0.7,
  maxTokens: 1000,
  timeout: 15000,
} as const;

// Singleton instance
let llmInstance: ChatOpenAI | null = null;

export function getLLM(): ChatOpenAI {
  if (!llmInstance) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not configured");
    }

    llmInstance = new ChatOpenAI({
      ...GROQ_CONFIG,
      openAIApiKey: process.env.GROQ_API_KEY,
      configuration: {
        baseURL: process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1",
      },
    });
  }
  return llmInstance;
}

/**
 * Simple single message completion
 * Used for: Basic chat, one-off questions
 */
export async function getChatCompletion(
  userMessage: string,
  systemPrompt?: string,
): Promise<string> {
  const llm = getLLM();

  const messages = [];

  if (systemPrompt) {
    messages.push(new SystemMessage(systemPrompt));
  }

  messages.push(new HumanMessage(userMessage));

  const response = await llm.invoke(messages);
  return response.content.toString();
}

/**
 * Multi-turn conversation with history
 * Used for: Ongoing conversations (Layer 4)
 *
 * TODO: Wire this up when we add conversation history
 */
export async function getChatCompletionWithHistory(
  conversationHistory: Array<{
    role: "user" | "assistant" | "system";
    content: string;
  }>,
  systemPrompt?: string,
): Promise<string> {
  const llm = getLLM();

  const messages = [];

  // Add system prompt first
  if (systemPrompt) {
    messages.push(new SystemMessage(systemPrompt));
  }

  // Convert history to LangChain message format
  for (const msg of conversationHistory) {
    if (msg.role === "user") {
      messages.push(new HumanMessage(msg.content));
    } else if (msg.role === "assistant") {
      messages.push(new AIMessage(msg.content));
    }
  }

  const response = await llm.invoke(messages);
  return response.content.toString();
}
