/**
 * Canonical test queries with expected constraints and ground truth verification.
 * Used for evaluation suite and interactive demo pills.
 */

export const TEST_QUERIES = [
  {
    id: "query-1",
    label: "Healthy Vegan Lunch",
    text: "Healthy vegan dinner under $18 ready in 25 mins",
    category: "Diet & Speed",
    expected: {
      budgetMax: 18,
      dietary: ["vegan"],
      timeMaxMinutes: 25,
      cravings: ["healthy"]
    },
    difficulty: "Medium",
    description: "Combines strict dietary (vegan), hard budget ($18), speed limit (25m), and healthy preference."
  },
  {
    id: "query-2",
    label: "Gluten-Free & Spicy Soup",
    text: "Spicy Thai comfort soup under $16 with no gluten",
    category: "Allergen & Craving",
    expected: {
      budgetMax: 16,
      dietary: ["gluten_free"],
      cuisine: "Thai",
      cravings: ["spicy", "comfort", "soup"]
    },
    difficulty: "High",
    description: "Tests negative allergen phrasing ('no gluten') with multiple subjective cravings."
  },
  {
    id: "query-3",
    label: "High-Protein Dairy-Free",
    text: "High protein post-workout lunch under $22 with no dairy",
    category: "Fitness & Diet",
    expected: {
      budgetMax: 22,
      dietary: ["dairy_free"],
      cravings: ["high_protein"]
    },
    difficulty: "Medium",
    description: "Tests fitness intent translation into macro weighting (>30g protein preferred)."
  },
  {
    id: "query-4",
    label: "Late-Night Halal Burger",
    text: "Late night halal burger under $15 ready fast",
    category: "Religious & Operational",
    expected: {
      budgetMax: 15,
      dietary: ["halal"],
      timeMaxMinutes: 25,
      cravings: ["burger", "comfort", "fast"]
    },
    difficulty: "Medium",
    description: "Evaluates operational time tags and strict religious dietary gating."
  },
  {
    id: "query-5",
    label: "Family Feast for 4",
    text: "Family dinner for 4 people under $60 with no nuts",
    category: "Group & Allergen",
    expected: {
      budgetMax: 60,
      groupSize: 4,
      allergensExcluded: ["peanuts", "tree_nuts"]
    },
    difficulty: "High",
    description: "Checks group sharing portioning, total order budget scaling, and severe allergen exclusion."
  },
  {
    id: "query-6",
    label: "Crispy Cheap Tacos",
    text: "Crispy street tacos under $12 with quick delivery",
    category: "Budget & Texture",
    expected: {
      budgetMax: 12,
      cuisine: "Mexican",
      cravings: ["crispy", "tacos"]
    },
    difficulty: "Easy",
    description: "Tests low budget cap gating with texture craving."
  },
  {
    id: "query-7",
    label: "Strict Gluten-Free Pasta",
    text: "Strict gluten-free Italian pasta under $25",
    category: "Specialty Diet",
    expected: {
      budgetMax: 25,
      dietary: ["gluten_free"],
      cuisine: "Italian"
    },
    difficulty: "Medium",
    description: "Must only return pasta dishes that are certified gluten-free, filtering out regular wheat pasta."
  },
  {
    id: "query-8",
    label: "Ultra-Cheap Comfort",
    text: "Cheap comfort food under $10",
    category: "Extreme Budget",
    expected: {
      budgetMax: 10,
      cravings: ["comfort", "cheap"]
    },
    difficulty: "Medium",
    description: "Tests tightest budget constraint against snack / starter portion sizes."
  }
];
