/**
 * Google Gemini API Client for Natural Language Constraint Extraction
 * Features dual-mode execution: live Gemini LLM parsing with automatic fallback
 * to deterministic local NLU parser.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { parseNaturalLanguageQuery } from "./nluParser.js";

const STORAGE_KEY = "voc_gemini_api_key";

export function getActiveApiKey() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && stored.trim().length > 0) return stored.trim();
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (envKey && envKey !== "your_gemini_api_key_here") return envKey.trim();
  return null;
}

export function setActiveApiKey(key) {
  if (!key || key.trim() === "") {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, key.trim());
  }
}

const SYSTEM_PROMPT = `
You are an expert food discovery NLU parser. Your job is to extract search constraints from a user's natural language food request into structured JSON.

Return ONLY a valid JSON object with this exact shape (no markdown backticks, no explanatory text):
{
  "hard": {
    "maxBudget": number or null,
    "budgetScope": "per_item" | "total" | "per_person",
    "groupSize": number,
    "dietaryRestrictions": string[],
    "excludedAllergens": string[]
  },
  "soft": {
    "cuisines": string[],
    "mealType": string or null,
    "targetDeliveryMaxMinutes": number or null,
    "spicePreference": "mild" | "medium" | "spicy" | "extra_spicy" | null,
    "cravings": string[],
    "minRating": number or null
  },
  "inferredConfidence": number (between 0.0 and 1.0),
  "explanation": "concise 1-sentence summary of parsed constraints"
}

Allowed dietaryRestrictions values: ["vegan", "vegetarian", "gluten_free", "halal", "dairy_free", "nut_free", "keto"].
Allowed excludedAllergens values: ["peanuts", "tree_nuts", "dairy", "gluten", "eggs", "shellfish", "soy"].
Allowed cravings values: ["spicy", "comfort", "high_protein", "crispy", "soup", "healthy", "bowl", "salad", "noodles", "tacos", "burger", "pizza", "sushi", "cheap", "late_night", "sweet"].
`;

export async function extractConstraints(queryText) {
  if (!queryText || queryText.trim() === "") {
    return parseNaturalLanguageQuery("");
  }

  const apiKey = getActiveApiKey();

  // If no API key is provided, execute deterministic local parser immediately
  if (!apiKey) {
    return parseNaturalLanguageQuery(queryText);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1
      }
    });

    const prompt = `${SYSTEM_PROMPT}\n\nUser Query: "${queryText}"`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    // Clean any accidental markdown wrap
    const cleanJson = text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
    const parsed = JSON.parse(cleanJson);

    return {
      rawQuery: queryText,
      hard: {
        maxBudget: parsed.hard?.maxBudget ?? null,
        budgetScope: parsed.hard?.budgetScope || "per_item",
        groupSize: parsed.hard?.groupSize || 1,
        dietaryRestrictions: Array.isArray(parsed.hard?.dietaryRestrictions) ? parsed.hard.dietaryRestrictions : [],
        excludedAllergens: Array.isArray(parsed.hard?.excludedAllergens) ? parsed.hard.excludedAllergens : []
      },
      soft: {
        cuisines: Array.isArray(parsed.soft?.cuisines) ? parsed.soft.cuisines : [],
        mealType: parsed.soft?.mealType || null,
        targetDeliveryMaxMinutes: parsed.soft?.targetDeliveryMaxMinutes || null,
        spicePreference: parsed.soft?.spicePreference || null,
        cravings: Array.isArray(parsed.soft?.cravings) ? parsed.soft.cravings : [],
        minRating: parsed.soft?.minRating || null
      },
      inferredConfidence: parsed.inferredConfidence || 0.95,
      parsedBy: "Google Gemini 1.5 Flash",
      explanation: parsed.explanation || "Interpreted via Gemini LLM"
    };
  } catch (error) {
    console.warn("Gemini API call failed or rate-limited. Falling back to local deterministic parser.", error);
    const localResult = parseNaturalLanguageQuery(queryText);
    localResult.parsedBy = "Local NLU Engine (Gemini Fallback)";
    return localResult;
  }
}
