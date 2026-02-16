# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Quadrantology is a personality test and card game website served at **quadrantology.com**. It models organizational creative destruction through 6 archetypes in two groups: Exit (Hacker, Contrarian, Legalist) and Voice (Investigator, Holy Warrior, Operator), mapped onto a master 2×2 framework called "Death and Taxes" with 13 sub-models.

The website is the primary active component. The personality test is implemented as a static JS webapp with local storage. Plans exist for Stripe payments and trend tracking.

## Repository Structure

- **`docs/`** — Live website (GitHub Pages, custom domain `quadrantology.com`). Static HTML/CSS/JS, no build system.
  - `index.html` — Home: hero + CTA + archetype card grid
  - `test.html` — 28-question A/B test with progress bar, animated score bars, archetype icon on results
  - `theory.html` — Full model exposition
  - `understand.html` — Understanding Your Results: 13 models as 2×2 grids, scoring, transitions/emotions, self-actualization
  - `shop.html` — Card deck shop with playtesting photos + print-at-home downloads
  - `game.html` — How to Play (stub)
  - 6 archetype pages: `hacker.html`, `contrarian.html`, `legalist.html`, `investigator.html`, `holywarrior.html`, `operator.html`
  - `quadrantology.css` — Full shared stylesheet with custom properties
  - `data/` — Test question and answer weight data (JSON)
  - `images/` — Site images and card print sheets
- **`assets/`** — Source/master files
  - `deck/` — Card deck masters (character art, logos, card formats, PSD masters)
  - `booklet/` — Booklet page PNGs and cover
  - `twoTriangles.svg` — Canonical editable two-triangles diagram
  - `resultsExplainer.pdf` — Master slide deck (PDF) for the 13-model results explainer, source for `understand.html`
- **`history/`** — Archived materials with `README.md`
  - `docs/` — Archived PDFs and superseded materials
  - `qtest/` — Legacy Matlab scoring scripts (Exosphere workshop)
  - `typeform/` — Legacy Typeform batch processing + pilot data

## Development

No build tools, package manager, or test framework. Plain HTML/CSS/JS served via GitHub Pages from `docs/`.

Preview locally:
```
python3 -m http.server -d docs
```

## Architecture Notes

- All pages share `quadrantology.css` and the same nav structure (CSS-only hamburger menu, checkbox trick)
- System font stack, no external dependencies
- Nav: The Test | The Theory | Shop | How to Play | Archetypes (dropdown with Exit/Voice groups)
- Color scheme: bg `#f4f1eb`, card `#ffffff`, text `#2c2c2c`, accent `#c0713a`, exit `#3a7a8c` (teal), voice `#8c3a3a` (deep red)
- The test in `test.html` is pure client-side JS with local scoring
- Answer weights are in `docs/data/` (JSON) and historically in `history/typeform/qtest/data/` (.mat, .txt)
- `understand.html` uses `.model-grid` / `.model-card` / `.model-table` CSS classes for the 2×2 model grids
