// test-price-search.ts
import { searchProductsWithPrice, searchProducts } from "./lib/db/products";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function testPriceSearch() {
  console.log("🧪 Testing price search...\n");

  try {
    // Test 1: Basic search (should work)
    console.log('Test 1: Basic search for "laptop"');
    const test1 = await searchProducts("laptop");
    console.log(`✅ Found ${test1.length} laptops:`);
    test1.forEach((p) => console.log(`   - ${p.name} (€${p.price})`));
    console.log();

    // Test 2: Search with max price
    console.log('Test 2: Search for "laptop" under €1000');
    const test2 = await searchProductsWithPrice("laptop", 1000);
    console.log(`✅ Found ${test2.length} laptops under €1000:`);
    test2.forEach((p) => console.log(`   - ${p.name} (€${p.price})`));
    console.log();

    // Test 3: Full query like user would type
    console.log('Test 3: Search for "Show me laptops under 1000 euros"');
    const test3 = await searchProductsWithPrice(
      "Show me laptops under 1000 euros",
      1000,
    );
    console.log(`✅ Found ${test3.length} products:`);
    test3.forEach((p) => console.log(`   - ${p.name} (€${p.price})`));
    console.log();
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

testPriceSearch();
