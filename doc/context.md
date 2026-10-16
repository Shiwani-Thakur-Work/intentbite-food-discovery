# AI Feature Rebuild: Natural-Language Food Discovery — Product Context

> **A focused AI feature rebuild transforming complex, multi-constraint food discovery into an intuitive, explainable, natural-language search experience.**

---

## 1. Executive Summary & Product Context

Modern food discovery platforms (e.g., DoorDash, Uber Eats, Deliveroo, Zomato) are architected around rigid, siloed browsing hierarchies: restaurant brands, broad cuisine categories, and multi-tier filter dropdowns. 

However, real-world dining decisions rarely begin with a restaurant brand. Instead, users start with an interconnected bundle of real-time constraints:
- **Budget caps:** *"Under $20 total"* or *"$12 per person"*.
- **Strict dietary restrictions & allergens:** *"Gluten-free, dairy-free, strictly vegan, or halal"*.
- **Group dynamics & portioning:** *"Office lunch for 4 people to share"*.
- **Time/Delivery velocity:** *"Ready in under 25 minutes"*.
- **Specific sensory cravings & meal context:** *"High-protein post-workout bowl with spicy crunch"*.

When faced with multiple simultaneous constraints, conventional interfaces force users to endure a disjointed multi-step filtering flow, jumping across multiple menus, only to find that recommended dishes violate one of their mandatory restrictions.

**Natural-Language Food Discovery** rebuilds this search experience from first principles:
1. Allows users to articulate all their constraints and desires in a single natural sentence.
2. Accurately extracts and classifies constraints into **Hard (Mandatory)** and **Soft (Preference)** parameters.
3. Matches and ranks curated food items and restaurants against explicit criteria.
4. Provides a transparent, inspectable **"Why This Matched"** explanation for every recommendation.
5. Gives users immediate, one-click interactive chips to correct or tweak misunderstood parameters.
6. Delivers intelligent fallback suggestions when constraints conflict or produce zero exact matches.

---

## 2. Problem Statement & Friction Analysis

### The Problem
Users with multi-attribute dining constraints must navigate an average of 6 to 9 clicks across multiple filter modals (Price $\rightarrow$ Dietary $\rightarrow$ Rating $\rightarrow$ Delivery Time $\rightarrow$ Cuisine). Despite this manual effort:
- Conventional filters operate at the *restaurant level*, often failing at the *dish level* (e.g., marking a steakhouse as "has vegan options" when only a side salad qualifies).
- Soft cravings (e.g., "comfort food", "healthy high protein", "crispy") cannot be expressed through boolean checkboxes.
- When no restaurant matches all filters, apps present empty states ("No results found") without suggesting actionable compromises.

### The Opportunity
Reduce user interaction time by $>60\%$ and eliminate false positives by translating unstructured user intent into structured, verified constraint queries, while preserving full user agency through inspectable, editable query chips.

---

## 3. Target Users & Personas

| Persona | Needs & Context | Key Constraints | Pain Points with Existing Apps |
| :--- | :--- | :--- | :--- |
| **Alex — The Busy Tech Worker** | Quick weekday desk lunch between back-to-back meetings. | Budget $\le \$18$, Delivery $< 25$ mins, Healthy / High-protein. | Spends 15 mins scrolling; orders late or over-budget. |
| **Maya — The Allergy & Dietary Diner** | Celiac (strict gluten-free) & vegetarian. | Zero gluten contamination, 100% vegetarian, clear ingredients. | Misleading restaurant-level tags; food arrives non-compliant. |
| **David — The Group Lunch Lead** | Ordering lunch for a project team of 5 people with mixed diets. | Total budget $\le \$75$, includes vegan & halal items, family-style sharing. | Mental math calculating per-person cost; combining multiple orders. |
| **Jordan — The Late-Night Craver** | Seeking comforting, spicy food after hours on a budget. | Budget $\le \$15$, open late, high spice level, savory/comfort. | Filters don't capture subjective cravings ("greasy cheesy goodness"). |

---

## 4. Jobs To Be Done (JTBD) Framework

> **When** I have multiple competing constraints for a meal (budget, diet, speed, craving),  
> **I want to** state my exact situation in plain language without manually setting 8 different filters,  
> **So that** I can instantly see verified meals that respect my hard boundaries and satisfy my craving without wasted effort or surprise violations.

---

## 5. Core Product Hypotheses

1. **Efficiency Hypothesis:** Stating multi-constraint requirements in a single natural-language sentence will reduce meal discovery interaction time from $\approx 3.5$ minutes to under 30 seconds.
2. **Trust & Transparency Hypothesis:** Showing an explicit "Why This Matched" breakdown (highlighting budget compliance, dietary verification, and speed) will increase result acceptance rate by $\ge 40\%$ compared to black-box recommendation carousels.
3. **Agency & Correction Hypothesis:** Providing interactive constraint chips that visualize the AI's parsed interpretation and allow 1-click edits will reduce abandoned searches by $\ge 70\%$ when the AI slightly misinterprets a nuance.

---

## 6. Proposed MVP Scope

