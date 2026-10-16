/**
 * Interactive Constraint Chips Component
 * Allows users to inspect, edit, toggle strictness (Hard vs Soft), and remove
 * misunderstood parameters with one click.
 */

import { store } from "../utils/constraintStore.js";

export function renderConstraintChips(container) {
  const unsubscribe = store.subscribe(state => {
    const { constraints, activeFiltersCount } = state;

    if (!constraints || activeFiltersCount === 0) {
      container.innerHTML = "";
      return;
    }

    const { hard, soft } = constraints;

    const chips = [];

    // 1. Budget Chip
    if (hard.maxBudget != null) {
      chips.push({
        id: "chip-budget",
        label: `Max Budget: $${hard.maxBudget.toFixed(2)}${hard.budgetScope === "per_person" ? " / person" : ""}`,
        type: "hard",
        icon: "🔒",
        tag: "Hard Gate",
        onRemove: () => store.removeConstraint("hard", "maxBudget"),
        onEdit: () => {
          const newBudget = prompt("Update maximum budget ($):", hard.maxBudget);
          if (newBudget && !isNaN(parseFloat(newBudget))) {
            store.updateConstraint("hard", "maxBudget", parseFloat(newBudget));
          }
        }
      });
    }

    // 2. Group Size Chip
    if (hard.groupSize && hard.groupSize > 1) {
      chips.push({
        id: "chip-group",
        label: `Feeds: ${hard.groupSize} people`,
        type: "hard",
        icon: "👥",
        tag: "Group",
        onRemove: () => store.updateConstraint("hard", "groupSize", 1),
        onEdit: () => {
          const newSize = prompt("Update group size (number of people):", hard.groupSize);
          if (newSize && !isNaN(parseInt(newSize))) {
            store.updateConstraint("hard", "groupSize", parseInt(newSize));
          }
        }
      });
    }

    // 3. Dietary Restrictions (Hard)
    if (hard.dietaryRestrictions) {
      hard.dietaryRestrictions.forEach(diet => {
        chips.push({
          id: `chip-diet-${diet}`,
          label: `Diet: ${diet.replace("_", " ")}`,
          type: "hard",
          icon: "🌱",
          tag: "Hard Gate",
          onRemove: () => store.removeConstraint("hard", "dietaryRestrictions", diet),
          onToggleStrictness: () => store.toggleStrictness("dietary", diet)
        });
      });
    }

    // 4. Excluded Allergens (Hard)
    if (hard.excludedAllergens) {
      hard.excludedAllergens.forEach(allergen => {
        chips.push({
          id: `chip-allergen-${allergen}`,
          label: `No ${allergen}`,
          type: "hard",
          icon: "🛡️",
          tag: "Strict Safe",
          onRemove: () => store.removeConstraint("hard", "excludedAllergens", allergen)
        });
      });
    }

    // 5. Cuisines (Soft)
    if (soft.cuisines) {
      soft.cuisines.forEach(cuisine => {
        chips.push({
          id: `chip-cuisine-${cuisine}`,
          label: `Cuisine: ${cuisine}`,
          type: "soft",
          icon: "🍽️",
          tag: "Preference",
          onRemove: () => store.removeConstraint("soft", "cuisines", cuisine)
        });
      });
    }

    // 6. Delivery Speed (Soft)
    if (soft.targetDeliveryMaxMinutes != null) {
      chips.push({
        id: "chip-speed",
        label: `Delivery: < ${soft.targetDeliveryMaxMinutes} mins`,
        type: "soft",
        icon: "⚡",
        tag: "Speed",
        onRemove: () => store.removeConstraint("soft", "targetDeliveryMaxMinutes"),
        onEdit: () => {
          const newMins = prompt("Max delivery time (minutes):", soft.targetDeliveryMaxMinutes);
          if (newMins && !isNaN(parseInt(newMins))) {
            store.updateConstraint("soft", "targetDeliveryMaxMinutes", parseInt(newMins));
          }
        }
      });
    }

    // 7. Cravings (Soft)
    if (soft.cravings) {
      soft.cravings.forEach(craving => {
        chips.push({
          id: `chip-craving-${craving}`,
          label: `Craving: ${craving.replace("_", " ")}`,
          type: "soft",
          icon: "✨",
          tag: "Craving",
          onRemove: () => store.removeConstraint("soft", "cravings", craving)
        });
      });
    }

    container.innerHTML = `
      <section class="constraint-toolbar">
        <div class="toolbar-header">
          <div class="toolbar-title">
            <span>⚙️</span>
            <span>Extracted Constraints (${chips.length})</span>
            <span style="font-size: 0.75rem; font-weight: normal; color: var(--text-muted); margin-left: 0.5rem;">
              Click chip to edit • Click ✕ to remove
            </span>
          </div>

          <div style="display: flex; gap: 0.5rem; align-items: center;">
            <select id="quick-add-constraint" class="btn-add-filter" style="outline: none;">
              <option value="">+ Add Constraint...</option>
              <option value="vegan">Add: Vegan (Diet)</option>
              <option value="gluten_free">Add: Gluten-Free (Diet)</option>
              <option value="halal">Add: Halal (Diet)</option>
              <option value="no_dairy">Add: No Dairy (Allergen)</option>
              <option value="no_nuts">Add: No Nuts (Allergen)</option>
              <option value="under_15">Add: Budget ≤ $15</option>
              <option value="under_20">Add: Budget ≤ $20</option>
              <option value="speed_25">Add: Speed < 25 mins</option>
              <option value="high_protein">Add: High Protein</option>
              <option value="spicy">Add: Spicy</option>
            </select>

            <button class="btn btn-glass" id="btn-reset-filters" style="padding: 0.35rem 0.75rem; font-size: 0.78rem;">
              Reset All
            </button>
          </div>
        </div>

        <div class="chips-container">
          ${chips.map(chip => `
            <div class="chip ${chip.type === 'hard' ? 'chip-hard' : 'chip-soft'}" id="${chip.id}">
              <span class="chip-icon">${chip.icon}</span>
              <span class="chip-text" style="cursor: pointer;" title="Click to edit">${escapeHtml(chip.label)}</span>
              <span class="chip-tag">${chip.tag}</span>
              <button class="chip-btn-remove" data-action="remove" title="Remove constraint">✕</button>
            </div>
          `).join("")}
        </div>
      </section>
    `;

    // Event Delegation
    chips.forEach(chip => {
      const chipEl = container.querySelector(`#${chip.id}`);
      if (!chipEl) return;

      chipEl.querySelector(".chip-text")?.addEventListener("click", () => {
        if (chip.onEdit) chip.onEdit();
        else if (chip.onToggleStrictness) chip.onToggleStrictness();
      });

      chipEl.querySelector(".chip-btn-remove")?.addEventListener("click", (e) => {
        e.stopPropagation();
        chip.onRemove();
      });
    });

    container.querySelector("#btn-reset-filters")?.addEventListener("click", () => {
      store.clearSearch();
    });

    const addSelect = container.querySelector("#quick-add-constraint");
    addSelect?.addEventListener("change", (e) => {
      const val = e.target.value;
      if (!val) return;

      if (val === "vegan" || val === "gluten_free" || val === "halal") {
        const current = hard.dietaryRestrictions || [];
        if (!current.includes(val)) {
          store.updateConstraint("hard", "dietaryRestrictions", [...current, val]);
        }
      } else if (val === "no_dairy") {
        const current = hard.excludedAllergens || [];
        if (!current.includes("dairy")) {
          store.updateConstraint("hard", "excludedAllergens", [...current, "dairy"]);
        }
      } else if (val === "no_nuts") {
        const current = hard.excludedAllergens || [];
        if (!current.includes("peanuts")) {
          store.updateConstraint("hard", "excludedAllergens", [...current, "peanuts", "tree_nuts"]);
        }
      } else if (val === "under_15") {
        store.updateConstraint("hard", "maxBudget", 15.0);
      } else if (val === "under_20") {
        store.updateConstraint("hard", "maxBudget", 20.0);
      } else if (val === "speed_25") {
        store.updateConstraint("soft", "targetDeliveryMaxMinutes", 25);
      } else if (val === "high_protein" || val === "spicy") {
        const current = soft.cravings || [];
        if (!current.includes(val)) {
          store.updateConstraint("soft", "cravings", [...current, val]);
        }
      }
      e.target.value = "";
    });
  });

  return unsubscribe;
}

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/[&<>"']/g, m => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[m]);
}
