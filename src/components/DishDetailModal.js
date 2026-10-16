/**
 * Dish Detail Modal Component (Indian Context)
 * In-depth allergen verification, nutrition macros, spice meter, and restaurant metadata.
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
        <div class="modal-content" style="max-width: 640px;">
          <button class="modal-close-btn" id="btn-close-dish-modal">✕</button>

          <div style="position: relative; height: 280px; overflow: hidden; border-radius: var(--radius-lg) var(--radius-lg) 0 0;">
            <img src="${escapeHtml(dish.imageUrl)}" alt="${escapeHtml(dish.name)}" style="width: 100%; height: 100%; object-fit: cover;" />
            <div style="position: absolute; bottom: 16px; left: 16px; background: rgba(9, 12, 21, 0.88); backdrop-filter: blur(10px); padding: 0.5rem 1rem; border-radius: var(--radius-md); font-size: 1.4rem; font-weight: 900; color: #ffffff; border: 1px solid rgba(255, 255, 255, 0.15);">
              <span style="color: var(--accent-saffron);">₹</span>${dish.price}
            </div>
          </div>

          <div style="padding: 1.75rem;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.85rem;">
              <div>
                <span style="font-size: 0.825rem; color: var(--text-muted); font-weight: 600;">
                  ${escapeHtml(dish.restaurantName)} • ${escapeHtml(dish.locality)}
                </span>
                <div style="display: flex; align-items: center; gap: 0.6rem; margin-top: 0.3rem;">
                  <span class="food-type-badge ${dish.foodType}"></span>
                  <h2 style="font-family: var(--font-display); font-size: 1.6rem; color: var(--text-primary);">
                    ${escapeHtml(dish.name)}
                  </h2>
                </div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 1.15rem; font-weight: 800; color: #fbbf24;">⭐ ${dish.rating}</div>
                <div style="font-size: 0.78rem; color: var(--text-muted);">${dish.deliveryTimeMin}-${dish.deliveryTimeMax} mins delivery</div>
              </div>
            </div>

            <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6; margin-bottom: 1.4rem;">
              ${escapeHtml(dish.description)}
            </p>

            <!-- Macros Bar -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.85rem; margin-bottom: 1.5rem; background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1rem; text-align: center;">
              <div>
                <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Calories</div>
                <div style="font-size: 1.25rem; font-weight: 800; color: var(--text-primary);">${dish.calories} kcal</div>
              </div>
              <div>
                <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Protein</div>
                <div style="font-size: 1.25rem; font-weight: 800; color: var(--accent-primary);">${dish.proteinGrams}g</div>
              </div>
              <div>
                <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Spice Level</div>
                <div style="font-size: 1.15rem; font-weight: 800; color: #f87171;">
                  ${dish.spiceLevel === 0 ? "Mild" : "🌶️".repeat(dish.spiceLevel) + (dish.spiceLevel === 3 ? " Teekha" : "")}
                </div>
              </div>
            </div>

            <!-- Dietary Certifications -->
            <div style="margin-bottom: 1.4rem;">
              <h4 style="font-size: 0.85rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); margin-bottom: 0.65rem;">
                Verified Dietary Certifications
              </h4>
              <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                <span class="verif-badge badge-success">
                  ✓ ${dish.foodType === 'veg' ? '100% Pure Vegetarian' : 'Non-Vegetarian'}
                </span>
                ${dish.dietary.map(d => `
                  <span class="verif-badge badge-success">
                    ✓ ${d === 'jain' ? 'Jain Certified (No Onion/Garlic)' : d === 'halal' ? '100% Halal' : d === 'gluten_free' ? 'Gluten-Free (No Maida)' : d.replace("_", " ")}
                  </span>
                `).join("")}
              </div>
            </div>

            <!-- Allergen Disclosures -->
            <div style="margin-bottom: 1.5rem;">
              <h4 style="font-size: 0.85rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); margin-bottom: 0.65rem;">
                Allergen Safety Checklist
              </h4>
              <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                ${["dairy", "gluten", "peanuts", "tree_nuts", "soy", "eggs"].map(a => {
                  const hasAllergen = dish.allergens.includes(a);
                  let name = a;
                  if (a === "dairy") name = "dairy/ghee";
                  if (a === "gluten") name = "gluten/maida";
                  return `
                    <span class="verif-badge ${hasAllergen ? 'badge-warning' : 'badge-neutral'}">
                      ${hasAllergen ? `⚠️ Contains ${name}` : `✓ Free of ${name}`}
                    </span>
                  `;
                }).join("")}
              </div>
            </div>

            <div style="display: flex; gap: 0.85rem; margin-top: 1.5rem; padding-top: 1.25rem; border-top: 1px solid var(--border-subtle);">
              <button class="btn btn-primary" id="btn-modal-add-bag" style="flex: 1; justify-content: center; padding: 0.95rem; font-size: 1rem;">
                Add to Order • ₹${dish.price}
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
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
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
