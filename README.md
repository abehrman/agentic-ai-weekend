# Agentic AI Weekend by AgentX — marketing site

Static, dependency-free marketing site for **Agentic AI Weekend by AgentX**, an in-person beginner AI intensive taught by Adam Behrman in Tenafly, New Jersey, September 18–20, 2026.

The production direction is **The Clearance Bench**: one continuous, human-scaled teaching workshop where a real mission moves along a bench through visible setup, bounded tools, inspection, correction, memory approval, and a final human-operated release. The page is a spatial walk (threshold, briefing bay, clearance rail, three connected rooms, take-home rack, instructor station, tuition rail, arrival wall, exit gate) — not a stack of content cards.

The site is designed to deploy from a GitHub Pages **project** site at the canonical URL:

```
https://abehrman.github.io/agentic-ai-weekend/
```

No framework, no build step, no analytics, no trackers, no cookies, no lead forms, no runtime web-font requests.

## Files

| File | Purpose |
|---|---|
| `index.html` | The complete page, authored as a fully legible static state. |
| `styles.css` | All styling. Locked dark-workshop tokens, mobile-first, continuous-bench layout. |
| `script.js` | Progressive enhancement only (see below). |
| `404.html` | Branded not-found page (uses repo-absolute asset paths). |
| `favicon.svg` | Flat `AgentX` monogram on the dark floor color. |
| `favicon.ico` | Two-frame ICO (32×32 + 64×64 PNG frames) rendered from `favicon.svg` with headless Chrome + a Node stdlib ICO packer. |
| `apple-touch-icon.png` | 180×180 raster touch icon rendered from the same `favicon.svg`. |
| `og-image.png` | 1200×630 social preview card. |
| `og.html` | Source used to render `og-image.png` (not linked by the site). |
| `robots.txt`, `sitemap.xml` | Crawl + indexing metadata (absolute canonical URLs). |
| `.nojekyll` | Disables Jekyll processing on GitHub Pages. |
| `tests/` | Node validators + a browser-QA workflow (see Testing). |

## Preview locally

Any static file server works. For example:

```bash
python3 -m http.server 8777
# open http://127.0.0.1:8777/
```

Because GitHub Pages serves this project under `/agentic-ai-weekend/`, the page links **local** assets with **relative** paths (so they resolve at any base), while canonical / Open Graph / sitemap / structured-data URLs are **absolute** (`https://abehrman.github.io/agentic-ai-weekend/…`), as scrapers and canonical tags require.

## Deployment (handled separately)

This repository is intended to be published with GitHub Pages set to serve from the repository root of the default branch. `.nojekyll` is present so files are served as-is. No deployment is performed by this build.

## Progressive enhancement

The HTML is the whole story. `script.js` never gates comprehension — it only adds:

1. **Tuition current-window marker.** Reveals a "Current payment window" tag on whichever of the three always-visible tuition windows applies today, computed against the real deadlines **in America/New_York** (`windowFor()` compares ISO `YYYY-MM-DD` strings; boundaries are inclusive of Aug 15 and Sep 5). This is deliberately **decoupled from `prefers-reduced-motion`** — reduced-motion users lose motion, not facts. With JavaScript disabled, all three windows show with **no** marker.
2. **The human-operated clearance rail.** The signature interaction. A mission carrier advances **one station per activation** of a single **Advance the work** control — it never autoplays and never advances because time passed, the page scrolled, or the tab changed. The five stations are *Clamp the brief, Read the route, Seat approved tools, Inspect and correct, Review and release*. On the fifth station the control relabels to **Review and release**; that activation performs the release (carrier reaches the output tray, gate lifts) and only then does **Reset the bench** appear. Numbered station buttons give direct, keyboard-operable access and update `aria-current`; an `aria-live="polite"` status stays in sync, and selecting a station **after release clears the released state and lowers the gate** so nothing desyncs. Desktop uses a horizontal bench (carrier travels the x-axis); below 640px an additive **vertical** bench fixture takes over (carrier travels the y-axis), each with a distinct post-release output-tray stop. Under `prefers-reduced-motion: reduce` the carrier and gate **still reflect the current state but snap instantly** — CSS disables the transition, so the fixture never contradicts the text. With no JavaScript, the complete five-station `<ol>` and every explanation remain in the DOM.
3. **FAQ breakpoint defaults.** Every FAQ answer is authored **open** in the HTML, so the whole Q&A reads with no JavaScript at every width. `setupFaq()` only sets the default open state per breakpoint and re-applies it when the 900px line is actually crossed: on desktop (`min-width: 900px`) all six stay open for an at-a-glance scan; below it, the first is open and the other five collapse. Summaries stay fully mouse- and keyboard-operable at every width (no `pointer-events` suppression). The page carries **five** in-flow "Request your seat" CTAs (hero, tuition, final button, final email, footer) and **no fixed or sticky enrollment bar**, so no overlay can ever obscure the clearance stations, the Sunday schedule, or any weekend copy.

