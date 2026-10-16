# IntentBite AI — Natural-Language Indian Food Discovery (Feature Rebuild)

> **A focused AI feature rebuild transforming complex, multi-constraint Indian dining discovery into an intuitive, explainable, natural-language search experience with Indian Rupee (₹) pricing and 100% Pure Veg / Jain / Halal compliance.**

---

## 🌟 Overview

Conventional food delivery apps (Swiggy, Zomato) force users through 8 to 12 fragmented filters (price tiers, Pure Veg toggles, delivery radius, ratings) only to land on restaurants whose individual dishes still violate their constraints.

**IntentBite AI** rebuilds this experience from first principles:
- Users express their full meal intent in one natural sentence (e.g. *"Pure veg paneer butter masala under ₹300 ready in 30 mins"* or *"Spicy Hyderabadi chicken dum biryani under ₹350"*).
- Extracts and categorizes constraints into **Hard (Mandatory)** and **Soft (Preference)** parameters.
- Standardized in **Indian Rupees (₹)** with authentic Indian dietary models: **Pure Veg (Shakahari)**, **Jain Certified (No Onion, No Garlic)**, **100% Halal**, and **Gluten-Free (No Maida)**.
- Displays iconic Indian **Pure Veg (green dot)** and **Non-Veg (red dot)** indicators on every card.
- Displays transparent **"Why This Matched"** verification badges showing exact ₹ savings and dietary certifications.
- Includes a live **Before-vs-After Workflow Benchmark Simulator** proving an **85% reduction in friction**.

---

## 🚀 Live Demo & Deployment

- **Live Deployed App (GitHub Pages):**  
  [https://shiwani-thakur-work.github.io/intentbite-food-discovery/](https://shiwani-thakur-work.github.io/intentbite-food-discovery/)

- **GitHub Repository:**  
  [https://github.com/Shiwani-Thakur-Work/intentbite-food-discovery](https://github.com/Shiwani-Thakur-Work/intentbite-food-discovery)

---

## 🏗️ Architecture & Dual-Engine NLU

1. **Google Gemini 1.5 Flash:** Cloud LLM extraction using structured JSON mode for nuanced conversational Indian queries.
2. **Deterministic Indian Local NLU Parser:** Built-in regex and regional lexicon extractor providing **100% offline functionality, zero-latency parsing (<5ms)**, and an automatic fail-safe if no API key is provided.

Detailed technical architecture and product specifications:
- [Product Context Document](doc/context.md)
- [System Architecture Document](doc/architecture.md)
- [Phased Implementation Plan](doc/implementation_plan.md)

---

## 📊 Evaluation & Verification

Run the automated ground-truth evaluation suite on canonical Indian test queries:
```bash
node test_eval.js
```
- **100% Hard Constraint Compliance** verified across all test queries in Rupees (₹).
- **Zero false positive allergens** guaranteed.
- **85% reduction** in interaction steps compared to conventional filter flows.
