/**
 * Explainability Generator for Indian Food Discovery
 * Formats transparent "Why This Matched" badges with Indian Rupee (₹) pricing
 * and authentic Indian dietary verifications.
 */

export function generateExplanation(dish, constraints, matchScore, isHardSatisfied = true, compromiseNote = null) {
  const badges = [];

  if (!constraints) {
    return {
      matchPercentage: matchScore,
      summary: "Curated popular option",
      badges: [
        { label: `₹${dish.price}`, type: "neutral", icon: "tag" },
        { label: `⭐ ${dish.rating}`, type: "neutral", icon: "star" },
        { label: `${dish.deliveryTimeMax}m delivery`, type: "neutral", icon: "clock" }
      ],
      compromises: []
    };
  }

  const { hard, soft } = constraints;

  // 1. Budget Verification Badge in ₹
  if (hard.maxBudget != null) {
    if (dish.price <= hard.maxBudget) {
      const diff = hard.maxBudget - dish.price;
      badges.push({
        label: diff >= 40 
          ? `₹${dish.price} (₹${diff} under ₹${hard.maxBudget} cap)`
          : `₹${dish.price} (Within ₹${hard.maxBudget} budget)`,
        type: "success",
        icon: "check"
      });
    } else {
      badges.push({
        label: `₹${dish.price} (+₹${dish.price - hard.maxBudget} over budget)`,
        type: "warning",
        icon: "alert"
      });
    }
  } else {
    badges.push({
      label: `₹${dish.price}`,
      type: "neutral",
      icon: "tag"
    });
  }

  // 2. Pure Veg / Non-Veg Verification
  if (hard.foodTypeRequired === "veg" || (hard.dietaryRestrictions && hard.dietaryRestrictions.includes("vegetarian"))) {
    if (dish.foodType === "veg") {
      badges.push({
        label: "Certified Pure Veg",
        type: "success",
        icon: "leaf"
      });
    }
  }

  // 3. Jain Verification
  if (hard.dietaryRestrictions && hard.dietaryRestrictions.includes("jain")) {
    if (dish.dietary.includes("jain")) {
      badges.push({
        label: "Jain Certified (No Onion/Garlic)",
        type: "success",
        icon: "shield-check"
      });
    }
  }

  // 4. Halal Verification
  if (hard.dietaryRestrictions && hard.dietaryRestrictions.includes("halal")) {
    if (dish.dietary.includes("halal")) {
      badges.push({
        label: "100% Halal Certified",
        type: "success",
        icon: "shield-check"
      });
    }
  }

  // 5. Gluten-Free Verification
  if (hard.dietaryRestrictions && hard.dietaryRestrictions.includes("gluten_free")) {
    if (dish.dietary.includes("gluten_free")) {
      badges.push({
        label: "Gluten-Free (No Maida)",
        type: "success",
        icon: "shield-check"
      });
    }
  }

  // 6. Allergen Safety (e.g. Dairy / Ghee / Nuts)
  if (hard.excludedAllergens && hard.excludedAllergens.length > 0) {
    const safeAllergens = hard.excludedAllergens.filter(a => !dish.allergens.includes(a));
    if (safeAllergens.length > 0) {
      badges.push({
        label: `Free of ${safeAllergens.join(", ")}`,
        type: "success",
        icon: "shield"
      });
    }
  }

  // 7. Delivery Speed Badge
  if (soft.targetDeliveryMaxMinutes != null) {
    if (dish.deliveryTimeMax <= soft.targetDeliveryMaxMinutes) {
      badges.push({
        label: `${dish.deliveryTimeMax}m (Target < ${soft.targetDeliveryMaxMinutes}m)`,
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

  // 8. Cravings & High Protein
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

  // 9. Spice Level
  if (dish.spiceLevel >= 2) {
    badges.push({
      label: dish.spiceLevel === 3 ? "Teekha (Spicy 🌶️🌶️)" : "Medium Spiced 🌶️",
      type: "highlight",
      icon: "fire"
    });
  }

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
