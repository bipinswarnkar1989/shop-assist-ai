// test-setup.ts
import { ChatOpenAI } from "@langchain/openai";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function testSetup() {
  console.log("✅ Step 1: Imports successful");

  if (!process.env.GROQ_API_KEY) {
    console.error("❌ GROQ_API_KEY not found");
    console.log("📝 Get it from: https://console.groq.com/");
    return;
  }

  console.log("✅ Step 2: Groq API key found");

  try {
    const llm = new ChatOpenAI({
      modelName: "llama-3.3-70b-versatile",
      temperature: 0.7,
      openAIApiKey: process.env.GROQ_API_KEY,
      configuration: {
        baseURL: "https://api.groq.com/openai/v1",
      },
    });

    console.log("✅ Step 3: Groq LLM instance created");
    console.log("🧪 Testing API call (watch the speed!)...");

    const startTime = Date.now();
    const response = await llm.invoke("Say 'Hello' in one word");
    const duration = Date.now() - startTime;

    console.log("✅ Step 4: API call successful!");
    console.log(`📨 Response: ${response.content}`);
    console.log(`⚡️ Speed: ${duration}ms (BLAZING FAST!)`);
    console.log("\n✅ All set! Groq is working perfectly!");
    console.log("💰 100% FREE with generous limits!");
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

testSetup();
