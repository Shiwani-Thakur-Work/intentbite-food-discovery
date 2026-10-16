/**
 * Dish Detail Modal Component
 * In-depth allergen verification, nutrition macros, and restaurant metadata.
 */

import { store } from "../utils/constraintStore.js";
import confetti from "canvas-confetti";

export function renderDishDetailModal(container) {
  const unsubscribe = store.subscribe(state => {
    const dish = state.selectedDishModal;

    if (!dish) {
      container.innerHTML = "";
      return;
    }

    container.innerHTML = `
      <div class="modal-overlay" id="dish-modal-overlay">
        <div class="modal-content" style="max-width: 620px;">
          <button class="modal-close-btn" id="btn-close-dish-modal">✕</button>

          <div style="position: relative; height: 260px; overflow: hidden; border-radius: var(--radius-lg) var(--radius-lg) 0 0;">
            <img src="${escapeHtml(dish.imageUrl)}" alt="${escapeHtml(dish.name)}" style="width: 100%; height: 100%; object-fit: cover;" />
            <div style="position: absolute; bottom: 16px; left: 16px; background: rgba(9, 12, 19, 0.85); backdrop-filter: blur(8px); padding: 0.4rem 0.85rem; border-radius: var(--radius-md); font-size: 1.25rem; font-weight: 800; color: var(--accent-primary);">
              $${dish.price.toFixed(2)}
            </div>
          </div>

          <div style="padding: 1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
              <div>
                <span style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">
                  ${escapeHtml(dish.restaurantName)} • ${escapeHtml(dish.cuisine)}
                </span>
                <h2 style="font-family: var(--font-display); font-size: 1.5rem; color: var(--text-primary); margin-top: 0.2rem;">
                  ${escapeHtml(dish.name)}
                </h2>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 1.1rem; font-weight: 700; color: #fbbf24;">⭐ ${dish.rating}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${dish.deliveryTimeMin}-${dish.deliveryTimeMax} min delivery</div>
              </div>
            </div>

            <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6; margin-bottom: 1.25rem;">
              ${escapeHtml(dish.description)}
            </p>

            <!-- Macros Bar -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; margin-bottom: 1.5rem; background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 0.85rem; text-align: center;">
              <div>
                <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Calories</div>
                <div style="font-size: 1.2rem; font-weight: 700; color: var(--text-primary);">${dish.calories} kcal</div>
              </div>
              <div>
                <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Protein</div>
                <div style="font-size: 1.2rem; font-weight: 700; color: var(--accent-primary);">${dish.proteinGrams}g</div>
              </div>
              <div>
                <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Spice Level</div>
                <div style="font-size: 1.2rem; font-weight: 700; color: #f87171;">
                  ${dish.spiceLevel === 0 ? "None" : "🌶️".repeat(dish.spiceLevel)}
                </div>
              </div>
            </div>

            <!-- Dietary Certifications & Allergen Disclosures -->
            <div style="margin-bottom: 1.5rem;">
              <h4 style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); margin-bottom: 0.6rem;">
                Verified Dietary Certifications
              </h4>
              <div style="display: flex; flex-wrap: wrap; gap: 0.45rem;">
                ${dish.dietary.map(d => `
                  <span class="verif-badge badge-success">
                    ✓ Certified ${escapeHtml(d.replace("_", " "))}
                  </span>
                `).join("")}
              </div>
            </div>

            <div style="margin-bottom: 1.5rem;">
              <h4 style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); margin-bottom: 0.6rem;">
                Allergen Safety Checklist
              </h4>
              <div style="display: flex; flex-wrap: wrap; gap: 0.45rem;">
                ${["peanuts", "tree_nuts", "dairy", "gluten", "eggs", "shellfish", "soy"].map(a => {
                  const hasAllergen = dish.allergens.includes(a);
                  return `
                    <span class="verif-badge ${hasAllergen ? 'badge-warning' : 'badge-neutral'}">
                      ${hasAllergen ? `⚠️ Contains ${a}` : `✓ Free of ${a}`}
                    </span>
                  `;
                }).join("")}
              </div>
            </div>

            <div style="display: flex; gap: 0.75rem; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border-subtle);">
              <button class="btn btn-primary" id="btn-modal-add-bag" style="flex: 1; justify-content: center; padding: 0.85rem;">
                Add to Bag • $${dish.price.toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Event listeners
    container.querySelector("#btn-close-dish-modal")?.addEventListener("click", () => {
      store.closeDishModal();
    });

    container.querySelector("#dish-modal-overlay")?.addEventListener("click", (e) => {
      if (e.target.id === "dish-modal-overlay") {
        store.closeDishModal();
      }
    });

    container.querySelector("#btn-modal-add-bag")?.addEventListener("click", () => {
      store.addToCart(dish);
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.7 } });
      store.closeDishModal();
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
