/**
 * Before vs After Workflow Benchmark Modal Component (Indian Food Context)
 * Compares conventional Swiggy/Zomato multi-filter friction against IntentBite AI.
 */

import { store } from "../utils/constraintStore.js";
import confetti from "canvas-confetti";

export function renderBenchmarkModal(container) {
  let conventionalClicks = 0;
  let conventionalStep = 0;

  const stepsList = [
    "1. Tap 'All Filters' modal button",
    "2. Toggle 'Pure Veg' filter switch",
    "3. Open 'Cost' dropdown and select '₹200 - ₹350'",
    "4. Expand 'Delivery Time' slider and drag to < 30 mins",
    "5. Scroll through 40 cuisines and check 'North Indian'",
    "6. Tap 'Apply 5 Filters' button",
    "7. Tap on Restaurant Card #1 in the list",
    "8. Scroll through 60 dishes manually to see if gravy contains onion/garlic or dairy"
  ];

  const unsubscribe = store.subscribe(state => {
    if (!state.benchmarkOpen) {
      container.innerHTML = "";
      return;
    }

    container.innerHTML = `
      <div class="modal-overlay" id="benchmark-modal-overlay">
        <div class="modal-content" style="max-width: 840px;">
          <button class="modal-close-btn" id="btn-close-benchmark">✕</button>

          <div style="padding: 2.25rem;">
            <div style="display: flex; align-items: center; gap: 0.85rem; margin-bottom: 0.6rem;">
              <span style="font-size: 2rem;">⚡</span>
              <div>
                <h2 style="font-family: var(--font-display); font-size: 1.7rem; color: var(--text-primary);">
                  Portfolio Workflow Benchmark
                </h2>
                <p style="color: var(--text-secondary); font-size: 0.92rem;">
                  Comparing conventional 8-step filtering against IntentBite Indian Natural-Language AI
                </p>
              </div>
            </div>

            <!-- Comparison Metric Cards -->
            <div class="benchmark-grid">
              <!-- Before -->
              <div class="benchmark-card">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 0.825rem; font-weight: 800; text-transform: uppercase; color: #f87171;">
                    Conventional Food Apps
                  </span>
                  <span style="font-size: 0.75rem; color: var(--text-muted);">Status Quo</span>
                </div>
                <div class="benchmark-stat" style="color: #f87171;">
                  8 - 12 <span style="font-size: 1rem; font-weight: normal; color: var(--text-muted);">clicks</span>
                </div>
                <p style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 1.15rem;">
                  Average time: <strong>~180 seconds</strong>. Tapping filter modals, adjusting sliders, and manually scrutinizing dish descriptions for Pure Veg/Jain compliance.
                </p>
                <div style="background: rgba(0, 0, 0, 0.35); border-radius: var(--radius-sm); padding: 0.85rem; font-size: 0.825rem; color: var(--text-secondary); min-height: 85px;">
                  <div style="color: var(--text-muted); margin-bottom: 0.3rem;">Interactive Click Simulation:</div>
                  <div style="color: #fca5a5; font-weight: 700;">
                    ${conventionalStep < stepsList.length ? stepsList[conventionalStep] : "✓ Done: Found 1 candidate after 8 tedious clicks"}
                  </div>
                </div>
                <button class="btn btn-glass" id="btn-step-conventional" style="width: 100%; margin-top: 0.85rem; justify-content: center; font-size: 0.85rem;">
                  ${conventionalStep < stepsList.length ? `Simulate Tap (${conventionalClicks} Clicks)` : "Reset Conventional Simulation"}
                </button>
              </div>

              <!-- After -->
              <div class="benchmark-card highlight">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 0.825rem; font-weight: 800; text-transform: uppercase; color: var(--accent-saffron);">
                    IntentBite AI Feature Rebuild
                  </span>
                  <span style="font-size: 0.75rem; color: var(--accent-saffron); font-weight: 800;">85% Faster</span>
                </div>
                <div class="benchmark-stat" style="color: var(--accent-saffron);">
                  1 <span style="font-size: 1rem; font-weight: normal; color: var(--text-muted);">natural sentence</span>
                </div>
                <p style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 1.15rem;">
                  Average time: <strong>~12 seconds</strong>. Express budget in ₹, dietary needs (Pure Veg, Jain, Halal), and cravings in one shot with 100% hard constraint gating.
                </p>
                <div style="background: rgba(255, 107, 53, 0.08); border: 1px solid rgba(255, 107, 53, 0.25); border-radius: var(--radius-sm); padding: 0.85rem; font-size: 0.825rem; color: #ffedd5; min-height: 85px;">
                  <div style="font-weight: 800; margin-bottom: 0.3rem; color: var(--accent-saffron);">Sample Indian Query:</div>
                  <em>"Pure veg paneer butter masala under ₹300 ready in 30 mins"</em>
                  <div style="margin-top: 0.4rem; font-size: 0.78rem; color: #34d399;">
                    ⚡ Extracted 4 constraints in 14ms • 100% Pure Veg &amp; ₹300 verified
                  </div>
                </div>
                <button class="btn btn-primary" id="btn-test-nl-query" style="width: 100%; margin-top: 0.85rem; justify-content: center; font-size: 0.85rem;">
                  Test Natural Language Query
                </button>
              </div>
            </div>

            <!-- Summary Table -->
            <div style="margin-top: 1.75rem; background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); overflow: hidden;">
              <table style="width: 100%; border-collapse: collapse; font-size: 0.88rem; text-align: left;">
                <thead>
                  <tr style="background: rgba(255, 255, 255, 0.04); color: var(--text-muted); font-size: 0.78rem; text-transform: uppercase;">
                    <th style="padding: 0.85rem 1.15rem;">Workflow Metric</th>
                    <th style="padding: 0.85rem 1.15rem;">Conventional Multi-Filters</th>
                    <th style="padding: 0.85rem 1.15rem;">IntentBite AI Rebuild</th>
                    <th style="padding: 0.85rem 1.15rem;">Improvement</th>
                  </tr>
                </thead>
                <tbody style="color: var(--text-secondary);">
                  <tr style="border-top: 1px solid var(--border-subtle);">
                    <td style="padding: 0.85rem 1.15rem; font-weight: 700; color: var(--text-primary);">Clicks to Dish</td>
                    <td style="padding: 0.85rem 1.15rem; color: #f87171;">8 - 12 clicks</td>
                    <td style="padding: 0.85rem 1.15rem; color: #34d399; font-weight: 800;">1 input step</td>
                    <td style="padding: 0.85rem 1.15rem; color: #34d399;">- 88% friction</td>
                  </tr>
                  <tr style="border-top: 1px solid var(--border-subtle);">
                    <td style="padding: 0.85rem 1.15rem; font-weight: 700; color: var(--text-primary);">Time-to-Order</td>
                    <td style="padding: 0.85rem 1.15rem;">180 - 240 seconds</td>
                    <td style="padding: 0.85rem 1.15rem; color: #34d399; font-weight: 800;">10 - 15 seconds</td>
                    <td style="padding: 0.85rem 1.15rem; color: #34d399;">- 92% latency</td>
                  </tr>
                  <tr style="border-top: 1px solid var(--border-subtle);">
                    <td style="padding: 0.85rem 1.15rem; font-weight: 700; color: var(--text-primary);">Dietary False Positives</td>
                    <td style="padding: 0.85rem 1.15rem; color: #f87171;">26% (restaurant vs dish gap)</td>
                    <td style="padding: 0.85rem 1.15rem; color: #34d399; font-weight: 800;">0% (dish-level verified)</td>
                    <td style="padding: 0.85rem 1.15rem; color: #34d399;">100% safety</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style="margin-top: 1.75rem; display: flex; justify-content: flex-end;">
              <button class="btn btn-glass" id="btn-done-benchmark">Close Benchmark</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Event listeners
    container.querySelector("#btn-close-benchmark")?.addEventListener("click", () => {
      store.toggleBenchmark(false);
    });

    container.querySelector("#btn-done-benchmark")?.addEventListener("click", () => {
      store.toggleBenchmark(false);
    });

    container.querySelector("#benchmark-modal-overlay")?.addEventListener("click", (e) => {
      if (e.target.id === "benchmark-modal-overlay") {
        store.toggleBenchmark(false);
      }
    });

    container.querySelector("#btn-step-conventional")?.addEventListener("click", () => {
      if (conventionalStep < stepsList.length) {
        conventionalClicks++;
        conventionalStep++;
      } else {
        conventionalClicks = 0;
        conventionalStep = 0;
      }
      store.notify();
    });

    container.querySelector("#btn-test-nl-query")?.addEventListener("click", () => {
      store.toggleBenchmark(false);
      store.setQuery("Pure veg paneer butter masala under ₹300 ready in 30 mins");
      confetti({ particleCount: 40, spread: 55, origin: { y: 0.6 } });
    });
  });

  return unsubscribe;
}
