// scripts/generate-embeddings.ts

/**
 * WHAT: Generate embeddings for all products in database
 * WHY: Enable semantic/vector search
 * HOW:
 *   1. Fetch all products from Supabase
 *   2. Create embedding for each (name + description)
 *   3. Update product with embedding
 *
 * Run once to populate embeddings
 */

import { getAllProducts } from "../lib/db/products";
import { createEmbedding } from "../lib/ai/embeddings";
import { getSupabaseClient } from "../lib/db/supabase";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function generateAllEmbeddings() {
  console.log("🚀 Starting embedding generation...\n");

  try {
    // Step 1: Fetch all products
    console.log("📦 Fetching products from database...");
    const products = await getAllProducts();
    console.log(`✅ Found ${products.length} products\n`);

    const supabase = getSupabaseClient();
    let successCount = 0;
    let errorCount = 0;

    // Step 2: Generate embedding for each product
    for (let i = 0; i < products.length; i++) {
      const product = products[i];

      console.log(`[${i + 1}/${products.length}] Processing: ${product.name}`);

      try {
        // Combine name + description for richer embedding
        const textToEmbed = `${product.name} ${product.description}`;

        // Create embedding
        const embedding = await createEmbedding(textToEmbed);

        // Update product in database
        const { error } = await supabase
          .from("products")
          .update({ embedding } as never)
          .eq("id", product.id);

        if (error) {
          console.error(`   ❌ Failed to update: ${error.message}`);
          errorCount++;
        } else {
          console.log(`   ✅ Embedding saved (${embedding.length} dims)`);
          successCount++;
        }

        // Small delay to avoid overwhelming the system
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`   ❌ Error:`, error);
        errorCount++;
      }
    }

    // Summary
    console.log("\n" + "=".repeat(50));
    console.log("📊 SUMMARY");
    console.log("=".repeat(50));
    console.log(`✅ Success: ${successCount} products`);
    console.log(`❌ Failed: ${errorCount} products`);
    console.log(`📈 Total: ${products.length} products`);
    console.log("=".repeat(50));

    if (successCount === products.length) {
      console.log("\n🎉 All embeddings generated successfully!");
      console.log("✨ Your products are now searchable by meaning!");
    }
  } catch (error) {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  }
}

// Run it
generateAllEmbeddings();
