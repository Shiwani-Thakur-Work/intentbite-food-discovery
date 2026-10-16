/**
 * Main Application Orchestrator & Component Mount
 */

import { renderNavbar } from "./components/Navbar.js";
import { renderSearchHero } from "./components/SearchHero.js";
import { renderConstraintChips } from "./components/ConstraintChips.js";
import { renderResultsGrid } from "./components/ResultsGrid.js";
import { renderDishDetailModal } from "./components/DishDetailModal.js";
import { renderBenchmarkModal } from "./components/BenchmarkModal.js";
import { renderEvaluationModal } from "./components/EvaluationModal.js";
import { renderSettingsModal } from "./components/SettingsModal.js";
import { store } from "./utils/constraintStore.js";

document.addEventListener("DOMContentLoaded", () => {
  // Mount components
  renderNavbar(document.getElementById("nav-mount"));
  renderSearchHero(document.getElementById("hero-mount"));
  renderConstraintChips(document.getElementById("chips-mount"));
  renderResultsGrid(document.getElementById("results-mount"));
  renderDishDetailModal(document.getElementById("dish-modal-mount"));
  renderBenchmarkModal(document.getElementById("benchmark-modal-mount"));
  renderEvaluationModal(document.getElementById("eval-modal-mount"));
  renderSettingsModal(document.getElementById("settings-modal-mount"));

  // Global keyboard shortcuts
  window.addEventListener("keydown", (e) => {
    // Escape closes all modals
    if (e.key === "Escape") {
      store.closeDishModal();
      store.toggleBenchmark(false);
      store.toggleEvaluation(false);
      store.toggleSettings(false);
    }

    // '/' or 'Cmd+K' / 'Ctrl+K' focuses search input
    if (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
      e.preventDefault();
      const input = document.getElementById("search-input");
      input?.focus();
      input?.select();
    }
  });

  console.log("IntentBite AI Feature Rebuild initialized successfully.");
});
