# Agentic AI Weekend by AgentX — marketing site

Static, dependency-free marketing site for **Agentic AI Weekend by AgentX**, an in-person beginner AI intensive taught by Adam Behrman in Tenafly, New Jersey, September 18–20, 2026.

The site is designed to deploy from a GitHub Pages **project** site at the canonical URL:

```
https://abehrman.github.io/agentic-ai-weekend/
```

No framework, no build step, no analytics, no trackers, no cookies, no lead forms.

## Files

| File | Purpose |
|---|---|
| `index.html` | The complete page, authored as a fully legible static state. |
| `styles.css` | All styling. Locked design tokens, mobile-first, editorial grid. |
| `script.js` | Progressive enhancement only (see below). |
| `404.html` | Branded not-found page (uses repo-absolute asset paths). |
| `favicon.svg` | Flat `AgentX` monogram mark (no seal/ring). |
| `og-image.png` | 1200×630 social preview card. |
| `og.html` | Source used to render `og-image.png` (not linked by the site). |
| `robots.txt`, `sitemap.xml` | Crawl + indexing metadata (absolute canonical URLs). |
| `.nojekyll` | Disables Jekyll processing on GitHub Pages. |
| `tests/` | Node validator + Playwright browser QA (see Testing). |

## Preview locally

Any static file server works. For example:

```bash
python3 -m http.server 8765
# open http://127.0.0.1:8765/
```

Because GitHub Pages serves this project under `/agentic-ai-weekend/`, the page links **local** assets with **relative** paths (so they resolve at any base), while canonical / Open Graph / sitemap / structured-data URLs are **absolute** (`https://abehrman.github.io/agentic-ai-weekend/…`), as scrapers and canonical tags require.

## Deployment (handled separately)

This repository is intended to be published with GitHub Pages set to serve from the repository root of the default branch. `.nojekyll` is present so files are served as-is. No deployment is performed by this build.

## Progressive enhancement

The HTML is the whole story. `script.js` never gates comprehension — it only adds:

1. **Tuition current-window marker.** Adds a neutral "Current window" tag to whichever of the three always-visible tuition windows applies today, computed against the real deadlines **in America/New_York** (`windowFor()` compares ISO `YYYY-MM-DD` strings; boundaries are inclusive of Aug 15 and Sep 5). This is deliberately **decoupled from `prefers-reduced-motion`** — reduced-motion users lose motion, not facts. With JavaScript disabled, all three windows show with **no** marker.
2. **The two-lane walkthrough.** With motion allowed, the five steps (Goal, Plan, Tools, Evidence, Approval) become an interactive single-active animation with a deterministic first state, Replay, a Pause/Play toggle, five keyboard-operable step buttons (`aria-current`), an honest status line that never claims "Playing" while off-screen or tab-hidden, and off-screen / tab-hidden pausing via `IntersectionObserver`. Under `prefers-reduced-motion: reduce` **or** no JavaScript, it stays a static numbered strip showing **all five steps and the human-approval boundary** — not just the end state.
3. Mobile nav disclosure, a header that becomes sticky only after the hero exits, and a sticky mobile CTA that appears only after the hero CTA scrolls off and disappears before the tuition section (never beside a live price).

## Design decisions worth noting

- **Fonts are system stacks, by design.** The direction specifies Newsreader + Inter with `Georgia, Cambria, "Times New Roman", serif` and `system-ui, …, sans-serif` fallbacks. Reliable local subsetting was unavailable and loading webfonts at runtime would violate the "self-hosted / no remote assets" constraint, so the site ships on the specified fallback stacks: zero network, zero font-swap layout shift, genuinely fast. Swapping in self-hosted subset WOFF2 later is a drop-in `@font-face` addition.
- **One contrast token was darkened.** The direction mandates verifying every color pairing and sets a ≥7:1 target for `--ink-muted` on `--paper`. The provisional `#5A554B` measures ≈6.7:1, under target, so `--ink-muted` is `#514C42` (≈7.6:1). All other locked hexes verified as-is. See `tests/contrast.mjs`.
- **Green semantics.** A single deep green (`--green #1B4332`) means human-confirmed forward motion. Per the token rule, solid full-weight green fill is used **only** on the primary "Request your seat" CTA; every other green (approval lanes, verified panels, diagram zones, markers) uses the pale `--green-wash` tint or `--green-ink` outlines/labels so the CTA always wins the hierarchy.
- **Amber** (`--amber`) is a large, non-text value marker only; every saving it flags is spelled out in ink (`Save $750`, `Save $400`).
- **Honesty guardrails.** The CTA opens an email; microcopy states no payment is taken on the site and that requesting a seat neither reserves a seat nor locks a price. No countdowns, seat counts, testimonials, ratings, university marks, or invented data. The structured data (`Course`) carries the three real offers and **no** `aggregateRating`/`review`.

## Testing

The automated suite is pure Node, no dependencies to install:

```bash
node tests/run.mjs          # runs all three groups below
# or individually:
node tests/validate.mjs     # locked facts, forbidden inflations, structure, glyphs, files
node tests/contrast.mjs     # WCAG contrast for every locked token pairing
node --test tests/window.test.mjs   # windowFor() boundary flips, no system clock
```

`tests/validate.mjs` checks that every locked fact from the brief is present and exact, that forbidden inflations and trackers are absent, that the truthful non-affiliation disclaimer is present, that there is a single `<h1>`, that no section-symbol or arrow glyphs appear in the user-facing files, that local assets use relative paths while canonical/OG/structured-data URLs are absolute, and that all required files exist. `tests/contrast.mjs` computes WCAG contrast for each locked pairing against its threshold. `tests/window.test.mjs` verifies the tuition boundary flips at the right dates (Aug 15/16 and Sep 5/6) without touching the system clock.

Browser QA was performed with Playwright (Chromium) against a local server: console cleanliness, no horizontal overflow at 375 / 414 / 1440 px, the deterministic first animation state and honest play/pause status, keyboard operation of the step controls, the reduced-motion static strip, the tuition current-window marker across simulated dates, and the sticky mobile CTA timing. Re-run it by serving the folder (`python3 -m http.server 8765`) and driving `http://127.0.0.1:8765/` in any browser.
