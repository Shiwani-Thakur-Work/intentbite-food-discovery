/**
 * Search Hero Component
 * Natural-language input, real-time feedback, sample prompts, and voice search simulation.
 */

import { store } from "../utils/constraintStore.js";
import { TEST_QUERIES } from "../data/testQueries.js";

export function renderSearchHero(container) {
  let isListening = false;

  const unsubscribe = store.subscribe(state => {
    container.innerHTML = `
      <section class="hero">
        <div class="hero-tag">
          <span>✨</span>
          <span>Zero-Friction Multi-Constraint Meal Discovery</span>
        </div>

        <h1 class="hero-title">
          Describe what you want to eat.<br/>
          <span class="gradient-text">We verify every constraint.</span>
        </h1>

        <p class="hero-subtitle">
          Say goodbye to tapping through 8 filter menus. State your budget, dietary needs, allergens, group size, and cravings in one natural sentence.
        </p>

        <div class="search-container">
          <form id="search-form" class="search-box-wrapper">
            <span class="search-icon">🔍</span>
            <input 
              type="text" 
              id="search-input" 
              class="search-input" 
              placeholder="e.g., Healthy vegan lunch under $18 ready in 25 mins..." 
              value="${escapeHtml(state.rawQuery)}"
              autocomplete="off"
            />
            <div class="search-actions">
              ${state.rawQuery ? `
                <button type="button" id="btn-clear-search" class="btn-clear" title="Clear search">
                  ✕
                </button>
              ` : ""}
              
              <button type="button" id="btn-voice-search" class="btn btn-glass" title="Simulate Voice Input" style="padding: 0.55rem 0.85rem;">
                <span>${isListening ? "🎙️ Listening..." : "🎤 Voice"}</span>
              </button>

              <button type="submit" class="btn btn-primary btn-search" id="btn-submit-search">
                ${state.isLoading ? "Analyzing..." : "Find Meals"}
              </button>
            </div>
          </form>

          <div class="sample-prompts">
            <span class="sample-prompts-label">Try asking:</span>
            ${TEST_QUERIES.slice(0, 5).map(q => `
              <button class="prompt-pill" data-query="${escapeHtml(q.text)}">
                "${escapeHtml(q.text)}"
              </button>
            `).join("")}
          </div>
        </div>

        <div class="telemetry-bar">
          <div class="provider-status">
            <span class="provider-dot"></span>
            <span>Active Engine: <strong>${escapeHtml(state.activeProvider)}</strong></span>
          </div>

          <div>
            ${state.lastParseLatencyMs ? `
              <span>⚡ Parsed in <strong>${state.lastParseLatencyMs}ms</strong></span>
              <span style="margin: 0 0.5rem; opacity: 0.4;">|</span>
            ` : ""}
            <span>🎯 <strong>100%</strong> Hard Constraint Compliance Guarantee</span>
          </div>
        </div>
      </section>
    `;

    // Event listeners
    const form = container.querySelector("#search-form");
    const input = container.querySelector("#search-input");
    const clearBtn = container.querySelector("#btn-clear-search");
    const voiceBtn = container.querySelector("#btn-voice-search");

    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      const val = input.value.trim();
      if (val) {
        store.setQuery(val);
      }
    });

    clearBtn?.addEventListener("click", () => {
      store.clearSearch();
    });

    voiceBtn?.addEventListener("click", () => {
      // Voice search simulation: Pick an exciting multi-constraint query
      isListening = true;
      voiceBtn.innerHTML = "<span>🎙️ Listening...</span>";
      setTimeout(() => {
        const spoken = "Spicy Thai comfort soup under $16 with no gluten";
        if (input) input.value = spoken;
        isListening = false;
        store.setQuery(spoken);
      }, 1200);
    });

    container.querySelectorAll(".prompt-pill").forEach(pill => {
      pill.addEventListener("click", () => {
        const query = pill.getAttribute("data-query");
        if (query) {
          store.setQuery(query);
        }
      });
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
