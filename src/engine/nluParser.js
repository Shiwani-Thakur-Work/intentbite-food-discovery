/**
 * Deterministic Rule-Based Natural Language Understanding (NLU) Parser
 * Fast, offline-capable, and reliable constraint extractor.
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
      excludedAllergens: []
    },
    soft: {
      cuisines: [],
      mealType: null,
      targetDeliveryMaxMinutes: null,
      spicePreference: null,
      cravings: [],
      minRating: null
    },
    inferredConfidence: 0.92,
    parsedBy: "Local NLU Engine",
    explanation: ""
  };

  const detectedTokens = [];

  // 1. Group Size Extraction
  const groupMatch = q.match(/(?:for|feeds?|serves?)\s+(\d+)\s*(?:people|persons|folks|friends|guests)?/i) ||
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
    detectedTokens.push(`Group size: ${constraints.hard.groupSize}`);
  }

  // 2. Budget Extraction
  const budgetMatch = q.match(/(?:under|less\s+than|below|max|maximum|budget\s+of|within)\s*\$?(\d+(?:\.\d{1,2})?)/i) ||
                      q.match(/\$?(\d+(?:\.\d{1,2})?)\s*(?:max|budget|limit|or\s+less)/i) ||
                      q.match(/\$(\d+(?:\.\d{1,2})?)/i);

  if (budgetMatch) {
    const val = parseFloat(budgetMatch[1]);
    constraints.hard.maxBudget = val;

    if (q.includes("each") || q.includes("per person")) {
      constraints.hard.budgetScope = "per_person";
      detectedTokens.push(`Budget: $${val} / person`);
    } else if (constraints.hard.groupSize > 1 && val > 30) {
      constraints.hard.budgetScope = "total";
      detectedTokens.push(`Total group budget: $${val}`);
    } else {
      constraints.hard.budgetScope = "per_item";
      detectedTokens.push(`Budget cap: $${val}`);
    }
  } else if (q.includes("cheap") || q.includes("affordable") || q.includes("budget friendly")) {
    constraints.hard.maxBudget = 12.0;
    constraints.soft.cravings.push("cheap");
    detectedTokens.push("Inferred budget: ≤ $12 (cheap/affordable)");
  }

  // 3. Dietary Restrictions
  const dietMap = [
    { key: "vegan", patterns: [/\bvegan\b/, /\bplant[-\s]?based\b/] },
    { key: "vegetarian", patterns: [/\bvegetarian\b/, /\bveggie\b/] },
    { key: "gluten_free", patterns: [/\bgluten[-\s]?free\b/, /\bceliac\b/, /\bno gluten\b/] },
    { key: "halal", patterns: [/\bhalal\b/] },
    { key: "dairy_free", patterns: [/\bdairy[-\s]?free\b/, /\bno dairy\b/, /\blactose[-\s]?free\b/] },
    { key: "nut_free", patterns: [/\bnut[-\s]?free\b/, /\bno nuts\b/, /\bpeanut[-\s]?free\b/, /\bno peanuts\b/] },
    { key: "keto", patterns: [/\bketo\b/, /\blow[-\s]?carb\b/] }
  ];

  dietMap.forEach(({ key, patterns }) => {
    if (patterns.some(p => p.test(q))) {
      if (!constraints.hard.dietaryRestrictions.includes(key)) {
        constraints.hard.dietaryRestrictions.push(key);
        detectedTokens.push(`Diet: ${key.replace("_", " ")}`);
      }
    }
  });

  // 4. Allergen Exclusions
  if (q.match(/\b(?:no\s+nuts?|nut\s+allergy|peanut\s+allergy|peanut[-\s]?free)\b/)) {
    constraints.hard.excludedAllergens.push("peanuts", "tree_nuts");
    detectedTokens.push("Zero nuts/peanuts");
  }
  if (q.match(/\b(?:no\s+dairy|dairy\s+allergy|lactose)\b/)) {
    if (!constraints.hard.excludedAllergens.includes("dairy")) {
      constraints.hard.excludedAllergens.push("dairy");
      detectedTokens.push("Zero dairy");
    }
  }
  if (q.match(/\b(?:no\s+shellfish|shellfish\s+allergy|seafood\s+allergy)\b/)) {
    constraints.hard.excludedAllergens.push("shellfish");
    detectedTokens.push("Zero shellfish");
  }
  if (q.match(/\b(?:no\s+gluten|celiac)\b/)) {
    if (!constraints.hard.excludedAllergens.includes("gluten")) {
      constraints.hard.excludedAllergens.push("gluten");
      detectedTokens.push("Zero gluten");
    }
  }

  // 5. Cuisines
  const cuisineMap = {
    "thai": ["thai", "pad thai", "tom yum", "green curry"],
    "mexican": ["mexican", "tacos", "taco", "birria", "carnitas", "guacamole"],
    "japanese": ["japanese", "ramen", "sushi", "nigiri", "miso", "karaage"],
    "indian": ["indian", "curry", "tandoori", "biryani", "dal", "masala"],
    "italian": ["italian", "pasta", "pizza", "penne", "spaghetti"],
    "healthy bowls": ["healthy bowls", "bowl", "grain bowl", "quinoa", "salad bowl"],
    "mediterranean": ["mediterranean", "greek", "souvlaki", "falafel", "mezze", "shawarma", "hummus"],
    "vietnamese": ["vietnamese", "pho", "banh mi", "saigon"],
    "ethiopian": ["ethiopian", "injera", "tibes", "wot"],
    "american": ["american", "burger", "burgers", "smash burger", "fries", "bbq"],
    "korean": ["korean", "bibimbap", "kimchi", "k-town"]
  };

  Object.entries(cuisineMap).forEach(([cuisine, keywords]) => {
    if (keywords.some(kw => q.includes(kw))) {
      if (!constraints.soft.cuisines.includes(cuisine)) {
        constraints.soft.cuisines.push(cuisine);
        detectedTokens.push(`Cuisine: ${cuisine}`);
      }
    }
  });

  // 6. Time & Delivery Velocity
  const timeMatch = q.match(/(?:ready\s+in|under|within|less\s+than)\s*(\d+)\s*(?:mins?|minutes?)/i) ||
                    q.match(/(\d+)\s*(?:mins?|minutes?)\s*delivery/i);

  if (timeMatch) {
    const mins = parseInt(timeMatch[1]);
    constraints.soft.targetDeliveryMaxMinutes = mins;
    detectedTokens.push(`Max time: ${mins}m`);
  } else if (q.includes("fast") || q.includes("quick") || q.includes("asap") || q.includes("rush")) {
    constraints.soft.targetDeliveryMaxMinutes = 25;
    detectedTokens.push("Speed: Fast (<25m)");
  }

  // 7. Craving & Sensory Tags
  const cravingLexicon = [
    { tag: "spicy", patterns: [/\bspicy\b/, /\bhot\b/, /\bfiery\b/, /\bchili\b/] },
    { tag: "comfort", patterns: [/\bcomfort\b/, /\bcomforting\b/, /\bhearty\b/, /\bcozy\b/, /\bhangover\b/] },
    { tag: "high_protein", patterns: [/\bhigh[-\s]?protein\b/, /\bprotein\b/, /\bpost[-\s]?workout\b/, /\bgym\b/, /\bmacro\b/] },
    { tag: "crispy", patterns: [/\bcrispy\b/, /\bcrunchy\b/, /\bshatter\b/] },
    { tag: "soup", patterns: [/\bsoup\b/, /\bbroth\b/, /\bstew\b/] },
    { tag: "healthy", patterns: [/\bhealthy\b/, /\bclean\b/, /\bnutritious\b/, /\blight\b/] },
    { tag: "late_night", patterns: [/\blate[-\s]?night\b/, /\bmidnight\b/, /\bafter[-\s]?hours\b/] },
    { tag: "sweet", patterns: [/\bsweet\b/, /\bdessert\b/, /\bchocolate\b/] }
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
    constraints.explanation = `Broad search across all available curated dishes.`;
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
      excludedAllergens: []
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
