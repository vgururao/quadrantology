# Quadrantology

A personality test and card game based on a social physics model of organizational creative destruction. Six archetypes in two groups — Exit (Hacker, Contrarian, Legalist) and Voice (Investigator, Holy Warrior, Operator) — mapped onto a master 2×2 framework called "Death and Taxes."

**Live site:** [quadrantology.com](https://quadrantology.com)

## Repository Structure

- **`docs/`** — Live website (GitHub Pages, custom domain). Static HTML/CSS/JS, no build system.
  - `index.html` — Home page with hero + archetype card grid
  - `test.html` — 28-question A/B personality test with progress bar and animated score bars
  - `theory.html` — Full model exposition
  - `understand.html` — Understanding Your Results guide (13 models, scoring, transitions, self-actualization)
  - `shop.html` — Card deck shop page with print-at-home downloads
  - `game.html` — How to Play (stub)
  - 6 archetype profile pages: `hacker.html`, `contrarian.html`, `legalist.html`, `investigator.html`, `holywarrior.html`, `operator.html`
  - `quadrantology.css` — Shared stylesheet
  - `data/` — Test question and answer weight data (JSON)
  - `images/` — Site images and card print sheets
- **`assets/`** — Source/master files
  - `deck/` — Card deck masters (character art, logos, card formats, PSD masters)
  - `booklet/` — Booklet page PNGs and cover
  - `twoTriangles.svg` — Canonical editable two-triangles diagram
  - `resultsExplainer.pdf` — Master slide deck (PDF) for the 13-model results explainer
- **`history/`** — Archived materials (see `history/README.md`)
  - `docs/` — Archived PDFs and superseded materials
  - `qtest/` — Legacy Matlab scoring scripts (from paper-based Exosphere workshop)
  - `typeform/` — Legacy Typeform batch processing scripts + pilot data

## Development

No build tools, package manager, or test framework. Plain HTML/CSS/JS served via GitHub Pages from `docs/`.

Preview locally:
```
python3 -m http.server -d docs
```

## Design Goals

- The test is designed to be taken in full initially, then repeated to create trends
- 28 questions from which the test samples to compute scores using answer weights
- Results present customized comments on top of default archetype profiles
- Phase 1 (current): static + JavaScript only, no persistent user data, local storage of results
- Planned: Stripe payment flow to reveal results, hidden during beta
- Planned: cookie/local storage for returning users to compare old results

## Future Goals

- Feed static profiles + personalized results to user's LLM for introspective conversation
- Opt-in anonymized aggregate trend data
- Crypto-wallet payment flows
- Third-party identity management (OAuth, Google, etc.)
- Enterprise edition with group codes for corporate clients