### In-Scope Features
1. **Natural-Language Search Bar:** Multi-attribute query box with sample prompt suggestions for common dining scenarios.
2. **AI & Deterministic Constraint Extraction:**
   - Budget detection (absolute max, per-person, price tiers).
   - Dietary restrictions (Vegan, Vegetarian, Gluten-Free, Halal, Dairy-Free, Nut-Free, Keto).
   - Cuisine & meal categories (Mexican, Thai, Indian, Italian, Healthy Bowls, Burgers, etc.).
   - Operational constraints (Delivery speed $<30$ min, group size $>1$, spice level).
   - Sensory/Cravings tags (Spicy, Comfort, Crispy, Light, High Protein).
3. **Curated Food & Restaurant Dataset:** Rich local database containing 50+ diverse dishes across 16 authentic restaurants with exact pricing, verified dietary flags, allergen notices, prep times, and tags.
4. **Transparent Matching & Ranking Engine:**
   - Strict hard-filter gating (never show items that exceed budget or violate strict allergens).
   - Multi-factor scoring for soft preferences.
   - Distinct badges showing 100% Match vs Partial Match.
5. **Interactive Correction Chips:**
   - Real-time visual display of parsed constraints (e.g., `[Max: $20]`, `[Diet: Vegan]`, `[Speed: <30m]`).
   - Click to edit, delete, or toggle hard vs soft constraint mode.
6. **Smart Fallback & Partial Match Resolver:**
   - Explains precisely which constraint caused a bottleneck (e.g., *"No gluten-free sushi under $15 found within 20 mins; here are options under $18 or within 30 mins"*).
7. **"Before vs After" Workflow Benchmark Simulator:**
   - Interactive toggle comparing conventional multi-click filter UI (8+ dropdowns) with 1-step natural-language search, tracking clicks and satisfaction metrics live.

---

## 7. Product Decisions & Trade-Offs

| Decision Area | Chosen Approach | Rationale |
| :--- | :--- | :--- |
| **Hard vs Soft Constraints** | Budget and Allergens/Diets are **Hard** by default; delivery time and cravings are **Soft**. | A vegan cannot eat meat; a customer with $20 cannot spend $35. Violating hard constraints destroys trust permanently. |
| **Conflict Resolution** | Return nearest partial matches with explicit disclosure of trade-offs. | A blank "0 Results" screen causes immediate user bounce. Highlighting trade-offs preserves user control. |
| **Parsing Engine Fallback** | Hybrid dual-engine: Google Gemini API with instant client-side rule-based NLP fallback. | Zero downtime or latency failure if offline, rate-limited, or API key not present, while leveraging LLM nuance when available. |
| **Correction Experience** | Visual inline editable chips above results. | Prevents users from having to re-type full prompts when only one parameter was off (e.g., changing $15 to $20). |
| **Verified vs Generated Data** | Dish names, prices, allergens, and restaurants are strictly pulled from verified structured data. AI only generates the search translation and match explanation. | Prevents hallucinations of non-existent menu items or dangerous false allergen claims. |

---

## 8. Success Metrics & KPIs

```
                                      ┌────────────────────────────────┐
                                      │ Natural Language Food Search   │
                                      └──────────────┬─────────────────┘
                                                     │
           ┌─────────────────────────────────────────┼────────────────────────────────────────┐
           ▼                                         ▼                                        ▼
┌──────────────────────┐                  ┌──────────────────────┐                 ┌──────────────────────┐
│  Accuracy & Trust    │                  │ Velocity & Effort    │                 │ Conversion & Agency  │
├──────────────────────┤                  ├──────────────────────┤                 ├──────────────────────┤
│ • Interpretation:    │                  │ • Search Time:       │                 │ • 1st Result Accept: │
│   ≥ 92% accurate     │                  │   < 30 sec (vs 210s) │                 │   ≥ 65%              │
│ • Hard Constraint    │                  │ • Clicks to Match:   │                 │ • Chip Edit Rate:    │
│   Compliance: 100%   │                  │   1-2 (vs 8-12)      │                 │   Smooth refinement  │
└──────────────────────┘                  └──────────────────────┘                 └──────────────────────┘
```

---

## 9. Validation Plan & Baseline Comparison

1. **Benchmark Test Suite:**
   - Define 10 canonical complex user queries (e.g., *"Healthy vegan lunch under $18 ready in 25 mins"*, *"Family dinner for 4 under $60 with nut allergy"*).
2. **Conventional Filter Baseline:**
   - Track number of clicks, filter adjustments, and cognitive load required to find a matching dish.
3. **AI Search Measurement:**
   - Measure constraint extraction fidelity, ranking precision, and time-to-decision.
4. **Failure Rate Audit:**
   - Log any misclassifications (e.g., confusing "spicy" with a cuisine name) to continuously refine the prompt and parser rules.

---

## 10. Out of Scope

- Real-time GPS driver tracking and delivery fleet routing.
- Payment gateway processing (Stripe / Apple Pay checkout).
- Live POS integrations with third-party restaurant chains.
- Profile-based behavioral tracking or invasive ad targeting.

---

## 11. PM Portfolio Case Study Readiness

- [x] Target user personas & problem friction documented
- [x] Core product hypotheses & value metrics defined
- [x] Hard vs soft constraint decision matrix established
- [x] MVP functional scope & non-goals bounded
- [x] Before-and-after benchmark comparison workflow designed
- [x] Evaluation test query matrix established
