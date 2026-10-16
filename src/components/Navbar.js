/**
 * Top Navigation Bar Component
 */

import { store } from "../utils/constraintStore.js";

export function renderNavbar(container) {
  const unsubscribe = store.subscribe(state => {
    container.innerHTML = `
      <header class="navbar">
        <a href="#" class="brand" id="brand-logo">
          <div class="brand-icon">🍜</div>
          <div>
            <div class="brand-title">IntentBite AI</div>
          </div>
          <span class="brand-badge">Feature Rebuild</span>
        </a>

        <div class="nav-actions">
          <button class="btn btn-glow-benchmark" id="btn-open-benchmark" title="Compare Conventional 8-Step Filters vs Natural Language">
            <span>⚡</span>
            <span>Before vs After</span>
          </button>

          <button class="btn btn-glass" id="btn-open-evaluation" title="Run AI Constraint Extraction Test Suite">
            <span>📊</span>
            <span>Test Suite</span>
          </button>

          <button class="btn btn-glass" id="btn-open-settings" title="Configure Gemini API Key">
            <span>⚙️</span>
            <span>${state.activeProvider.includes("Gemini") ? "Gemini Active" : "Local NLU"}</span>
          </button>

          <button class="btn btn-glass" id="btn-cart-view" title="Order Bag">
            <span>🛍️</span>
            <span>Bag (${state.cartCount})</span>
          </button>
        </div>
      </header>
    `;

    // Bind event listeners
    container.querySelector("#btn-open-benchmark")?.addEventListener("click", () => {
      store.toggleBenchmark(true);
    });

    container.querySelector("#btn-open-evaluation")?.addEventListener("click", () => {
      store.toggleEvaluation(true);
    });

    container.querySelector("#btn-open-settings")?.addEventListener("click", () => {
      store.toggleSettings(true);
    });

    container.querySelector("#btn-cart-view")?.addEventListener("click", () => {
      alert(`Shopping Bag: ${state.cartCount} items added in this demo session.`);
    });
  });

  return unsubscribe;
}
