/**
 * Reactive State Store for Natural-Language Food Discovery
 * Manages queries, parsed constraints, mutations, and subscriber events.
 */

import { extractConstraints, getActiveApiKey } from "../engine/geminiClient.js";
import { evaluateAndRankDishes } from "../engine/matcher.js";
import { parseNaturalLanguageQuery } from "../engine/nluParser.js";
import { FOOD_ITEMS } from "../data/foodDataset.js";

class ConstraintStore {
  constructor() {
    this.state = {
      rawQuery: "",
      constraints: null,
      evaluation: evaluateAndRankDishes(null),
      isLoading: false,
      activeProvider: getActiveApiKey() ? "Google Gemini 1.5 Flash" : "Local NLU Engine",
      benchmarkOpen: false,
      settingsOpen: false,
      evaluationOpen: false,
      selectedDishModal: null,
      cartCount: 0,
      activeFiltersCount: 0
    };
    this.subscribers = new Set();
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    callback(this.state);
    return () => this.subscribers.delete(callback);
  }

  notify() {
    for (const callback of this.subscribers) {
      callback(this.state);
    }
  }

  async setQuery(queryText, forceProvider = null) {
    this.state.rawQuery = queryText;
    this.state.isLoading = true;
    this.notify();

    const startTime = performance.now();
    let constraints;

    if (forceProvider === "local") {
      constraints = parseNaturalLanguageQuery(queryText);
    } else {
      constraints = await extractConstraints(queryText);
    }

    const duration = Math.round(performance.now() - startTime);

    const evaluation = evaluateAndRankDishes(constraints, FOOD_ITEMS);

    this.state.constraints = constraints;
    this.state.evaluation = evaluation;
    this.state.isLoading = false;
    this.state.activeProvider = constraints.parsedBy;
    this.state.lastParseLatencyMs = duration;
    this.updateActiveFiltersCount();
    this.notify();
  }

  updateActiveFiltersCount() {
    if (!this.state.constraints) {
      this.state.activeFiltersCount = 0;
      return;
    }
    const { hard, soft } = this.state.constraints;
    let count = 0;
    if (hard.maxBudget != null) count++;
    if (hard.groupSize > 1) count++;
    if (hard.dietaryRestrictions) count += hard.dietaryRestrictions.length;
    if (hard.excludedAllergens) count += hard.excludedAllergens.length;
    if (soft.cuisines) count += soft.cuisines.length;
    if (soft.targetDeliveryMaxMinutes != null) count++;
    if (soft.cravings) count += soft.cravings.length;
    this.state.activeFiltersCount = count;
  }

  // User edits a constraint value via chip
  updateConstraint(category, key, value) {
    if (!this.state.constraints) return;
    this.state.constraints[category][key] = value;
    this.reEvaluate();
  }

  // User deletes a constraint chip
  removeConstraint(category, key, itemToRemove = null) {
    if (!this.state.constraints) return;
    if (itemToRemove !== null && Array.isArray(this.state.constraints[category][key])) {
      this.state.constraints[category][key] = this.state.constraints[category][key].filter(
        item => item !== itemToRemove
      );
    } else {
      this.state.constraints[category][key] = null;
    }
    this.reEvaluate();
  }

  // Toggle Hard vs Soft mode for a constraint (e.g. strict vegan vs vegetarian preference)
  toggleStrictness(key, itemValue) {
    if (!this.state.constraints) return;
    const { hard, soft } = this.state.constraints;

    if (key === "dietary") {
      if (hard.dietaryRestrictions.includes(itemValue)) {
        // Move to soft cravings
        hard.dietaryRestrictions = hard.dietaryRestrictions.filter(d => d !== itemValue);
        if (!soft.cravings.includes(itemValue)) soft.cravings.push(itemValue);
      } else {
        // Move to hard
        soft.cravings = soft.cravings.filter(c => c !== itemValue);
        if (!hard.dietaryRestrictions.includes(itemValue)) hard.dietaryRestrictions.push(itemValue);
      }
    }
    this.reEvaluate();
  }

  reEvaluate() {
    this.state.evaluation = evaluateAndRankDishes(this.state.constraints, FOOD_ITEMS);
    this.updateActiveFiltersCount();
    this.notify();
  }

  clearSearch() {
    this.state.rawQuery = "";
    this.state.constraints = null;
    this.state.evaluation = evaluateAndRankDishes(null, FOOD_ITEMS);
    this.state.activeFiltersCount = 0;
    this.notify();
  }

  openDishModal(dish) {
    this.state.selectedDishModal = dish;
    this.notify();
  }

  closeDishModal() {
    this.state.selectedDishModal = null;
    this.notify();
  }

  toggleBenchmark(open = null) {
    this.state.benchmarkOpen = open !== null ? open : !this.state.benchmarkOpen;
    this.notify();
  }

  toggleSettings(open = null) {
    this.state.settingsOpen = open !== null ? open : !this.state.settingsOpen;
    this.notify();
  }

  toggleEvaluation(open = null) {
    this.state.evaluationOpen = open !== null ? open : !this.state.evaluationOpen;
    this.notify();
  }

  addToCart(dish) {
    this.state.cartCount++;
    this.notify();
  }
}

export const store = new ConstraintStore();
