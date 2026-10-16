/**
 * Settings & Gemini API Modal Component
 * Configures Gemini API key and shows engine telemetry.
 */

import { store } from "../utils/constraintStore.js";
import { getActiveApiKey, setActiveApiKey } from "../engine/geminiClient.js";

export function renderSettingsModal(container) {
  const unsubscribe = store.subscribe(state => {
    if (!state.settingsOpen) {
      container.innerHTML = "";
      return;
    }

    const currentKey = getActiveApiKey() || "";

    container.innerHTML = `
      <div class="modal-overlay" id="settings-modal-overlay">
        <div class="modal-content" style="max-width: 580px;">
          <button class="modal-close-btn" id="btn-close-settings">✕</button>

          <div style="padding: 2rem;">
            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
              <span style="font-size: 1.75rem;">⚙️</span>
              <div>
                <h2 style="font-family: var(--font-display); font-size: 1.5rem; color: var(--text-primary);">
                  AI Engine Settings
                </h2>
                <p style="color: var(--text-secondary); font-size: 0.85rem;">
                  Dual-Engine Architecture: Live Google Gemini LLM + Offline Deterministic NLP
                </p>
              </div>
            </div>

            <div style="margin: 1.5rem 0;">
              <label for="gemini-key-input" style="display: block; font-size: 0.85rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.4rem;">
                Google Gemini API Key
              </label>
              <input 
                type="password" 
                id="gemini-key-input" 
                class="search-input" 
                placeholder="AIzaSy..." 
                value="${escapeHtml(currentKey)}"
                style="width: 100%; padding: 0.75rem 1rem; background: rgba(0,0,0,0.3); border: 1px solid var(--border-card); border-radius: var(--radius-md); font-family: monospace; font-size: 0.9rem;"
              />
              <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.35rem;">
                Stored securely in your local browser storage. If left blank, the app runs on the built-in deterministic local NLP engine with zero latency.
              </p>
            </div>

            <!-- Architecture Info Box -->
            <div style="background: rgba(16, 185, 129, 0.06); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1.5rem;">
              <div style="font-weight: 700; color: #6ee7b7; font-size: 0.85rem; margin-bottom: 0.35rem;">
                🛡️ Zero-Downtime Guarantee
              </div>
              <p style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.5;">
                Even with no internet or rate-limited API keys, the deterministic parser ensures instant, 100% compliant multi-constraint extraction. When a Gemini key is present, natural language conversational nuance is fully leveraged.
              </p>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid var(--border-subtle);">
              <button class="btn btn-glass" id="btn-clear-key" style="color: #f87171;">
                Clear Key (Use Local)
              </button>

              <div style="display: flex; gap: 0.5rem;">
                <button class="btn btn-glass" id="btn-cancel-settings">Cancel</button>
                <button class="btn btn-primary" id="btn-save-settings">Save &amp; Apply</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Event listeners
    container.querySelector("#btn-close-settings")?.addEventListener("click", () => {
      store.toggleSettings(false);
    });

    container.querySelector("#btn-cancel-settings")?.addEventListener("click", () => {
      store.toggleSettings(false);
    });

    container.querySelector("#settings-modal-overlay")?.addEventListener("click", (e) => {
      if (e.target.id === "settings-modal-overlay") {
        store.toggleSettings(false);
      }
    });

    container.querySelector("#btn-clear-key")?.addEventListener("click", () => {
      setActiveApiKey("");
      store.state.activeProvider = "Local NLU Engine";
      store.notify();
      store.toggleSettings(false);
    });

    container.querySelector("#btn-save-settings")?.addEventListener("click", () => {
      const val = container.querySelector("#gemini-key-input").value.trim();
      setActiveApiKey(val);
      store.state.activeProvider = val ? "Google Gemini 1.5 Flash" : "Local NLU Engine";
      store.notify();
      store.toggleSettings(false);
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
