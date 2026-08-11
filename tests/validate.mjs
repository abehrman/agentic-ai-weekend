// Static validator for The Clearance Bench production site. Confirms locked
// facts are present and exact, forbidden inflations are absent, the dark
// workshop palette is actually wired into CSS, structural + glyph rules hold,
// and required files exist. No browser, no dependencies.
// Run: node tests/validate.mjs
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => readFileSync(join(root, f), 'utf8');
const readBuf = (f) => readFileSync(join(root, f));

const html = read('index.html');
const notfound = read('404.html');
const css = read('styles.css');
const js = read('script.js');
const sitemap = read('sitemap.xml');

let failures = 0;
const fail = (msg) => { failures++; console.error('  FAIL  ' + msg); };
const ok = (msg) => console.log('  pass  ' + msg);
const must = (label, cond) => cond ? ok(label) : fail(label);
const contains = (hay, needle) => hay.includes(needle);

console.log('\nStatic validation — The Clearance Bench\n');

// --- Required files ---------------------------------------------------
const files = [
  'index.html', 'styles.css', 'script.js', '.nojekyll', '404.html',
  'favicon.svg', 'favicon.ico', 'apple-touch-icon.png',
  'robots.txt', 'sitemap.xml', 'og-image.png', 'README.md',
];
for (const f of files) must('file exists: ' + f, existsSync(join(root, f)));

// --- Selected hero copy (the committed headline) ----------------------
for (const line of ['Bring the work.', 'Direct the agent.', 'Keep the final say.']) {
  must('hero headline line present: "' + line + '"', contains(html, line));
}
must('hero beginner posture (no coding or command line)',
  /No coding or command[ -]line required/i.test(html));
must('hero clamp line', contains(html, 'Start with one real goal.'));
must('hero stop-bar line', contains(html, 'Nothing leaves without your approval.'));
must('hero instructor line (strongest facts)',
  contains(html, 'executive AI advisor, hands-on agent builder, and former Chief Model Risk Officer at a $30B bank'));

// --- Clearance Bench vocabulary (embodied metaphor, not dark cards) ----
const vocab = ['bench', 'clamp', 'route', 'socket', 'inspect', 'drawer', 'release', 'carrier', 'stop bar'];
for (const w of vocab) must('bench vocabulary present: "' + w + '"', new RegExp(w, 'i').test(html));

// --- The five clearance stations + control labels ---------------------
const stations = ['Clamp the brief', 'Read the route', 'Seat approved tools', 'Inspect and correct', 'Review and release'];
for (const s of stations) must('clearance station present: "' + s + '"', contains(html, s));
must('primary advance control "Advance the work"', contains(html, 'Advance the work'));
must('post-release control "Reset the bench"', contains(html, 'Reset the bench'));
// Static ordered path: five stations exist as list items in DOM order.
const stationItems = (html.match(/data-station="[1-5]"/g) || []).length;
must('five stations present as semantic list items (found ' + stationItems + ')', stationItems === 5);
// Direct, keyboard-operable numbered station controls.
for (let n = 1; n <= 5; n++) must('direct station control data-goto="' + n + '"', contains(html, 'data-goto="' + n + '"'));
must('advance control has data-action="advance"', contains(html, 'data-action="advance"'));
must('reset control has data-action="reset"', contains(html, 'data-action="reset"'));
must('polite live status region', /aria-live="polite"/.test(html));

// --- No autoplay / timer behavior in the interaction ------------------
must('no setInterval in script.js (no autoplay/timer)', !/\bsetInterval\b/.test(js));
must('no setTimeout-driven progression in script.js', !/\bsetTimeout\b/.test(js));
must('no "autoplay" wording in shipped JS', !/autoplay/i.test(js));
// The final activation is a deliberate, separately labeled release.
must('script advances exactly one station per activation', /currentStation\s*\+\s*1|current\s*\+\s*1|\+\s*1/.test(js));

