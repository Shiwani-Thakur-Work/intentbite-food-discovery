/**
 * Explainability Generator: Builds transparent "Why This Matched" breakdowns
 * for each recommended dish.
 */

export function generateExplanation(dish, constraints, matchScore, isHardSatisfied = true, compromiseNote = null) {
  const badges = [];

  if (!constraints) {
    return {
      matchPercentage: matchScore,
      summary: "Curated popular option",
      badges: [
        { label: `$${dish.price.toFixed(2)}`, type: "neutral", icon: "tag" },
        { label: `⭐ ${dish.rating}`, type: "neutral", icon: "star" },
        { label: `${dish.deliveryTimeMax}m delivery`, type: "neutral", icon: "clock" }
      ],
      compromises: []
    };
  }

  const { hard, soft } = constraints;

  // 1. Budget Verification Badge
  if (hard.maxBudget != null) {
    if (dish.price <= hard.maxBudget) {
      const diff = hard.maxBudget - dish.price;
      badges.push({
        label: diff >= 2 
          ? `$${dish.price.toFixed(2)} ($${diff.toFixed(2)} under $${hard.maxBudget.toFixed(2)} cap)`
          : `$${dish.price.toFixed(2)} (Within $${hard.maxBudget.toFixed(2)} budget)`,
        type: "success",
        icon: "check"
      });
    } else {
      badges.push({
        label: `$${dish.price.toFixed(2)} (+$${(dish.price - hard.maxBudget).toFixed(2)} over budget)`,
        type: "warning",
        icon: "alert"
      });
    }
  } else {
    badges.push({
      label: `$${dish.price.toFixed(2)}`,
      type: "neutral",
      icon: "tag"
    });
  }

  // 2. Dietary Certification Badges
  if (hard.dietaryRestrictions && hard.dietaryRestrictions.length > 0) {
    const satisfiedDiets = hard.dietaryRestrictions.filter(d => dish.dietary.includes(d));
    if (satisfiedDiets.length > 0) {
      badges.push({
        label: `Certified ${satisfiedDiets.map(d => d.replace("_", " ")).join(" & ")}`,
        type: "success",
        icon: "shield-check"
      });
    }
  }

  // 3. Allergen Safety Badges
  if (hard.excludedAllergens && hard.excludedAllergens.length > 0) {
    const safeAllergens = hard.excludedAllergens.filter(a => !dish.allergens.includes(a));
    if (safeAllergens.length > 0) {
      badges.push({
        label: `Safe: No ${safeAllergens.join(", ")}`,
        type: "success",
        icon: "shield"
      });
    }
  }

  // 4. Delivery Speed Badge
  if (soft.targetDeliveryMaxMinutes != null) {
    if (dish.deliveryTimeMax <= soft.targetDeliveryMaxMinutes) {
      badges.push({
        label: `${dish.deliveryTimeMax}m delivery (Target < ${soft.targetDeliveryMaxMinutes}m)`,
        type: "success",
        icon: "clock"
      });
    } else {
      badges.push({
        label: `${dish.deliveryTimeMax}m (${dish.deliveryTimeMax - soft.targetDeliveryMaxMinutes}m over target)`,
        type: "neutral",
        icon: "clock"
      });
    }
  }

  // 5. Cravings & Macro Badges
  if (soft.cravings && soft.cravings.length > 0) {
    const matchedCravings = soft.cravings.filter(c => 
      dish.tags.includes(c) || dish.name.toLowerCase().includes(c)
    );
    if (matchedCravings.length > 0) {
      const cravingText = matchedCravings.includes("high_protein")
        ? `High-Protein (${dish.proteinGrams}g)`
        : matchedCravings.map(c => c.replace("_", " ")).join(", ");
      badges.push({
        label: `Matches: ${cravingText}`,
        type: "highlight",
        icon: "sparkles"
      });
    }
  }

  // 6. Rating Badge
  if (dish.rating >= 4.8) {
    badges.push({
      label: `Top Rated (${dish.rating}★)`,
      type: "highlight",
      icon: "star"
    });
  }

  // Summary headline
  let summary = "Satisfies all mandatory search constraints.";
  if (!isHardSatisfied) {
    summary = compromiseNote || "Partial match with relaxed parameters.";
  }

  return {
    matchPercentage: matchScore,
    summary,
    badges,
    compromises: compromiseNote ? [compromiseNote] : []
  };
}
