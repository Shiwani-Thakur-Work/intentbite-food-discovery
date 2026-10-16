/**
 * Results Grid Component (Indian Dining Focus)
 * Displays ranked dish cards with iconic Veg/Non-Veg indicators, Rupee (₹) pricing,
 * and "Why This Matched" verification badges.
 */

import { store } from "../utils/constraintStore.js";
import confetti from "canvas-confetti";

export function renderResultsGrid(container) {
  const unsubscribe = store.subscribe(state => {
    const { evaluation, isLoading } = state;

    if (isLoading) {
      container.innerHTML = `
        <section class="results-section">
          <div style="text-align: center; padding: 4rem 1rem;">
            <div style="font-size: 2.8rem; animation: spin 1s infinite linear;">🥘</div>
            <h3 style="font-family: var(--font-display); margin-top: 1rem; color: var(--text-primary); font-size: 1.4rem;">
              Verifying dietary safety & ranking against your constraints...
            </h3>
            <p style="color: var(--text-muted); font-size: 0.95rem; margin-top: 0.35rem;">
              Checking Pure Veg/Jain certifications, ₹ budget caps, and delivery speed
            </p>
          </div>
        </section>
      `;
      return;
    }

    const { results, isFallback, relaxationMessage } = evaluation;

    container.innerHTML = `
      <section class="results-section">
        ${isFallback && relaxationMessage ? `
          <div class="fallback-banner">
            <span class="fallback-icon">⚠️</span>
            <div class="fallback-content">
              <h4>Constraint Bottleneck Resolved (Smart Relaxation)</h4>
              <p>${escapeHtml(relaxationMessage)}</p>
            </div>
          </div>
        ` : ""}

        <div class="results-header">
          <div class="results-count">
            Found <span>${results.length}</span> verified Indian meals
            ${state.rawQuery ? `<span style="font-size: 0.9rem; font-weight: normal; color: var(--text-muted); margin-left: 0.6rem;">for "${escapeHtml(state.rawQuery)}"</span>` : ""}
          </div>
          <div style="font-size: 0.88rem; color: var(--text-muted);">
            Ranked by Constraint Match Score
          </div>
        </div>

        <div class="dishes-grid">
          ${results.map(item => renderDishCard(item)).join("")}
        </div>
      </section>
    `;

    // Bind card click actions
    results.forEach(item => {
      const card = container.querySelector(`#dish-card-${item.dish.id}`);
      if (!card) return;

      card.querySelector(".btn-view-details")?.addEventListener("click", () => {
        store.openDishModal(item.dish);
      });

      card.querySelector(".btn-add-bag")?.addEventListener("click", (e) => {
        e.stopPropagation();
        store.addToCart(item.dish);

        // Micro-confetti burst
        confetti({
          particleCount: 28,
          spread: 48,
          origin: { y: 0.8 }
        });
      });
    });
  });

  return unsubscribe;
}

function renderDishCard(item) {
  const { dish, score, isHardSatisfied, isFallback, explanation } = item;

  let scoreClass = "score-perfect";
  if (score < 80) scoreClass = "score-relaxed";
  else if (score < 95) scoreClass = "score-high";

  return `
    <article class="dish-card" id="dish-card-${dish.id}">
      <div class="dish-media">
        <img src="${escapeHtml(dish.imageUrl)}" alt="${escapeHtml(dish.name)}" class="dish-img" loading="lazy" />
        <span class="match-score-badge ${scoreClass}">
          <span>🎯</span>
          <span>${score}% Match</span>
        </span>
        <span class="dish-price-pill"><span class="currency">₹</span>${dish.price}</span>
      </div>

      <div class="dish-body">
        <div class="dish-header">
          <div class="dish-restaurant">
            <span>${escapeHtml(dish.restaurantName)}</span>
            <span>•</span>
            <span>${escapeHtml(dish.locality)}</span>
          </div>

          <div class="dish-name-wrapper">
            <span class="food-type-badge ${dish.foodType}" title="${dish.foodType === 'veg' ? 'Pure Vegetarian' : 'Non-Vegetarian'}"></span>
            <h3 class="dish-name">${escapeHtml(dish.name)}</h3>
          </div>
        </div>

        <p class="dish-desc">${escapeHtml(dish.description)}</p>

        <!-- Why This Matched Section -->
        <div class="why-matched-container">
          <div class="why-matched-header">
            <span>✓</span>
            <span>Why This Matched</span>
          </div>

          <div class="badges-flow">
            ${explanation.badges.map(b => `
              <span class="verif-badge badge-${b.type}">
                ${escapeHtml(b.label)}
              </span>
            `).join("")}
          </div>
        </div>

        <div class="dish-footer-actions">
          <button class="btn-card-primary btn-view-details">
            View Details
          </button>
          <button class="btn-card-primary btn-add-bag" style="background: rgba(255, 107, 53, 0.16); color: #fed7aa; border-color: rgba(255, 107, 53, 0.38);">
            + Add to Order
          </button>
        </div>
      </div>
    </article>
  `;
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
