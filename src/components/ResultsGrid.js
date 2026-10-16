/**
 * Results Grid Component
 * Displays ranked dish cards, match percentage meters, and "Why This Matched" breakdowns.
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
            <div style="font-size: 2.5rem; animation: spin 1s infinite linear;">🍲</div>
            <h3 style="font-family: var(--font-display); margin-top: 1rem; color: var(--text-primary);">
              Verifying dietary safety & ranking against constraints...
            </h3>
            <p style="color: var(--text-muted); font-size: 0.9rem;">
              Evaluating budget caps, allergens, and speed requirements
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
            Found <span>${results.length}</span> verified options
            ${state.rawQuery ? `<span style="font-size: 0.85rem; font-weight: normal; color: var(--text-muted); margin-left: 0.5rem;">for "${escapeHtml(state.rawQuery)}"</span>` : ""}
          </div>
          <div style="font-size: 0.85rem; color: var(--text-muted);">
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
          particleCount: 25,
          spread: 45,
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
        <span class="dish-price-pill">$${dish.price.toFixed(2)}</span>
      </div>

      <div class="dish-body">
        <div class="dish-header">
          <div class="dish-restaurant">${escapeHtml(dish.restaurantName)} • ${escapeHtml(dish.cuisine)}</div>
          <h3 class="dish-name">${escapeHtml(dish.name)}</h3>
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
          <button class="btn-card-primary btn-add-bag" style="background: rgba(16, 185, 129, 0.15); color: #34d399; border-color: rgba(16, 185, 129, 0.35);">
            + Add to Bag
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
