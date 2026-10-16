import { TEST_QUERIES } from "./src/data/testQueries.js";
import { parseNaturalLanguageQuery } from "./src/engine/nluParser.js";
import { evaluateAndRankDishes } from "./src/engine/matcher.js";
import { FOOD_ITEMS } from "./src/data/foodDataset.js";

console.log("=== RUNNING TEST SUITE ON CANONICAL QUERIES ===");

let passedAll = true;

TEST_QUERIES.forEach((t, i) => {
  const p = parseNaturalLanguageQuery(t.text);
  const evalRes = evaluateAndRankDishes(p, FOOD_ITEMS);

  console.log(`\n[Test ${i+1}] "${t.text}"`);
  console.log(`  Parsed Budget: $${p.hard.maxBudget}`);
  console.log(`  Parsed Dietary: [${p.hard.dietaryRestrictions.join(", ")}]`);
  console.log(`  Parsed Allergens Excluded: [${p.hard.excludedAllergens.join(", ")}]`);
  console.log(`  Parsed Cuisines: [${p.soft.cuisines.join(", ")}]`);
  console.log(`  Parsed Time: < ${p.soft.targetDeliveryMaxMinutes}m`);
  console.log(`  Total Matches: ${evalRes.totalMatched} (Fallback: ${evalRes.isFallback})`);

  // Verify hard constraints
  evalRes.results.forEach(r => {
    if (r.isHardSatisfied) {
      if (p.hard.maxBudget && r.dish.price > p.hard.maxBudget) {
        console.error(`  FAIL: Dish ${r.dish.name} ($${r.dish.price}) exceeds max budget $${p.hard.maxBudget}!`);
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
    console.log(`  Top Match: ${top.dish.name} ($${top.dish.price.toFixed(2)}) - Score: ${top.score}%`);
  }
});

console.log("\n=============================================");
if (passedAll) {
  console.log(">>> SUCCESS: 100% HARD CONSTRAINT COMPLIANCE ACROSS ALL TESTS! <<<");
} else {
  console.error(">>> FAILURES DETECTED! <<<");
}
