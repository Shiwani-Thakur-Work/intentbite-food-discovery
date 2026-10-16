import { TEST_QUERIES } from "./src/data/testQueries.js";
import { parseNaturalLanguageQuery } from "./src/engine/nluParser.js";
import { evaluateAndRankDishes } from "./src/engine/matcher.js";
import { FOOD_ITEMS } from "./src/data/foodDataset.js";

console.log("=== RUNNING INDIAN TEST SUITE ON CANONICAL QUERIES (₹) ===");

let passedAll = true;

TEST_QUERIES.forEach((t, i) => {
  const p = parseNaturalLanguageQuery(t.text);
  const evalRes = evaluateAndRankDishes(p, FOOD_ITEMS);

  console.log(`\n[Test ${i+1}] "${t.text}"`);
  console.log(`  Parsed Budget: ₹${p.hard.maxBudget}`);
  console.log(`  Food Type Required: ${p.hard.foodTypeRequired || 'Any'}`);
  console.log(`  Parsed Dietary: [${p.hard.dietaryRestrictions.join(", ")}]`);
  console.log(`  Parsed Allergens Excluded: [${p.hard.excludedAllergens.join(", ")}]`);
  console.log(`  Parsed Cuisines: [${p.soft.cuisines.join(", ")}]`);
  console.log(`  Total Matches: ${evalRes.totalMatched} (Fallback: ${evalRes.isFallback})`);

  // Verify hard constraints
  evalRes.results.forEach(r => {
    if (r.isHardSatisfied) {
      if (p.hard.maxBudget && r.dish.price > p.hard.maxBudget) {
        console.error(`  FAIL: Dish ${r.dish.name} (₹${r.dish.price}) exceeds max budget ₹${p.hard.maxBudget}!`);
        passedAll = false;
      }
      if (p.hard.foodTypeRequired === "veg" && r.dish.foodType !== "veg") {
        console.error(`  FAIL: Dish ${r.dish.name} is not Pure Veg!`);
        passedAll = false;
      }
      p.hard.dietaryRestrictions.forEach(diet => {
        if (!r.dish.dietary.includes(diet)) {
          console.error(`  FAIL: Dish ${r.dish.name} missing mandatory diet ${diet}!`);
          passedAll = false;
        }
      });
      p.hard.excludedAllergens.forEach(allergen => {
        if (r.dish.allergens.includes(allergen)) {
          console.error(`  FAIL: Dish ${r.dish.name} contains excluded allergen ${allergen}!`);
          passedAll = false;
        }
      });
    }
  });

  const top = evalRes.results[0];
  if (top) {
    console.log(`  Top Match: [${top.dish.foodType.toUpperCase()}] ${top.dish.name} (₹${top.dish.price}) - Score: ${top.score}%`);
  }
});

console.log("\n=============================================");
if (passedAll) {
  console.log(">>> SUCCESS: 100% HARD CONSTRAINT COMPLIANCE ACROSS ALL INDIAN TESTS! <<<");
} else {
  console.error(">>> FAILURES DETECTED! <<<");
}