// --- Locked verbatim facts (must be present, exact) -------------------
const exact = [
  // enrollment behavior / CTA microcopy (repeated, truthful)
  'Opens a pre-addressed email for enrollment and payment details. No payment is taken on this site.',
  'Request your seat',
  // dates / schedule / location / hours
  'September 18', '18–20, 2026', 'Tenafly, New Jersey',
  '6:00–9:00 PM', '9:00 AM–5:00 PM', 'includes a 90-minute lunch',
  '16 live instructional hours', '19 hours on site',
  'Friday, September 18', 'Saturday, September 19', 'Sunday, September 20',
  'exact venue is shared with enrolled learners',
  // prices, savings, tuition rule
  '$1,500', '$1,850', '$2,250', '$750', '$400',
  'Through August 15, 2026', 'August 16 through September 5, 2026', 'After September 5, 2026',
  'Save $750 versus full tuition', 'Save $400 versus full tuition',
  'Your tuition is determined by the date your completed payment is received.',
  'One program. One small cohort. Only the payment date changes the price.',
  // prerequisites / subscription
  'ChatGPT Plus', 'separate from tuition', 'command-line experience',
  // take-home rack outcomes + certificate
  'Personal Agent Map', 'safety and permissions checklist', 'next-30-days launch plan',
  'AgentX Certificate of Completion',
  // instructor approved facts
  'Adam Behrman', 'Chief Model Risk Officer', '$30B bank', 'McKinsey',
  'NYU Stern MBA', 'CFA', 'FRM',
  'AWS Certified Machine Learning', 'Completed executive AI study at MIT',
  // exit gate
  'Come with one real goal. Leave with a method you can use again.',
];
for (const s of exact) must('present: "' + s.slice(0, 56) + (s.length > 56 ? '…' : '') + '"', contains(html, s));

// Both 90-minute lunches must be accounted for, and the 3/8/8 on-site hours
// printed, so 19 on-site hours cannot be misread as 19 teaching hours.
const lunchCount = html.split('90-minute lunch').length - 1;
must('both 90-minute lunches accounted for (found ' + lunchCount + ')', lunchCount >= 2);
must('Friday on-site hours printed (3)', contains(html, '3 hours on site'));
must('Saturday + Sunday on-site hours printed (8 each)', (html.split('8 hours on site').length - 1) >= 2);

// The decorative fixtures must not carry essential meaning: every inline SVG is
// hidden from assistive tech (all labels/explanations live in real HTML).
const svgTags = html.match(/<svg\b[^>]*>/g) || [];
must('at least one inline SVG fixture', svgTags.length >= 1);
must('every inline SVG is aria-hidden (no essential SVG text)',
  svgTags.every((t) => /aria-hidden="true"/.test(t)));

// Parse EVERY shipped anchor's href and require each mailto to equal the one
// canonical URL — an equality check, not a count. The href is read by a real
// anchor scan that accepts BOTH double- and single-quoted values (with optional
// whitespace around '='), case-insensitively, so a single drifted single-quoted
// mailto cannot hide behind good double-quoted links. No dependency added.
function anchorHrefs(source) {
  const hrefs = [];
  const tagRe = /<a\b[^>]*>/gi;
  let m;
  while ((m = tagRe.exec(source)) !== null) {
    const attr = m[0].match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
    if (attr) hrefs.push(attr[1] !== undefined ? attr[1] : attr[2]);
  }
  return hrefs;
}
// Parser self-check: a double-quoted, a single-quoted, and an uppercase-tag mailto
// must ALL be found. Then a mutation fixture proving a drifted single-quoted href
// is surfaced by this parser and MISSED by the old double-quote-only regex.
(() => {
  const mix = '<a href="mailto:a@b.com">d</a>' +
    "<a href = 'mailto:a@b.com'>s</a>" +
    '<A HREF="mailto:a@b.com">u</A>';
  const found = anchorHrefs(mix).filter((h) => /^mailto:/i.test(h));
  must('anchor parser finds double- + single-quoted mailto anchors (found ' + found.length + ')',
    found.length === 3);
  const drifted = '<a href="mailto:good">1</a>' + "<a href='mailto:DRIFTED'>2</a>";
  const oldRegex = [...drifted.matchAll(/href="(mailto:[^"]*)"/g)].map((x) => x[1]);
  const tolerant = anchorHrefs(drifted).filter((h) => /^mailto:/i.test(h));
  must('mutation fixture: old double-quote-only regex MISSES the drifted single-quoted mailto',
    oldRegex.filter((h) => h !== 'mailto:good').length === 0);
  must('mutation fixture: tolerant parser REPORTS the drifted single-quoted mailto',
    tolerant.filter((h) => h !== 'mailto:good').length === 1);
})();

