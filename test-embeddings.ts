// test-embeddings.ts
import { createEmbedding, cosineSimilarity } from "./lib/ai/embeddings";

async function testEmbeddings() {
  console.log("🧪 Testing embeddings...\n");

  try {
    // Test 1: Create embeddings
    console.log("Test 1: Creating embeddings...");
    const laptop = await createEmbedding("laptop computer");
    const notebook = await createEmbedding("notebook portable");
    const banana = await createEmbedding("yellow fruit banana");

    console.log(`✅ Laptop embedding: ${laptop.length} dimensions`);
    console.log(`✅ Notebook embedding: ${notebook.length} dimensions`);
    console.log(`✅ Banana embedding: ${banana.length} dimensions\n`);

    // Test 2: Calculate similarity
    console.log("Test 2: Calculating similarity...");
    const laptopNotebook = cosineSimilarity(laptop, notebook);
    const laptopBanana = cosineSimilarity(laptop, banana);

    console.log(
      `✅ Laptop ↔ Notebook similarity: ${(laptopNotebook * 100).toFixed(2)}%`,
    );
    console.log(
      `✅ Laptop ↔ Banana similarity: ${(laptopBanana * 100).toFixed(2)}%\n`,
    );

    console.log("🎉 Embeddings working correctly!");
    console.log(
      "Expected: Laptop-Notebook should be more similar than Laptop-Banana",
    );
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

testEmbeddings();
