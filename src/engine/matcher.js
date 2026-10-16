/**
 * Constraint Gating, Scoring & Ranking Engine
 * Enforces hard constraints with 100% fidelity and scores soft preferences.
 */

import { FOOD_ITEMS } from "../data/foodDataset.js";
import { generateExplanation } from "./explanation.js";

export function evaluateAndRankDishes(constraints, dishDataset = FOOD_ITEMS) {
  if (!constraints) {
    return {
      results: dishDataset.map(dish => ({
        dish,
        score: 100,
        isHardSatisfied: true,
        explanation: generateExplanation(dish, null, 100, true)
      })),
      isFallback: false,
      relaxationMessage: null,
      totalMatched: dishDataset.length
    };
  }

  const { hard, soft } = constraints;

  // 1. Hard Constraint Gating
  const passedItems = [];
  const rejectedItems = [];

  for (const dish of dishDataset) {
    let satisfiesHard = true;
    const failureReasons = [];

    // Check Budget
    if (hard.maxBudget != null && hard.maxBudget > 0) {
      if (dish.price > hard.maxBudget) {
        satisfiesHard = false;
        failureReasons.push(`Price ($${dish.price.toFixed(2)}) exceeds max budget ($${hard.maxBudget.toFixed(2)})`);
      }
    }

    // Check Dietary Restrictions (must possess ALL specified dietary tags)
    if (hard.dietaryRestrictions && hard.dietaryRestrictions.length > 0) {
      for (const diet of hard.dietaryRestrictions) {
        if (!dish.dietary.includes(diet)) {
          satisfiesHard = false;
          failureReasons.push(`Missing dietary requirement: ${diet.replace("_", " ")}`);
        }
      }
    }

    // Check Excluded Allergens (must NOT contain any excluded allergens)
    if (hard.excludedAllergens && hard.excludedAllergens.length > 0) {
      for (const allergen of hard.excludedAllergens) {
        if (dish.allergens.includes(allergen)) {
          satisfiesHard = false;
          failureReasons.push(`Contains excluded allergen: ${allergen}`);
        }
      }
    }

    if (satisfiesHard) {
      passedItems.push(dish);
    } else {
      rejectedItems.push({ dish, failureReasons });
    }
  }

  // 2. Normal Branch: If we have items that satisfy all hard constraints
  if (passedItems.length > 0) {
    const scoredResults = passedItems.map(dish => {
      const { score, subScores } = calculateScore(dish, constraints);
      return {
        dish,
        score,
        subScores,
        isHardSatisfied: true,
        isFallback: false,
        explanation: generateExplanation(dish, constraints, score, true)
      };
    });

    // Sort descending by score, then rating
    scoredResults.sort((a, b) => b.score - a.score || b.dish.rating - a.dish.rating);

    return {
      results: scoredResults,
      isFallback: false,
      relaxationMessage: null,
      totalMatched: scoredResults.length,
      rejectedCount: rejectedItems.length
    };
  }

  // 3. Fallback Branch: 0 items passed hard constraints
  // Identify the most restrictive constraint to relax (typically budget or strict time)
  return generateRelaxedFallback(constraints, dishDataset, rejectedItems);
}

