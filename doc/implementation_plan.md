# AI Feature Rebuild: Natural-Language Food Discovery — Implementation Plan

> **Comprehensive, phased implementation plan with technical specifications, acceptance criteria, test cases, and dependency mapping.**

---

## 1. Project Roadmap Overview

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               PHASED IMPLEMENTATION TIMELINE                            │
├───────────────┬─────────────────┬─────────────────┬──────────────────┬─────────────────┤
│    PHASE 0    │     PHASE 1     │     PHASE 2     │     PHASE 3      │  PHASE 4 & 5    │
│ Project Setup │ Curated Dataset │  Dual NLU Engine│ Ranking & Match  │ WOW UI, Chips & │
│ & Tooling     │ (50+ Dishes)    │ (Gemini + Local)│  & Explanations  │ Benchmark Suite │
└───────────────┴─────────────────┴─────────────────┴──────────────────┴─────────────────┘
```

| Phase | Milestone | Primary Deliverable | Status |
| :--- | :--- | :--- | :--- |
| **Phase 0** | Tooling & Foundation | `package.json`, Vite configuration, folder structure, tokens | In Progress |
| **Phase 1** | Curated Food Data | 50+ multi-attribute dishes across 16 restaurants (`foodDataset.js`) | Planned |
| **Phase 2** | NLU & Intent Engine | Local deterministic regex parser + Gemini API client (`nluParser.js`, `geminiClient.js`) | Planned |
| **Phase 3** | Ranking & Explanation | Hard constraint gating, weighted scoring & breakdown generator | Planned |
| **Phase 4** | Interactive UI | Search Hero, Editable Chips, Glassmorphic Result Cards, Detail Modal | Planned |
| **Phase 5** | Portfolio Benchmark | Side-by-side Before (8-step filter) vs After (AI) interactive simulator | Planned |
| **Phase 6** | Quality & Verification | E2E functional verification, test queries, and documentation polish | Planned |

---

## 2. Phase 0: Project Setup & Modern Tooling

### Task 0.1 — Initialize Vite Application
- Create `package.json` with scripts:
  - `"dev"`: `"vite --host --port 3000"`
  - `"build"`: `"vite build"`
  - `"preview"`: `"vite preview"`
- Configure dependencies:
  - `@google/generative-ai` (Gemini API client)
  - `vite`
- Create `.env.example` with `VITE_GEMINI_API_KEY=` placeholder.

### Task 0.2 — Directory & Asset Architecture
- Establish modular directories:
  ```
  src/
  ├── data/           # Dataset & test suites
  ├── engine/         # NLU parser, Gemini client, matcher, explainability
  ├── components/     # UI components (Hero, Chips, Grid, Modals, Benchmark)
  ├── utils/          # State store, metrics telemetry, storage
  ├── styles/         # CSS design system, typography, tokens, animations
  ├── main.js         # Core entry point
  └── index.html      # Shell with SEO metadata
  ```

---

## 3. Phase 1: Curated Multi-Attribute Food Dataset

### Task 1.1 — Restaurant & Dish Dataset (`src/data/foodDataset.js`)
- Hand-craft 50+ dishes across 16 authentic restaurants with realistic attributes:
  - **Cuisines:** Thai, Mexican, Japanese, Italian, Indian, Mediterranean, American, Vietnamese, Ethiopian, Healthy Bowls.
  - **Pricing:** Ranging from $8.50 to $34.00, including single portions, duo meals, and family packs ($50-$80).
  - **Dietary Certifications:** Vegan, Vegetarian, Gluten-Free, Halal, Dairy-Free, Nut-Free, Keto.
  - **Allergen Disclosures:** Peanuts, tree nuts, dairy, gluten, eggs, shellfish, soy.
  - **Speed & Logistics:** Prep time (10-35 mins), delivery fees ($0 - $3.99), ratings (4.2 - 4.9).
  - **Nutritional Metrics:** Calories (320 - 980 kcal), protein grams (12g - 52g).
  - **Sensory Tags:** `high_protein`, `comfort`, `crispy`, `soup`, `spicy`, `light`, `hearty`, `refreshing`.
  - **High-Quality Visuals:** Direct Unsplash curated food photos with fallback placeholders.

### Task 1.2 — Canonical Evaluation Test Queries (`src/data/testQueries.js`)
- Define 10 canonical test queries representing diverse real-world constraints:
  1. *"Healthy vegan dinner under $18 ready in 25 mins"*
  2. *"High protein post-workout lunch under $22 with no dairy"*
  3. *"Family dinner for 4 people under $60 with nut allergy"*
  4. *"Spicy Thai comfort soup under $16"*
  5. *"Late night halal burger under $15"*
  6. *"Strict gluten-free Italian pasta under $25"*
  7. *"Crispy tacos under $12 ready fast"*
  8. *"Keto friendly Mediterranean bowl under $20"*
  9. *"Cheap comfort food under $10"*
  10. *"Vegetarian sushi combo for 2 under $35"*

---

## 4. Phase 2: Dual NLU Constraint Extraction Engine

### Task 2.1 — Deterministic Rule-Based NLP Parser (`src/engine/nluParser.js`)
- Implement zero-dependency regex and lexicon-based token extractor:
  - Budget extraction (regex for `under \$?(\d+)`, `less than \$?(\d+)`, `max \$?(\d+)`, `cheap`, `for (\d+) people`).
  - Dietary keyword normalization (`vegan`, `plant-based`, `celiac`, `gluten-free`, `dairy-free`, `halal`).
  - Cuisine detection across 12 major culinary traditions.
  - Delivery time extraction (`under (\d+) mins?`, `quick`, `fast`).
  - Craving & sensory tag matching (`spicy`, `comfort`, `protein`, `crispy`, `soup`).
  - Confidence scoring and heuristic explanation summary generation.

### Task 2.2 — Google Gemini API Engine (`src/engine/geminiClient.js`)
- Implement prompt template with structured JSON mode:
  - Few-shot schema calibration.
  - Automatic fallback to `nluParser.js` if API key is absent, rate-limited, or network fails.
  - Support for runtime Gemini API Key entry via UI settings modal.

### Task 2.3 — Interactive Constraint State Manager (`src/engine/constraintStore.js`)
- Store active constraints with full mutation APIs:
  - Add constraint.
  - Remove constraint chip.
  - Edit constraint value (e.g. increase budget from $15 to $20).
  - Toggle constraint strictness (Hard $\leftrightarrow$ Soft).
  - Trigger instant reactive re-ranking upon every mutation.

---

## 5. Phase 3: Matching, Ranking & Explanation Engine

### Task 3.1 — Hard Constraint Gating (`src/engine/matcher.js`)
- Filter out items strictly violating:
  - Item price $>$ `maxBudget`.
  - Missing any specified dietary requirement (`item.dietary.includes(diet)`).
  - Containing any specified allergen (`item.allergens.includes(allergen)`).

### Task 3.2 — Multi-Factor Soft Scoring
- Calculate composite score for eligible items:
  - Cuisine affinity ($+30\text{ pts}$).
  - Craving/tag matching ($+25\text{ pts}$ per matched tag).
  - Delivery speed adherence ($+20\text{ pts}$ if $\le \text{targetTime}$).
  - Star rating weighting ($+15\text{ pts}$ scaled by rating).
  - Budget headroom ($+10\text{ pts}$ if well below cap).

### Task 3.3 — "Why This Matched" Generator (`src/engine/explanation.js`)
- Generate human-readable breakdown for each dish:
  - Budget compliance badge (`"✓ $14.50 — well within $18 max"`).
  - Dietary certification badge (`"✓ 100% Certified Gluten-Free & Vegan"`).
  - Velocity badge (`"✓ 20 min delivery (within 30 min target)"`).
  - Craving match badge (`"✓ Matches 'High-Protein' (36g protein)"`).

### Task 3.4 — Smart Fallback & Constraint Relaxation Resolver
- If 0 items survive hard gating:
  - Automatically identify the narrowest bottleneck constraint.
  - Generate relaxed alternatives with explicit notices (e.g., *"Raised budget to $21 to reveal 4 matching artisan bowls"*).

---

## 6. Phase 4: Modern WOW-Factor UI & Components

### Task 4.1 — CSS Design System & Glassmorphism (`src/styles/designSystem.css`)
- **Theme:** Sleek modern dark mode with curated HSL color palette:
  - Primary Accent: Electric Emerald (`hsl(158, 85%, 45%)`) & Radiant Amber (`hsl(38, 92%, 50%)`).
  - Background: Deep obsidian glass (`hsl(222, 24%, 9%)`).
  - Surfaces: Frosted glassmorphism (`backdrop-filter: blur(16px)`).
  - Typography: Google Fonts Inter + Outfit for headlines.
  - Micro-interactions: Smooth scale hover effects, pulse animations on active chips, glow highlights.

### Task 4.2 — Search Hero & Suggestion Pills (`src/components/SearchHero.js`)
- Glowing search input with real-time feedback.
- One-click sample prompt chips for quick exploration.
- Voice search simulation button (interactive speech-to-text demonstration).
- AI Provider status badge (indicating Gemini API Active or Local Engine).

### Task 4.3 — Interactive Constraint Chips Bar (`src/components/ConstraintChips.js`)
- Render parsed constraints with distinct icons and color-coded badges.
- Click to edit value in popover modal.
- Click 'x' to dismiss.
- 'Add Constraint' quick dropdown.
- Toggle between Hard (Lock icon) and Soft (Heart/Star icon).

### Task 4.4 — Results Grid & Rich Dish Cards (`src/components/ResultsGrid.js`)
- Match Score percentage ring/gauge.
- Verified dietary & allergen compliance badges.
- Expandable "Why This Matched" section on each card.
- Quick preview button opening rich dish details.

### Task 4.5 — Dish Detail Modal (`src/components/DishDetailModal.js`)
- Full dish overview, nutritional macros (calories, protein, carbs).
- Verified ingredient list with allergen safety checklist.
- Restaurant delivery details and simulated "Add to Order" action.

---

## 7. Phase 5: "Before vs After" Benchmark Simulator

### Task 5.1 — Benchmark Simulator Component (`src/components/BenchmarkModal.js`)
- Interactive dual-mode comparison:
  - **Mode A (Conventional App):** Simulate 8 required clicks (Dropdown 1: Budget, Dropdown 2: Diet, Dropdown 3: Rating, Dropdown 4: Delivery, Dropdown 5: Cuisine, etc.) with real-time click counter and frustration timer.
  - **Mode B (Natural Language Rebuild):** 1-sentence prompt returning instant ranked, verified results in $<1$ second with 1 click.
- Telemetry summary card showing **$85\%$ reduction in interactions** and **$100\%$ hard constraint compliance**.

### Task 5.2 — Evaluation Suite Runner (`src/components/EvaluationSuite.js`)
- Preloaded runner that tests the 10 canonical test queries against the engine.
- Displays accuracy score, constraint extraction rate, and zero-violation guarantee.

---

## 8. Phase 6: Polish, Verification & Acceptance Testing

- [ ] Zero build warnings or runtime exceptions in console.
- [ ] Responsive across desktop, tablet, and mobile layouts.
- [ ] 100% hard constraint compliance verified across all test queries.
- [ ] Fallback relaxation operates cleanly when zero exact matches exist.
- [ ] Gemini API key configuration easily accessible via UI with seamless offline fallback.