// The exact brief mailto string must be the CTA destination everywhere. The one
// canonical enrollment URL is read straight from PROJECT_BRIEF.md so this test
// tracks the source of truth and catches future drift. PROJECT_BRIEF.md is
// gitignored (working notes, not shipped), so a clean checkout has no brief to
// read: fall back to the page's own first parsed mailto anchor as the canonical
// value. The no-drift equality check below is the part that actually protects
// the CTAs and it runs either way; the brief comparison is an extra cross-check
// available to anyone working with the brief on disk.
const briefPath = 'PROJECT_BRIEF.md';
const pageMailto = anchorHrefs(html).filter((h) => /^mailto:/i.test(h))[0] || '';
must('canonical enrollment mailto found on the page', pageMailto.length > 0);
let canonicalMailto = pageMailto;
if (existsSync(join(root, briefPath))) {
  const briefMailto =
    (read(briefPath).match(/mailto:adam\.behrman@gmail\.com[^\s`)"']*/) || [])[0] || '';
  must('canonical enrollment mailto found in PROJECT_BRIEF.md', briefMailto.length > 0);
  if (briefMailto) canonicalMailto = briefMailto;
} else {
  ok('PROJECT_BRIEF.md absent (gitignored) — canonical mailto taken from the page');
}
const mailto = canonicalMailto;
must('exact brief mailto present', contains(html, mailto));

// The shipped page: exactly five canonical mailto anchors after seat-pull removal
// (hero, tuition, final CTA button, final CTA email, footer email).
const mailtoHrefs = anchorHrefs(html).filter((h) => /^mailto:/i.test(h));
must('exactly five shipped mailto anchors after seat-pull removal (found ' + mailtoHrefs.length + ')',
  mailtoHrefs.length === 5);
const mailtoDrift = mailtoHrefs.filter((h) => h !== canonicalMailto);
must('every shipped mailto anchor equals the canonical enrollment URL (parsed, not counted)',
  mailtoDrift.length === 0);

// --- Structural rules -------------------------------------------------
const h1count = (html.match(/<h1\b/gi) || []).length;
must('exactly one <h1> (found ' + h1count + ')', h1count === 1);
must('has lang attribute', /<html[^>]*lang="en"/.test(html));
must('canonical to project URL', contains(html, '<link rel="canonical" href="https://abehrman.github.io/agentic-ai-weekend/">'));
must('og:url is project URL', contains(html, 'https://abehrman.github.io/agentic-ai-weekend/'));
must('og:image is absolute project URL', contains(html, 'https://abehrman.github.io/agentic-ai-weekend/og-image.png'));
must('local stylesheet is relative', contains(html, 'href="styles.css"'));
must('local script is relative + deferred', contains(html, 'src="script.js" defer'));
must('no runtime web-font requests (no fonts.googleapis / fonts.gstatic)',
  !/fonts\.googleapis|fonts\.gstatic|use\.typekit|fonts\.net/i.test(html));
must('JSON-LD Course present', contains(html, '"@type": "Course"'));
must('JSON-LD has three offers (prices 1500/1850/2250)',
  contains(html, '"price": "1500"') && contains(html, '"price": "1850"') && contains(html, '"price": "2250"'));

// Single primary CTA label; no co-equal alternate button label.
const seatCount = (html.match(/Request your seat/g) || []).length;
must('primary CTA "Request your seat" repeated (found ' + seatCount + ')', seatCount >= 3);
must('no co-equal "Get enrollment details" button label', !contains(html, 'Get enrollment details'));

// All three tuition windows always in the DOM; marker starts hidden (no-JS => none).
must('tuition window: early in DOM', contains(html, 'data-window="early"'));
must('tuition window: mid in DOM', contains(html, 'data-window="mid"'));
must('tuition window: full in DOM', contains(html, 'data-window="full"'));
must('current-window marker starts hidden', /data-marker hidden/.test(html));
must('mobile marker reads as text', contains(html, 'Current payment window'));

// --- Dark workshop palette is actually wired into CSS -----------------
const paletteHexes = ['#111619', '#28312F', '#F4F1E8', '#B9C2BE', '#E85D36', '#7FA7B8'];
for (const hex of paletteHexes) must('CSS uses dark token ' + hex, css.toUpperCase().includes(hex.toUpperCase()));
must('theme-color is the floor color', contains(html, 'content="#111619"'));
// Genuine replacement, not a recolor of the ivory/forest prospectus.
must('old forest-green token #1B4332 removed from CSS', !css.includes('#1B4332'));
must('old ivory paper token #F5F1E8 removed from CSS', !css.includes('#F5F1E8'));
must('reduced-motion handling present in CSS', /prefers-reduced-motion:\s*reduce/.test(css));
must('final exit CTA is full width on mobile', /\.exit \.btn\s*\{\s*width:\s*100%/.test(css));
must('forced-colors handling present in CSS', /forced-colors:\s*active/.test(css));

// --- Forbidden inflations / fake proof / trackers / payment implication
const forbidden = [
  'spots remaining', 'seats remaining', 'seats left', 'last chance', 'act now',
  'countdown', 'limited time', 'only 3 left', 'sold out',
  'job placement', 'guaranteed job', 'salary', 'earn $', 'double your income',
  'testimonial', 'star rating', 'aggregateRating', 'reviewCount',
  // payment implication on the site
  'add to cart', 'buy now', 'checkout', 'proceed to payment', 'pay now',
  // positive university-affiliation claims (only the truthful negation is asserted)
  'mit program', 'mit-certified', 'accredited by', 'in partnership with',
  'endorsed by', 'official mit', 'university-accredited', 'college credit toward',
  // trackers
  'google-analytics', 'googletagmanager', 'gtag(', 'fbq(', 'hotjar',
  'mixpanel', 'segment.com/analytics', 'data-analytics',
];
const shipped = html + '\n' + css + '\n' + js + '\n' + notfound;
for (const s of forbidden) must('absent (forbidden): "' + s + '"', !shipped.toLowerCase().includes(s.toLowerCase()));

// Required truthful non-affiliation disclaimer.
must('non-affiliation disclaimer present',
  contains(html, 'not presented as MIT, Harvard, or Columbia faculty') &&
  contains(html, 'no university affiliation, accreditation, or transferable academic credit'));

// --- No section-symbol or typographic arrow glyphs --------------------
const glyphs = ['§', '→', '←', '↑', '↓', '⇒', '⇐', '⟶', '➜', '➔', '»«'];
for (const g of glyphs) {
  must('no glyph in index.html: ' + g, !html.includes(g));
  must('no glyph in 404.html: ' + g, !notfound.includes(g));
}

// --- 404 uses repo-absolute asset paths (resolve from any deep URL) ---
must('404 stylesheet is repo-absolute', contains(notfound, '/agentic-ai-weekend/styles.css'));

// --- #6 Structured-data offers: no unsupported InStock, non-overlapping windows
must('no unsupported InStock availability in structured data', !contains(html, 'InStock'));
must('offers declare no availability claim', !/"availability"/.test(html));
must('early offer priceValidUntil 2026-08-15', contains(html, '"priceValidUntil": "2026-08-15"'));
must('mid offer priceValidUntil 2026-09-05', contains(html, '"priceValidUntil": "2026-09-05"'));
must('mid offer validFrom 2026-08-16 (machine-readable window start)', contains(html, '"validFrom": "2026-08-16"'));
must('full offer validFrom 2026-09-06 (no overlap with mid)', contains(html, '"validFrom": "2026-09-06"'));

// --- #8 Sitemap publication date for this release --------------------
must('sitemap lastmod is the 2026-07-27 release date', contains(sitemap, '<lastmod>2026-07-27</lastmod>'));

// --- #3 Interactive target sizes (44px minimum) ----------------------
must('wordmark clickable box is at least 44px high', /\.wordmark\s*\{[^}]*min-height:\s*44px/.test(css));
must('wordmark stays inline-flex (target grows, masthead does not)', /\.wordmark\s*\{[^}]*inline-flex/.test(css));
must('standalone email links are at least 44px high', /\.email\s*\{[^}]*min-height:\s*44px/.test(css));

// --- Blocker 1: the adaptive seat-pull feature is removed ENTIRELY ----
// The fixed seat-pull overlaid real learning content at 720–1024px. Rather than
// move its breakpoint (and risk another untested collision), it is deleted: the
// page already carries five in-flow enrollment CTAs. An absent fixed element
// cannot obscure content, so this committed static contract requires no trace of
// the seat-pull in HTML, CSS, or JS — element, class, hook, or setup fn/call.
must('no seat-pull element/class in index.html', !/seatpull/i.test(html) && !/data-sticky-cta/i.test(html));
must('no seat-pull rules or hook in styles.css', !/seatpull/i.test(css) && !/data-sticky-cta/i.test(css));
must('no setupStickyCta function or call in script.js', !/setupStickyCta/.test(js));
must('no data-sticky-cta reference in script.js', !/data-sticky-cta/i.test(js));

// --- #5 Concept fidelity: hero perimeter rail + mobile vertical fixture
must('hero facts are not a bordered floating card', !/\.facts\s*\{[^}]*border:\s*1px solid/.test(css));
must('desktop horizontal rail fixture present', contains(html, 'fixture--rail-h'));
must('mobile vertical rail fixture present', contains(html, 'fixture--rail-v'));
must('desktop carrier is tagged for x-axis geometry', contains(html, 'data-carrier="desktop"'));
must('mobile carrier is tagged for y-axis geometry', contains(html, 'data-carrier="mobile"'));
must('station micro-labels are guarded to at least 13px', /\.station__index\s*\{[^}]*font-size:\s*max\(\s*13px/.test(css));

// --- #4 Favicon ICO frames + raster Apple touch icon ----------------
// The stale base ICO is a single 64px frame; a correct dark-workbench ICO
// embeds two PNG frames (32 + 64). Structural parse, no pixel decode.
const ico = readBuf('favicon.ico');
must('favicon.ico is an icon resource (type 1)', ico.readUInt16LE(0) === 0 && ico.readUInt16LE(2) === 1);
const icoCount = ico.readUInt16LE(4);
must('favicon.ico embeds two frames, not the stale single 64 (found ' + icoCount + ')', icoCount === 2);
const icoWidths = [];
for (let i = 0; i < icoCount; i++) {
  const ent = 6 + i * 16;
  let w = ico[ent]; if (w === 0) w = 256;
  icoWidths.push(w);
  const imgOff = ico.readUInt32LE(ent + 12);
  const isPng = ico[imgOff] === 0x89 && ico[imgOff + 1] === 0x50 &&
    ico[imgOff + 2] === 0x4e && ico[imgOff + 3] === 0x47;
  must('favicon.ico frame ' + i + ' is an embedded PNG', isPng);
  const pw = ico.readUInt32BE(imgOff + 16);
  const ph = ico.readUInt32BE(imgOff + 20);
  must('favicon.ico frame ' + i + ' PNG IHDR ' + pw + 'x' + ph + ' matches declared ' + w,
    pw === w && ph === w);
}
must('favicon.ico has a 32px frame (matches declared sizes)', icoWidths.includes(32));
must('favicon.ico has a 64px frame', icoWidths.includes(64));

const apple = readBuf('apple-touch-icon.png');
must('apple-touch-icon.png is a PNG', apple[0] === 0x89 && apple[1] === 0x50 && apple[2] === 0x4e && apple[3] === 0x47);
must('apple-touch-icon.png is 180x180', apple.readUInt32BE(16) === 180 && apple.readUInt32BE(20) === 180);

// Correct metadata declarations for the two-frame ICO + raster touch icon.
must('index declares favicon.ico sizes "32x32 64x64"', /favicon\.ico"\s+sizes="32x32 64x64"/.test(html));
must('404 declares favicon.ico sizes "32x32 64x64"', /favicon\.ico"\s+sizes="32x32 64x64"/.test(notfound));
must('apple-touch-icon points at the local raster PNG', /rel="apple-touch-icon"[^>]*href="[^"]*apple-touch-icon\.png"/.test(html));

// --- Final threshold repair: above-fold date, bench proof, one CTA, mobile size
// A. The core course fact is repeated above the fold as engraved hero wayfinding.
must('hero date line uses class hero__when', /class="[^"]*\bhero__when\b/.test(html));
must('hero date line carries the data-hero-date hook', /data-hero-date/.test(html));
must('hero date line has the exact date + location copy',
  contains(html, 'September 18–20, 2026 · Tenafly, New Jersey'));

// B. A visible bench/rail surface is tagged so browser QA can prove the physical
//    threshold intersects the first desktop viewport (real 2D path, not a hairline).
must('bench proof hook data-bench-proof present', contains(html, 'data-bench-proof'));
must('bench proof is on an SVG <path> surface', /<path\b[^>]*\bdata-bench-proof\b/.test(html));
must('bench proof sits inside the threshold fixture',
  /fixture--threshold[\s\S]*?data-bench-proof/.test(html));

// D. One dominant CTA in the initial desktop viewport: the static masthead CTA is
//    removed from the HTML entirely, and no CSS reveal rule resurrects it.
must('static masthead CTA removed from HTML', !contains(html, 'masthead__cta'));
must('no masthead CTA rule left in CSS', !/\.masthead__cta\b/.test(css));

// C. Mobile headline is a guarded, controlled display size — not the 56px override.
//    (The display face renders non-condensed on real phones and the QA browser, so
//    a ~34px size is what actually keeps the headline to at most four rendered lines;
//    see the RED/geometry notes. The 3.5rem/56px override that produced six lines
//    must be gone.)
must('old 3.5rem mobile hero override removed',
  !/\.hero__headline\s*\{\s*font-size:\s*3\.5rem\s*;?\s*\}/.test(css));
must('no 56px hero override remains',
  !/\.hero__headline\s*\{[^}]*font-size:\s*56px/.test(css));
const mobileHero = /\.hero__headline\s*\{[^}]*font-size:\s*(\d+(?:\.\d+)?)px/.exec(css);
must('mobile hero headline set to an explicit px display size', !!mobileHero);
must('mobile hero headline size is controlled (28–40px), not the huge override',
  !!mobileHero && parseFloat(mobileHero[1]) >= 28 && parseFloat(mobileHero[1]) <= 40);

// Medium-width fact rails must use a stable 3×2 grid. Auto-fit at 900–1024px
// creates five/six undersized cells that split words and leaves an orphaned cell.
must('medium-width hero fact rail uses a stable three-column grid',
  /@media\s*\(min-width:\s*640px\)\s*and\s*\(max-width:\s*1199px\)[\s\S]*?\.facts\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/.test(css));
must('medium-width fact rail starts its second row without a left divider',
  /\.facts__row:nth-child\(4\)\s*\{[^}]*border-left:\s*none/.test(css));

// Short desktop threshold composition. Common 900–1366px short viewports push the
// Desktop-width but short-height viewports (900×900 … 1366×768) drove the hero
// date + CTA below the fold and let the diagonal bench cross the copy. The fix
// is a dedicated short-height query that ONLY compresses the threshold — the
// tall-desktop (1440×1000) composition must be left intact. This contract keeps
// that query, its threshold compression, and its bench-fixture guard durable.
// The short block is a top-level @media, so it closes with a column-0 "}" — the
// non-greedy match stops there (nested rules close with an indented "}").
const shortBlock = (css.match(/@media\s*\(min-width:\s*900px\)\s*and\s*\(max-height:\s*920px\)\s*,\s*\(min-width:\s*900px\)\s*and\s*\(max-width:\s*1199px\)\s*\{[\s\S]*?\n\}/) || [])[0] || '';
must('short-desktop compression query covers short heights through 920px and medium widths through 1199px', shortBlock.length > 0);
// Threshold headline is compressed to a smaller display clamp (3.x rem base).
must('short query compresses the desktop hero headline (clamp starting 3.x rem)',
  /\.hero__headline\s*\{[^}]*font-size:\s*clamp\(\s*3\.[0-9]+rem/.test(shortBlock));
// The lower copy column is penned to explicit px max-widths so the right-anchored
// bench can clear it — assert the date line and at least one of subhead/credential.
must('short query pens the hero date column to a px max-width',
  /\.hero__when\s*\{[^}]*max-width:\s*\d+px/.test(shortBlock));
must('short query pens the hero subhead/credential column to a px max-width',
  /\.hero__(?:subhead|credential)\s*\{[^}]*max-width:\s*\d+px/.test(shortBlock));
// The absolutely-positioned bench fixture is repositioned (off the tall-viewport
// top:-230px) and narrowed (below the tall-viewport 54%) after compression.
const shortFixTop = /\.fixture--threshold\s*\{[^}]*top:\s*(-?\d+)px/.exec(shortBlock);
must('short query repositions the bench fixture (top overridden, not -230px)',
  !!shortFixTop && shortFixTop[1] !== '-230');
const shortFixWidth = /\.fixture--threshold\s*\{[^}]*width:\s*(\d+(?:\.\d+)?)%/.exec(shortBlock);
must('short query narrows the bench fixture below the tall-viewport 54%',
  !!shortFixWidth && parseFloat(shortFixWidth[1]) < 54);
// The already-correct tall-desktop (1440×1000) composition must be preserved:
// the base ≥900px block keeps the lifted bench at top:-230px / width:54%.
must('tall-desktop bench composition preserved (top:-230px)', /top:\s*-230px/.test(css));
must('tall-desktop bench composition preserved (width:54%)',
  /\.fixture--threshold\s*\{[^}]*width:\s*54%/.test(css));

// --- Blocker 1: mobile bench proof lifted into the date -> CTA gap ----
// The real threshold fixture is taken out of normal flow on phones and lifted
// (negative top) into the gap between the engraved date and the CTA, full width,
// so a recognizable bench crosses the first viewport at 375/414. Scoped to the
// full-width absolute variant so it can never match the desktop 54% rule.
const fixtureRules = [...css.matchAll(/\.fixture--threshold\s*\{([^}]*)\}/g)].map((m) => m[1]);
const mobileFixtureRule = fixtureRules.find((b) => /position:\s*absolute/.test(b) && /width:\s*100%/.test(b));
must('mobile lifts the real .fixture--threshold out of flow (full-width + absolute)', !!mobileFixtureRule);
must('mobile threshold fixture has a negative top (lifted into the date->CTA gap)',
  !!mobileFixtureRule && /top:\s*-\d+px/.test(mobileFixtureRule));
must('mobile threshold fixture spans full width', !!mobileFixtureRule && /width:\s*100%/.test(mobileFixtureRule));
must('mobile threshold fixture keeps pointer-events:none',
  !!mobileFixtureRule && /pointer-events:\s*none/.test(mobileFixtureRule));
// And confirm that full-width absolute lift-out is scoped inside a mobile
// max-width media query (not leaking into the desktop composition, which stays
// top:-230px / width:54%). The exact phone breakpoint may be tuned (<=430px),
// so match any max-width query rather than a hard-coded pixel value.
must('mobile threshold lift-out is scoped inside a max-width media query',
  /@media\s*\(max-width:\s*\d+px\)[\s\S]*?\.fixture--threshold\s*\{[^}]*position:\s*absolute[^}]*width:\s*100%|@media\s*\(max-width:\s*\d+px\)[\s\S]*?\.fixture--threshold\s*\{[^}]*width:\s*100%[^}]*position:\s*absolute/.test(css));

// --- Blocker 2: FAQ is source-open (no-JS legible) and pointer-operable
// All six answers are visible with no JavaScript at every width, the desktop
// pointer-disable hack is gone, and the JS enhancement re-opens/closes per
// breakpoint without disabling the summaries.
const faqOpen = (html.match(/<details class="faq__item" open>/g) || []).length;
must('all six FAQ items are open in source HTML (no-JS answers visible, found ' + faqOpen + ')', faqOpen === 6);
must('no desktop pointer-events:none disabling FAQ summaries',
  !/\.faq__item summary\s*\{[^}]*pointer-events:\s*none/.test(css));
must('FAQ answers not force-shown via display:block !important (open drives visibility)',
  !/\.faq__a\s*\{[^}]*display:\s*block\s*!important/.test(css));
must('two-column desktop FAQ layout preserved', /\.faq\s*\{[^}]*columns:\s*2/.test(css));
must('setupFaq enhancement present in script.js', /function setupFaq\b/.test(js));
// FAQ init wiring must be checked INSIDE init()'s body. The old
// /setupFaq\s*\(\s*\)/ check also matched the `function setupFaq()` declaration,
// so deleting the real call from init() false-passed. Extract the init() body and
// require a semicolon-terminated setupFaq(); there — and keep the separate
// declaration check above.
const initBody = (js.match(/function\s+init\s*\(\s*\)\s*\{([\s\S]*?)\n\}/) || [])[1] || '';
must('init() body located in script.js', initBody.length > 0);
must('setupFaq(); is actually called inside init() (semicolon-terminated, scoped to init)',
  /\bsetupFaq\s*\(\s*\)\s*;/.test(initBody));
// Mutation fixture: remove ONLY the init() call and keep the declaration. The old
// weak check still matches the declaration (false pass); the scoped check rejects.
(() => {
  const mutant = js.replace(/\n\s*setupFaq\s*\(\s*\)\s*;/, '');
  const mutantBody = (mutant.match(/function\s+init\s*\(\s*\)\s*\{([\s\S]*?)\n\}/) || [])[1] || '';
  must('mutation fixture: declaration survives + old weak check still false-passes',
    /function\s+setupFaq\b/.test(mutant) && /\bsetupFaq\s*\(\s*\)/.test(mutant));
  must('scoped init() wiring check REJECTS the declaration-only mutant',
    !/\bsetupFaq\s*\(\s*\)\s*;/.test(mutantBody));
})();
must('FAQ enhancement keys off the 900px desktop breakpoint',
  /matchMedia\(\s*['"]\(min-width:\s*900px\)['"]\s*\)/.test(js));
must('FAQ enhancement syncs on media-query change with an addListener fallback',
  /addEventListener\(\s*['"]change['"]/.test(js) && /\baddListener\b/.test(js));

console.log('');
if (failures) {
  console.error(`Static validation: ${failures} check(s) failed.`);
  process.exit(1);
}
console.log('Static validation: all checks passed.');