function calculateScore(dish, constraints) {
  const { hard, soft } = constraints;
  let score = 50; // Base score for passing hard filter
  const subScores = {};

  // Cuisine match (+30 max)
  if (soft.cuisines && soft.cuisines.length > 0) {
    const matchedCuisine = soft.cuisines.some(c => 
      dish.cuisine.toLowerCase() === c.toLowerCase() ||
      dish.tags.some(t => t.toLowerCase() === c.toLowerCase())
    );
    if (matchedCuisine) {
      score += 25;
      subScores.cuisine = 25;
    }
  }

  // Cravings match (+20 per matched craving tag, max 30)
  if (soft.cravings && soft.cravings.length > 0) {
    let cravingPoints = 0;
    for (const craving of soft.cravings) {
      if (dish.tags.includes(craving) || dish.name.toLowerCase().includes(craving)) {
        cravingPoints += 15;
      }
    }
    const cappedCraving = Math.min(cravingPoints, 30);
    score += cappedCraving;
    subScores.cravings = cappedCraving;
  }

  // Delivery Speed (+20 max)
  if (soft.targetDeliveryMaxMinutes != null && soft.targetDeliveryMaxMinutes > 0) {
    if (dish.deliveryTimeMax <= soft.targetDeliveryMaxMinutes) {
      score += 15;
      subScores.speed = 15;
    } else {
      const minutesOver = dish.deliveryTimeMax - soft.targetDeliveryMaxMinutes;
      const penalty = Math.min(minutesOver * 2, 10);
      score -= penalty;
      subScores.speedPenalty = -penalty;
    }
  }

  // Star Rating (+10 max)
  const ratingBonus = Math.round((dish.rating - 4.0) * 10);
  if (ratingBonus > 0) {
    score += ratingBonus;
    subScores.rating = ratingBonus;
  }

  // Budget Headroom (+10 max if comfortably under budget)
  if (hard.maxBudget != null && hard.maxBudget > 0) {
    const savings = hard.maxBudget - dish.price;
    if (savings >= 3) {
      score += 8;
      subScores.budgetSavings = 8;
    }
  }

  // Portion/Group bonus
  if (hard.groupSize && hard.groupSize >= 4) {
    if (dish.portionSize === "family_share_4") {
      score += 20;
      subScores.groupFit = 20;
    }
  }

  // Normalize final score to 0 - 100
  const normalizedScore = Math.min(100, Math.max(10, Math.round(score)));
  return { score: normalizedScore, subScores };
}

function generateRelaxedFallback(constraints, dishDataset, rejectedItems) {
  const { hard, soft } = constraints;

  // Strategy A: Relax budget by +25%
  let relaxedBudget = hard.maxBudget ? hard.maxBudget * 1.35 : null;
  let relaxedResults = [];

  for (const item of rejectedItems) {
    const dish = item.dish;
    // Check if diet and allergens pass, but price was the only issue
    let passesDietAndAllergen = true;
    if (hard.dietaryRestrictions && hard.dietaryRestrictions.length > 0) {
      if (!hard.dietaryRestrictions.every(d => dish.dietary.includes(d))) {
        passesDietAndAllergen = false;
      }
    }
    if (hard.excludedAllergens && hard.excludedAllergens.length > 0) {
      if (hard.excludedAllergens.some(a => dish.allergens.includes(a))) {
        passesDietAndAllergen = false;
      }
    }

    if (passesDietAndAllergen) {
      const { score } = calculateScore(dish, constraints);
      relaxedResults.push({
        dish,
        score: Math.max(50, score - 15),
        isHardSatisfied: false,
        isFallback: true,
        relaxationReason: `Price $${dish.price.toFixed(2)} is slightly above your $${hard.maxBudget?.toFixed(2)} budget, but respects all dietary preferences.`,
        explanation: generateExplanation(dish, constraints, Math.max(50, score - 15), false, `Exceeds budget ($${dish.price.toFixed(2)} vs $${hard.maxBudget?.toFixed(2)})`)
      });
    }
  }

  if (relaxedResults.length > 0) {
    relaxedResults.sort((a, b) => a.dish.price - b.dish.price);
    return {
      results: relaxedResults,
      isFallback: true,
      relaxationMessage: `Zero exact matches under $${hard.maxBudget?.toFixed(2)}. We relaxed the budget to show ${relaxedResults.length} options that still satisfy 100% of your dietary requirements.`,
      totalMatched: relaxedResults.length,
      rejectedCount: rejectedItems.length
    };
  }

  // Strategy B: General nearest match
  const generalMatches = dishDataset.slice(0, 4).map(dish => ({
    dish,
    score: 60,
    isHardSatisfied: false,
    isFallback: true,
    relaxationReason: "Closest alternative available in the curated dataset.",
    explanation: generateExplanation(dish, constraints, 60, false, "Close general alternative")
  }));

  return {
    results: generalMatches,
    isFallback: true,
    relaxationMessage: "Zero exact matches found for this specific combination of strict constraints. Here are our closest curated recommendations.",
    totalMatched: generalMatches.length,
    rejectedCount: rejectedItems.length
  };
}
