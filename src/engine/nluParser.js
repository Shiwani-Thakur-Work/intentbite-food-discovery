/**
 * Deterministic Rule-Based Natural Language Understanding (NLU) Parser for Indian Food
 * Supports Indian Rupee (₹, Rs, INR) and regional dietary concepts (Pure Veg, Jain, Halal, Non-Veg).
 */

export function parseNaturalLanguageQuery(queryText) {
  if (!queryText || typeof queryText !== "string") {
    return createEmptyConstraints("");
  }

  const raw = queryText.trim();
  const q = raw.toLowerCase();

  const constraints = {
    rawQuery: raw,
    hard: {
      maxBudget: null,
      budgetScope: "per_item", // "per_item" | "total" | "per_person"
      groupSize: 1,
      dietaryRestrictions: [],
      excludedAllergens: [],
      foodTypeRequired: null // "veg" | "non_veg" | "egg"
    },
    soft: {
      cuisines: [],
      mealType: null,
      targetDeliveryMaxMinutes: null,
      spicePreference: null,
      cravings: [],
      minRating: null
    },
    inferredConfidence: 0.94,
    parsedBy: "Local Indian NLU Engine",
    explanation: ""
  };

  const detectedTokens = [];

  // 1. Group Size Extraction
  const groupMatch = q.match(/(?:for|feeds?|serves?)\s+(\d+)\s*(?:people|persons|folks|friends|guests|family)?/i) ||
                     q.match(/(\d+)\s*(?:people|persons|folks)\s+group/i) ||
                     q.match(/family(?:-size| feast)?/i) ||
                     q.match(/for\s+(two|couple)/i);

  if (groupMatch) {
    if (groupMatch[1] && !isNaN(parseInt(groupMatch[1]))) {
      constraints.hard.groupSize = parseInt(groupMatch[1]);
    } else if (q.includes("family")) {
      constraints.hard.groupSize = 4;
    } else if (q.includes("two") || q.includes("couple")) {
      constraints.hard.groupSize = 2;
    }
    detectedTokens.push(`Feeds: ${constraints.hard.groupSize} people`);
  }

  // 2. Budget Extraction in Indian Rupees (₹, Rs, Rupees, INR)
  const budgetMatch = q.match(/(?:under|less\s+than|below|max|maximum|budget\s+of|within)\s*(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d{1,2})?)/i) ||
                      q.match(/(?:₹|rs\.?|inr)\s*(\d+(?:\.\d{1,2})?)\s*(?:max|budget|limit|or\s+less|each)?/i) ||
                      q.match(/(\d+)\s*(?:rs\.?|rupees|inr|₹)\s*(?:max|budget|limit|or\s+less)?/i) ||
                      q.match(/[₹](\d+(?:\.\d{1,2})?)/i);

  if (budgetMatch) {
    const val = parseFloat(budgetMatch[1]);
    // Safety check: ensure number is realistic budget (> 20)
    if (val >= 20) {
      constraints.hard.maxBudget = val;

      if (q.includes("each") || q.includes("per person") || q.includes("/person")) {
        constraints.hard.budgetScope = "per_person";
        detectedTokens.push(`Budget: ₹${val} / person`);
      } else if (constraints.hard.groupSize > 1 && val > 500) {
        constraints.hard.budgetScope = "total";
        detectedTokens.push(`Total group budget: ₹${val}`);
      } else {
        constraints.hard.budgetScope = "per_item";
        detectedTokens.push(`Max Budget: ₹${val}`);
      }
    }
  } else if (q.includes("cheap") || q.includes("affordable") || q.includes("budget friendly") || q.includes("sasta")) {
    constraints.hard.maxBudget = 160.0;
    constraints.soft.cravings.push("cheap");
    detectedTokens.push("Inferred budget: ≤ ₹160 (affordable)");
  }

  // 3. Indian Dietary Classifications (Pure Veg, Non-Veg, Jain, Halal, Vegan)
  if (q.match(/\b(?:pure\s+veg|shuddh\s+shakahari|strictly\s+veg)\b/)) {
    constraints.hard.dietaryRestrictions.push("vegetarian");
    constraints.hard.foodTypeRequired = "veg";
    detectedTokens.push("Diet: Pure Veg (100% Shakahari)");
  } else if (q.match(/\b(?:vegetarian|veggie)\b/) || (q.match(/\bveg\b/) && !q.match(/\bnon[-\s]?veg\b/))) {
    constraints.hard.dietaryRestrictions.push("vegetarian");
    constraints.hard.foodTypeRequired = "veg";
    detectedTokens.push("Diet: Vegetarian");
  } else if (q.match(/\b(?:non[-\s]?veg|chicken|mutton|gosht|murgh|fish|prawn)\b/)) {
    constraints.hard.foodTypeRequired = "non_veg";
    detectedTokens.push("Diet: Non-Veg");
  }

  // Jain / Sattvic
  if (q.match(/\b(?:jain|sattvic|no\s+onion\s+no\s+garlic|without\s+onion\s+garlic)\b/)) {
    if (!constraints.hard.dietaryRestrictions.includes("jain")) {
      constraints.hard.dietaryRestrictions.push("jain");
      constraints.hard.foodTypeRequired = "veg";
      detectedTokens.push("Diet: Jain Certified (No Onion, No Garlic)");
    }
  }

  // Vegan
  if (q.match(/\b(?:vegan|plant[-\s]?based)\b/)) {
    if (!constraints.hard.dietaryRestrictions.includes("vegan")) {
      constraints.hard.dietaryRestrictions.push("vegan");
      detectedTokens.push("Diet: Vegan");
    }
  }

  // Halal
  if (q.match(/\bhalal\b/)) {
    if (!constraints.hard.dietaryRestrictions.includes("halal")) {
      constraints.hard.dietaryRestrictions.push("halal");
      detectedTokens.push("Certification: 100% Halal");
    }
  }

  // Gluten-Free / No Maida
  if (q.match(/\b(?:gluten[-\s]?free|celiac|no\s+gluten|no\s+maida|maida\s+free|no\s+wheat)\b/)) {
    if (!constraints.hard.dietaryRestrictions.includes("gluten_free")) {
      constraints.hard.dietaryRestrictions.push("gluten_free");
      detectedTokens.push("Diet: Gluten-Free (No Maida)");
    }
  }

  // 4. Allergen Exclusions
  if (q.match(/\b(?:no\s+nuts?|nut\s+allergy|no\s+peanuts?|peanut\s+allergy)\b/)) {
    constraints.hard.excludedAllergens.push("peanuts", "tree_nuts");
    detectedTokens.push("Zero nuts/peanuts");
  }
  if (q.match(/\b(?:no\s+dairy|dairy\s+free|lactose|no\s+cream|no\s+milk|no\s+curd)\b/)) {
    if (!constraints.hard.excludedAllergens.includes("dairy")) {
      constraints.hard.excludedAllergens.push("dairy");
      detectedTokens.push("Zero dairy/ghee/butter");
    }
  }

  // 5. Regional Indian Cuisines
  const cuisineMap = {
    "North Indian": ["north indian", "punjabi", "delhi", "dal makhani", "butter chicken", "paneer", "naan", "kulcha", "chole"],
    "South Indian": ["south indian", "dosa", "idli", "vada", "sambar", "udupi", "filter coffee", "kaapi", "uttapam"],
    "Biryani & Mughlai": ["biryani", "dum biryani", "hyderabadi", "mughlai", "nawabi", "mutton", "kebab", "salan"],
    "Street Food & Chaat": ["street food", "chaat", "pav bhaji", "pani puri", "papdi", "kathi roll", "samosa"],
    "Healthy Indian": ["healthy", "khichdi", "quinoa", "millet", "ragi", "salad bowl", "sattvic"],
    "Indo-Chinese": ["indo-chinese", "indo chinese", "schezwan", "chilli paneer", "manchurian", "hakka noodles", "noodles"],
    "South Indian Coastal": ["coastal", "kerala", "malabar", "chettinad", "parotta", "curry leaf", "fish curry"]
  };

  Object.entries(cuisineMap).forEach(([cuisine, keywords]) => {
    if (keywords.some(kw => q.includes(kw))) {
      if (!constraints.soft.cuisines.includes(cuisine)) {
        constraints.soft.cuisines.push(cuisine);
        detectedTokens.push(`Cuisine: ${cuisine}`);
      }
    }
  });

  // 6. Delivery Velocity (Speed)
  const timeMatch = q.match(/(?:ready\s+in|under|within|less\s+than)\s*(\d+)\s*(?:mins?|minutes?)/i) ||
                    q.match(/(\d+)\s*(?:mins?|minutes?)\s*delivery/i);

  if (timeMatch) {
    const mins = parseInt(timeMatch[1]);
    constraints.soft.targetDeliveryMaxMinutes = mins;
    detectedTokens.push(`Time: < ${mins}m`);
  } else if (q.includes("fast") || q.includes("quick") || q.includes("jaldi") || q.includes("rush")) {
    constraints.soft.targetDeliveryMaxMinutes = 25;
    detectedTokens.push("Speed: Fast (<25m)");
  }

  // 7. Indian Craving & Sensory Tags
  const cravingLexicon = [
    { tag: "biryani", patterns: [/\bbiryani\b/, /\bdum\b/] },
    { tag: "paneer", patterns: [/\bpaneer\b/] },
    { tag: "dosa", patterns: [/\bdosa\b/, /\bdose\b/] },
    { tag: "spicy", patterns: [/\bspicy\b/, /\bteekha\b/, /\bmasaledar\b/, /\bhot\b/, /\bchilli\b/] },
    { tag: "comfort", patterns: [/\bcomfort\b/, /\bcomforting\b/, /\bhearty\b/, /\bghar\b/] },
    { tag: "high_protein", patterns: [/\bhigh[-\s]?protein\b/, /\bprotein\b/, /\bgym\b/, /\bpost[-\s]?workout\b/] },
    { tag: "crispy", patterns: [/\bcrispy\b/, /\bkurkure\b/, /\bcrunchy\b/] },
    { tag: "chaat", patterns: [/\bchaat\b/, /\bpav\s+bhaji\b/] },
    { tag: "healthy", patterns: [/\bhealthy\b/, /\blight\b/, /\bdiet\b/] },
    { tag: "sweet", patterns: [/\bsweet\b/, /\bmithai\b/, /\bdessert\b/, /\bmeetha\b/] }
  ];

  cravingLexicon.forEach(({ tag, patterns }) => {
    if (patterns.some(p => p.test(q))) {
      if (!constraints.soft.cravings.includes(tag)) {
        constraints.soft.cravings.push(tag);
        detectedTokens.push(`Craving: ${tag.replace("_", " ")}`);
      }
    }
  });

  // Construct explanation
  if (detectedTokens.length > 0) {
    constraints.explanation = `Extracted: ${detectedTokens.join(" • ")}`;
  } else {
    constraints.explanation = `Browsing all authentic Indian curated dishes.`;
  }

  return constraints;
}

export function createEmptyConstraints(rawQuery = "") {
  return {
    rawQuery,
    hard: {
      maxBudget: null,
      budgetScope: "per_item",
      groupSize: 1,
      dietaryRestrictions: [],
      excludedAllergens: [],
      foodTypeRequired: null
    },
    soft: {
      cuisines: [],
      mealType: null,
      targetDeliveryMaxMinutes: null,
      spicePreference: null,
      cravings: [],
      minRating: null
    },
    inferredConfidence: 1.0,
    parsedBy: "Manual",
    explanation: "No active filters"
  };
}
