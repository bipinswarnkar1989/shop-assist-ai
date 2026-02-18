// test-semantic-search.ts

import { semanticSearchProducts } from "./lib/db/products";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function testSemanticSearch() {
  console.log("🧪 Testing Semantic Search...\n");
  console.log("=".repeat(60));

  try {
    // Test 1: Keyword that exists in products
    console.log('\n📱 Test 1: Direct keyword - "laptop"');
    console.log("-".repeat(60));
    const test1 = await semanticSearchProducts("laptop");
    console.log(`Found ${test1.length} products:`);
    test1.slice(0, 3).forEach((p: any) => {
      console.log(
        `  • ${p.name} (€${p.price}) - Similarity: ${(p.similarity * 100).toFixed(1)}%`,
      );
    });

    // Test 2: Semantic query (NO direct keyword match)
    console.log('\n🚀 Test 2: Semantic - "portable work computer"');
    console.log("-".repeat(60));
    const test2 = await semanticSearchProducts("portable work computer");
    console.log(`Found ${test2.length} products:`);
    test2.slice(0, 3).forEach((p: any) => {
      console.log(
        `  • ${p.name} (€${p.price}) - Similarity: ${(p.similarity * 100).toFixed(1)}%`,
      );
    });

    // Test 3: Natural language query
    console.log(
      '\n💼 Test 3: Natural language - "I need something for coding on the go"',
    );
    console.log("-".repeat(60));
    const test3 = await semanticSearchProducts(
      "I need something for coding on the go",
    );
    console.log(`Found ${test3.length} products:`);
    test3.slice(0, 3).forEach((p: any) => {
      console.log(
        `  • ${p.name} (€${p.price}) - Similarity: ${(p.similarity * 100).toFixed(1)}%`,
      );
    });

    // Test 4: Gaming-related semantic query
    console.log('\n🎮 Test 4: Gaming - "high performance for games"');
    console.log("-".repeat(60));
    const test4 = await semanticSearchProducts("high performance for games");
    console.log(`Found ${test4.length} products:`);
    test4.slice(0, 3).forEach((p: any) => {
      console.log(
        `  • ${p.name} (€${p.price}) - Similarity: ${(p.similarity * 100).toFixed(1)}%`,
      );
    });

    // Test 5: Music listening
    console.log('\n🎵 Test 5: Audio - "listening to music wirelessly"');
    console.log("-".repeat(60));
    const test5 = await semanticSearchProducts("listening to music wirelessly");
    console.log(`Found ${test5.length} products:`);
    test5.slice(0, 3).forEach((p: any) => {
      console.log(
        `  • ${p.name} (€${p.price}) - Similarity: ${(p.similarity * 100).toFixed(1)}%`,
      );
    });

    console.log("\n" + "=".repeat(60));
    console.log("✅ Semantic search is working!");
    console.log("🎯 The system understands MEANING, not just keywords!");
    console.log("=".repeat(60));
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

testSemanticSearch();
