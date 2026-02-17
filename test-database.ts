// test-database.ts
import { getAllProducts, searchProducts } from "./lib/db/products";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function testDatabase() {
  console.log("🧪 Testing database connection...\n");

  try {
    // Test 1: Get all products
    console.log("Test 1: Fetching all products...");
    const allProducts = await getAllProducts();
    console.log(`✅ Found ${allProducts.length} products\n`);

    // Test 2: Search for laptops
    console.log('Test 2: Searching for "laptop"...');
    const laptops = await searchProducts("laptop");
    console.log(`✅ Found ${laptops.length} laptops:`);
    laptops.forEach((p) => console.log(`   - ${p.name} (€${p.price})`));
    console.log();

    // Test 3: Search for gaming
    console.log('Test 3: Searching for "gaming"...');
    const gaming = await searchProducts("gaming");
    console.log(`✅ Found ${gaming.length} gaming products:`);
    gaming.forEach((p) => console.log(`   - ${p.name} (€${p.price})`));
    console.log();

    console.log("🎉 All tests passed! Database is working!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

testDatabase();
