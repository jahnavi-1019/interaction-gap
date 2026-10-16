# ⚡ InteractionGap — Privacy-Conscious UX Friction & Playwright Test Generator

> Part of the **Antigravity 20-Project Systems Engineering Portfolio**

InteractionGap captures zero PII, zero keystrokes, and zero video recordings. Instead, it processes purely abstract client-side event streams to detect rage clicks, dead clicks, and accessibility defects, and automatically outputs executable TypeScript Playwright regression test suites.

---

## 🏗️ Architecture

```
Client Telemetry Stream (Clicks, Focus, ARIA, Mutations)
                          │
                          ▼
┌──────────────────────────────────────────────────┐
│                 FrictionDetector                 │
├──────────────────────────────────────────────────┤
│ 1. Rage Click Clustering (>= 3 clicks / 1000ms)  │
│ 2. Dead Click Recognition (Static Affordances)   │
│ 3. A11y Label Auditing (Screen-Reader Fallbacks) │
└──────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────┐
│               PlaywrightGenerator                │ ──> Synthesizes Executable E2E Tests
└──────────────────────────────────────────────────┘
                          │
                          ▼
Interactive Usability Studio (ui/index.html)
```

---

## 🚀 Quick Start

### 1. Run Tests
```bash
npm test
```

### 2. Launch Individual UI Dashboard
```bash
npm run ui
```
Opens the UX friction and test generation console at `http://localhost:4004`.
