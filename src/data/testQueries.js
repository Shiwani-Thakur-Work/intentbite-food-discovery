/**
 * Canonical test queries for Indian Food Discovery
 * Tested in Indian Rupees (₹) across Pure Veg, Jain, Non-Veg, High Protein, and Regional Cravings.
 */

export const TEST_QUERIES = [
  {
    id: "query-1",
    label: "Pure Veg Paneer under ₹300",
    text: "Pure veg paneer butter masala under ₹300 ready in 30 mins",
    category: "Diet & Budget",
    expected: {
      budgetMax: 300,
      dietary: ["vegetarian"],
      timeMaxMinutes: 30,
      cravings: ["paneer"]
    },
    difficulty: "Medium",
    description: "Evaluates strict pure veg gating, ₹300 budget cap, and paneer craving."
  },
  {
    id: "query-2",
    label: "Spicy Hyderabadi Biryani under ₹350",
    text: "Spicy Hyderabadi chicken dum biryani under ₹350",
    category: "Biryani & Spice",
    expected: {
      budgetMax: 350,
      dietary: ["halal"],
      cuisine: "Biryani",
      cravings: ["spicy", "biryani"]
    },
    difficulty: "Easy",
    description: "Evaluates biryani cuisine matching, halal safety, and spicy craving under ₹350."
  },
  {
    id: "query-3",
    label: "South Indian Breakfast under ₹150",
    text: "Crispy South Indian dosa or idli under ₹150 fast delivery",
    category: "Regional & Speed",
    expected: {
      budgetMax: 150,
      dietary: ["vegetarian"],
      timeMaxMinutes: 25,
      cravings: ["dosa", "crispy"]
    },
    difficulty: "Medium",
    description: "Tests fast breakfast delivery (<25 mins) and tight budget under ₹150."
  },
  {
    id: "query-4",
    label: "Jain Friendly Dinner under ₹250",
    text: "Jain friendly khichdi or dinner under ₹250 with no onion no garlic",
    category: "Religious & Dietary",
    expected: {
      budgetMax: 250,
      dietary: ["jain"],
      cravings: ["healthy"]
    },
    difficulty: "High",
    description: "Strict Jain filter (no onion, no garlic, pure sattvic) under ₹250."
  },
  {
    id: "query-5",
    label: "High Protein Lunch with No Dairy",
    text: "High protein chicken lunch under ₹350 with no dairy",
    category: "Fitness & Allergen",
    expected: {
      budgetMax: 350,
      allergensExcluded: ["dairy"],
      cravings: ["high_protein"]
    },
    difficulty: "High",
    description: "Fitness meal (>40g protein) while strictly excluding dairy/cream/butter/paneer."
  },
  {
    id: "query-6",
    label: "Family Biryani Feast for 4 under ₹1000",
    text: "Family feast biryani for 4 people under ₹1000",
    category: "Group Sharing",
    expected: {
      budgetMax: 1000,
      groupSize: 4,
      cravings: ["family", "biryani"]
    },
    difficulty: "Medium",
    description: "Group portion scaling and jumbo handi feast under ₹1000 total budget."
  },
  {
    id: "query-7",
    label: "Cheap Mumbai Street Chaat under ₹150",
    text: "Cheap street food chaat or pav bhaji under ₹150",
    category: "Street Food & Budget",
    expected: {
      budgetMax: 150,
      cravings: ["chaat", "comfort"]
    },
    difficulty: "Easy",
    description: "Quick street snack under ₹150."
  },
  {
    id: "query-8",
    label: "Strict Gluten-Free Healthy Bowl under ₹250",
    text: "Strict gluten-free healthy lunch under ₹250",
    category: "Health & Celiac",
    expected: {
      budgetMax: 250,
      dietary: ["gluten_free"],
      cravings: ["healthy"]
    },
    difficulty: "Medium",
    description: "Guarantees zero wheat/maida/gluten contamination in healthy meal."
  }
];
