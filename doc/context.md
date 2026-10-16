# AI Feature Rebuild: Natural-Language Food Discovery — Product Context

> **A focused AI feature rebuild transforming complex, multi-constraint Indian dining discovery into an intuitive, explainable, natural-language search experience with Indian Rupee (₹) pricing and Pure Veg / Jain / Halal dietary integrity.**

---

## 1. Executive Summary & Product Context

Modern food discovery platforms in India (e.g., Zomato, Swiggy) are architected around restaurant listings and multi-tier filter menus. However, real-world Indian dining decisions are defined by an interconnected web of strict constraints:
- **Budget caps in Rupees:** *"Under ₹300 total"* or *"₹150 for breakfast"*.
- **Strict cultural & religious diets:** *"Pure Veg (Shakahari)"*, *"Jain (strictly no onion, no garlic, no root vegetables)"*, *"100% Halal"*, *"Gluten-Free (no maida)"*.
- **Group dynamics & family handis:** *"Family biryani feast for 4 under ₹1000"*.
- **Delivery velocity:** *"Ready in under 25 minutes"*.
- **Sensory & regional cravings:** *"Spicy Hyderabadi dum biryani"*, *"Crispy ghee roast dosa"*, *"North Indian paneer butter masala"*.

When juggling multiple constraints, users face endless friction tapping 8+ filter menus only to find that recommended restaurants fail at the individual dish level (e.g. non-veg gravies cooked in the same oil, or dairy cream added to a dairy-free order).

**IntentBite AI** rebuilds this search experience from first principles:
1. Allows users to articulate their full meal intent in one natural Hindi/English sentence.
2. Extracts and classifies constraints into **Hard (Mandatory)** and **Soft (Preference)** parameters.
3. Enforces **100% hard constraint compliance** (never showing non-veg to a pure veg diner or exceeding the ₹ budget cap).
4. Provides transparent **"Why This Matched"** verification badges on every dish card.
5. Displays interactive **Constraint Chips** with one-click edits and removals.
6. Features a live **Before-vs-After Workflow Benchmark Simulator** proving an **85% reduction in interaction friction**.

---

## 2. Target Users & Personas

| Persona | Needs & Context | Key Constraints | Pain Points with Existing Apps |
| :--- | :--- | :--- | :--- |
| **Rohit — The Desk Worker (Bengaluru)** | Quick weekday lunch between client calls. | Budget $\le ₹250$, Delivery $< 25$ mins, High-Protein / Healthy. | Spends 15 mins scrolling; orders late or over-budget. |
| **Pooja — The Pure Veg / Jain Diner (Mumbai)** | Strict Jain / Shakahari diner. | Zero onion, zero garlic, pure vegetarian preparation. | Misleading restaurant-level tags; dishes arrive non-compliant. |
| **Ananya — The Biryani Craver (Hyderabad)** | Craving authentic dum biryani on a Friday evening. | Budget $\le ₹350$, 100% Halal, spicy / teekha. | Generic filters don't distinguish authentic dum from fried rice. |
| **Vikram — The Family Dinner Host (Delhi NCR)** | Ordering Sunday family feast for 4 people. | Total budget $\le ₹1000$, jumbo handi portion, North Indian. | Mental math calculating individual portions across 5 menus. |

---

## 3. Product Decisions & Trade-Offs

| Decision Area | Chosen Approach | Rationale |
| :--- | :--- | :--- |
| **Currency** | **Indian Rupee (₹ / INR)** | Matches Indian dining and food delivery market. |
| **Hard vs Soft Constraints** | Budget in ₹, Pure Veg, Jain, and Allergens are **Hard**; delivery time and cravings are **Soft**. | A Pure Veg or Jain customer cannot consume meat or onion/garlic; budget limits are non-negotiable. |
| **Dietary Representation** | Authentic Indian Veg (green dot) and Non-Veg (red dot) indicators. | Recognizable standard established by FSSAI for Indian consumers. |
| **AI Fallback** | Dual-Engine: Google Gemini API + Local Indian Deterministic NLP Parser. | Zero downtime or latency failure even if API keys or networks fail. |