## Design decisions worth noting

- **Dark workshop palette.** Floor `#111619`, bench `#28312F`, chalk `#F4F1E8`, zinc `#B9C2BE`, signal orange `#E85D36` (human-required action, CTA, focus), daylight blue `#7FA7B8` (admitted / checked information), deep ink `#111619` on orange and blue controls. Orange never means ambient "AI energy" — it means a human action is required.
- **Fonts are system stacks, by design.** The direction specifies Archivo SemiCondensed + Atkinson Hyperlegible Next. No licensed local subsets were available and loading webfonts at runtime would violate the zero-network constraint, so the site ships on a condensed, blunt display fallback stack and a highly legible system-sans body stack: zero network, zero font-swap layout shift. Swapping in self-hosted subset WOFF2 later is a drop-in `@font-face` addition.
- **Continuous bench, not cards.** Content attaches to a single centered bench plane with a zinc rail spine, engraved scene markers, pegs, notches, and door-jamb dividers. Depth comes from the floor/bench split, overlap, and restrained shadow — not bordered rounded boxes.
- **Truthful schedule geometry.** On desktop the three schedule rooms take widths proportional to the **3 / 8 / 8** on-site hours; both 90-minute lunches are printed and the copy states **16 live instructional hours across 19 hours on site**, so 19 can never be misread as teaching hours. On mobile the rooms stack with content-driven heights.
- **Honesty guardrails.** Every CTA opens the same pre-addressed email; microcopy states no payment is taken on the site and that requesting a seat neither reserves a seat nor locks a price. No countdowns, seat counts, testimonials, ratings, university marks, or invented data. The structured data (`Course`) carries the three real offers with **no** `aggregateRating`/`review` and **no unsupported `availability` claim**; each future window carries a machine-readable `validFrom` (`2026-08-16`, `2026-09-06`) so the offer windows never overlap. The instructor section keeps the truthful non-affiliation disclaimer.

## Testing

The automated suite is pure Node, no dependencies to install:

```bash
node tests/run.mjs          # runs all four groups below
# or individually:
node tests/validate.mjs     # locked facts, forbidden inflations, structure, palette, glyphs, files
node tests/clearance.mjs    # the five-station path + no-autoplay state-machine contract
node tests/contrast.mjs     # WCAG contrast for every locked dark-token pairing
node --test tests/window.test.mjs   # windowFor() boundary flips, no system clock
```

`tests/validate.mjs` checks that every locked fact from the brief is present and exact, that the selected hero copy and Clearance Bench vocabulary are present, that both 90-minute lunches and the 3/8/8 on-site hours are printed, that the dark palette is actually wired into CSS (and the old ivory/forest tokens are gone), that inline SVG fixtures are decorative (`aria-hidden`, no essential SVG text), that forbidden inflations, payment-implication wording, and trackers are absent, that there is a single `<h1>`, that no section-symbol or arrow glyphs appear, that local assets use relative paths while canonical/OG/structured-data URLs are absolute, and that all required files exist. `tests/clearance.mjs` fixes the interaction contract: five stations in DOM order with real explanations, the advance/reset/numbered controls, a polite live region, and a `script.js` with no `setInterval`/`setTimeout` autoplay and no state change on `visibilitychange`. `tests/contrast.mjs` computes WCAG contrast for each locked pairing. `tests/window.test.mjs` verifies the tuition boundary flips at the right dates (Aug 15/16 and Sep 5/6) without touching the system clock.

Browser QA was performed with Playwright (Chromium) against a local server: console cleanliness; no horizontal overflow at 375 / 414 / 1440 px; every visible button, summary, wordmark, and standalone email link measured at 44px minimum; the full clearance flow (advance labels 1–4, the flip to *Review and release* at station 5, then a release that **moves the carrier across the stop bar into the output tray** — a position distinct from the pre-gate station-5 stop) and direct keyboard station control, including **post-release direct selection clearing the released state**; a comparison proving the **desktop carrier travels the x-axis and the mobile carrier the y-axis**, with both releases distinct; the tuition current-window marker in Eastern Time; the **absence of any fixed or sticky enrollment bar** (zero visible fixed elements, and no fixed element intersecting rendered text, across the briefing, clearance, weekend, tuition, and FAQ scenes at 375 / 414 / 720 / 768 / 900 / 1024 / 1440 px); the FAQ (six answers open on desktop, one on mobile, all six open with no JavaScript, summaries mouse- and keyboard-operable at every width); the reduced-motion path (carrier and gate reflect state instantly with transitions disabled); the no-JavaScript path (complete semantic DOM, controls and marker hidden); `forced-colors: active`; and the chalk-outer / orange-inner keyboard focus ring. Re-run it by serving the folder (`python3 -m http.server 8777`) and driving `http://127.0.0.1:8777/` in any browser.
