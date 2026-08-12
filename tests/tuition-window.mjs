// Tuition-window boundary check — the prepared half of "verify the window flips
// correctly on August 16." Everything a machine can settle is settled here: the
// printed rail, the JSON-LD offers, and the pure windowFor() logic must all name
// the SAME two boundaries, and the shipped HTML must ship UNMARKED so the no-JS
// page shows all three windows with none current.
//
// The one thing this cannot do is look at the live page, so it ends by printing
// the exact expected state for a given day.
//
// Run: node tests/tuition-window.mjs              (today, America/New_York)
//      node tests/tuition-window.mjs 2026-08-16   (the boundary rehearsal)
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => readFileSync(join(root, f), 'utf8');
const { windowFor } = createRequire(import.meta.url)('../script.js');

const html = read('index.html');

let failures = 0;
const fail = (msg) => { failures++; console.error('  FAIL  ' + msg); };
const ok = (msg) => console.log('  pass  ' + msg);
const must = (label, cond) => cond ? ok(label) : fail(label);

console.log('\nTuition-window boundary check\n');

/* --- 1. The printed rail ------------------------------------------------ */
// Each window is one <li class="span" data-window="…">. Pull the three blocks
// out of the shipped HTML so this check tracks the page, never a copy of it.
function spanBlocks(source) {
  const out = new Map();
  const re = /<li class="([^"]*\bspan\b[^"]*)" data-window="([^"]+)">([\s\S]*?)<\/li>/g;
  let m;
  while ((m = re.exec(source)) !== null) {
    out.set(m[2], { classes: m[1], body: m[3] });
  }
  return out;
}
const text = (s) => s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const pick = (body, cls) => {
  const m = body.match(new RegExp('<[^>]*class="[^"]*\\b' + cls + '\\b[^"]*"[^>]*>([\\s\\S]*?)<\\/'));
  return m ? text(m[1]) : '';
};

const ORDER = ['early', 'mid', 'full'];
const spans = spanBlocks(html);
must('all three tuition windows present in the rail (found ' + spans.size + ')', spans.size === 3);
for (const key of ORDER) must('window "' + key + '" present', spans.has(key));
if (failures) { console.error('\nRail markup unreadable — stopping.\n'); process.exit(1); }

const rail = ORDER.map((key) => ({
  key,
  dates: pick(spans.get(key).body, 'span__dates'),
  price: pick(spans.get(key).body, 'span__price'),
  classes: spans.get(key).classes
}));
for (const w of rail) {
  must('window "' + w.key + '" prints a date range: ' + JSON.stringify(w.dates), w.dates.length > 0);
  must('window "' + w.key + '" prints a price: ' + JSON.stringify(w.price), /^\$[\d,]+$/.test(w.price));
}

/* --- 2. The shipped HTML must be UNMARKED ------------------------------- */
// The marker is added by script.js at runtime and by nothing else. If a current
// window were ever baked into the file, the no-JS page would go stale silently
// and the page would keep claiming a window that had already closed.
for (const w of rail) {
  must('window "' + w.key + '" ships without is-current (no-JS: nothing marked)',
    !/\bis-current\b/.test(w.classes));
}
const markers = html.match(/<span class="span__marker"[^>]*>/g) || [];
must('one "Current payment window" marker per window (found ' + markers.length + ')',
  markers.length === 3);
must('every shipped marker is hidden (no-JS: all three windows show, none marked)',
  markers.every((t) => /\bhidden\b/.test(t)));

/* --- 3. windowFor() boundaries, derived not assumed --------------------- */
// Walk a full year a day at a time and record where the answer changes. This
// derives the boundaries from the shipped logic instead of restating them, so a
// silent edit to script.js shows up here as a changed boundary date.
function addDays(iso, n) {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
const transitions = [];
for (let iso = '2026-01-01', i = 0; i < 365; i++, iso = addDays(iso, 1)) {
  const next = addDays(iso, 1);
  if (windowFor(iso) !== windowFor(next)) {
    transitions.push({ last: iso, first: next, from: windowFor(iso), to: windowFor(next) });
  }
}
must('windowFor() has exactly two boundaries in 2026 (found ' + transitions.length + ')',
  transitions.length === 2);
if (transitions.length === 2) {
  const [b1, b2] = transitions;
  must('first boundary: early through 2026-08-15, mid from 2026-08-16 (got ' +
    b1.from + '→' + b1.to + ' at ' + b1.first + ')',
    b1.from === 'early' && b1.to === 'mid' && b1.last === '2026-08-15' && b1.first === '2026-08-16');
  must('second boundary: mid through 2026-09-05, full from 2026-09-06 (got ' +
    b2.from + '→' + b2.to + ' at ' + b2.first + ')',
    b2.from === 'mid' && b2.to === 'full' && b2.last === '2026-09-05' && b2.first === '2026-09-06');
  // The dates the logic uses must be the dates the page prints, or the page is
  // quoting a deadline the site does not actually honour.
  const railText = rail.map((w) => w.dates).join(' | ');
  must('the rail prints the first boundary day (August 15, 2026)',
    /August 15, 2026/.test(railText));
  must('the rail prints the second window opening (August 16)',
    /August 16/.test(railText));
  must('the rail prints the second boundary day (September 5, 2026)',
    /September 5, 2026/.test(railText));
}

/* --- 4. JSON-LD offers agree with the rail and the logic ---------------- */
const ldRaw = (html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/) || [])[1];
// The offers array is nested (currently under hasCourseInstance), so find it by
// shape rather than by path — this keeps working if the graph is reorganised.
function findOffers(node) {
  if (Array.isArray(node)) {
    for (const child of node) {
      const hit = findOffers(child);
      if (hit) return hit;
    }
    return null;
  }
  if (!node || typeof node !== 'object') return null;
  if (Array.isArray(node.offers)) return node.offers;
  return findOffers(Object.values(node));
}
let offers = [];
try {
  offers = findOffers(JSON.parse(ldRaw)) || [];
} catch (e) {
  fail('JSON-LD parses as JSON (' + e.message + ')');
}
must('JSON-LD carries three offers (found ' + offers.length + ')', offers.length === 3);
if (offers.length === 3) {
  // Offers are authored in window order; each must match its rail price exactly.
  ORDER.forEach((key, i) => {
    const railPrice = rail[i].price.replace(/[$,]/g, '');
    must('offer ' + (i + 1) + ' price matches the "' + key + '" rail price ($' +
      Number(railPrice).toLocaleString('en-US') + ')', offers[i].price === railPrice);
  });
  // Machine-readable dates must reproduce the same two boundaries, so a scraper
  // and a reader never see two different deadlines — and the offers never overlap.
  must('early offer is valid until 2026-08-15', offers[0].priceValidUntil === '2026-08-15');
  must('mid offer starts 2026-08-16 (the day after early closes)',
    offers[1].validFrom === '2026-08-16');
  must('mid offer is valid until 2026-09-05', offers[1].priceValidUntil === '2026-09-05');
  must('full offer starts 2026-09-06 (the day after mid closes)',
    offers[2].validFrom === '2026-09-06');
  must('no gap or overlap between the three offers',
    offers[0].priceValidUntil < offers[1].validFrom &&
    offers[1].priceValidUntil < offers[2].validFrom &&
    addDays(offers[0].priceValidUntil, 1) === offers[1].validFrom &&
    addDays(offers[1].priceValidUntil, 1) === offers[2].validFrom);
}

/* --- 5. Which day are we checking? -------------------------------------- */
// Resolved before the doc checks because one of them — whether send-ready push
// copy has outlived its window — depends on the date.
const arg = process.argv[2];
if (arg && !/^\d{4}-\d{2}-\d{2}$/.test(arg)) {
  fail('date argument must be YYYY-MM-DD (got ' + JSON.stringify(arg) + ')');
}
const today = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit'
}).format(new Date());
const asOf = /^\d{4}-\d{2}-\d{2}$/.test(arg || '') ? arg : today;
const live = windowFor(asOf);
const liveRow = rail.find((w) => w.key === live);

/* --- 6. The working docs quote the same windows ------------------------- */
// "Check that any copy you are sending quotes the window that is actually live"
// only works if the docs and the page agree on what the windows ARE. A price
// that drifts here is a price quoted to a real person.
//
// The legitimate amounts are whatever the PAGE prints — the three tuition
// prices plus the savings figures beside them — so a doc may repeat "$750 under
// full tuition", but may not invent an amount of its own.
// Pull dollar amounts without letting ordinary punctuation ride along: a price
// at the end of a clause ("($1,500, then $1,850)") must normalise to the same
// token as the same price mid-sentence, or the check invents a stray. Anything
// under three digits is prose, not tuition ("a $30B bank").
const amounts = (source) => (source.match(/\$[\d,]+/g) || [])
  .map((a) => a.replace(/,+$/, ''))
  .filter((a) => a.replace(/\D/g, '').length >= 3);
const pagePrices = new Set(amounts(html));
const DOCS = ['docs/seat-request-replies.md', 'docs/enrollment-push.md'];
for (const docPath of DOCS) {
  if (!existsSync(join(root, docPath))) {
    ok(docPath + ' absent — skipping its price check');
    continue;
  }
  const doc = read(docPath);
  for (const w of rail) {
    must(docPath + ' quotes the "' + w.key + '" price ' + w.price, doc.includes(w.price));
    must(docPath + ' quotes the "' + w.key + '" dates: ' + JSON.stringify(w.dates),
      doc.includes(w.dates));
  }
  const stray = [...new Set(amounts(doc))].filter((p) => !pagePrices.has(p));
  must(docPath + ' quotes no amount the page does not print' +
    (stray.length ? ' (found ' + stray.join(', ') + ')' : ''), stray.length === 0);
}

/* --- 7. Send-ready copy must not outlive its window --------------------- */
// The push doc is finished outbound copy with a price in it, which makes it the
// one file that is actively dangerous once its window closes. It declares the
// window it was written for and whether it is still in service; while it says
// "active", the declared window has to be the live one. Failing here is the
// point — it is the repo saying "you have sendable copy quoting a closed
// window." The fix is to rewrite it for the new window or retire it.
const pushPath = 'docs/enrollment-push.md';
if (existsSync(join(root, pushPath))) {
  const push = read(pushPath);
  const declared = (push.match(/<!--\s*push-window:\s*([a-z]+)\s*-->/) || [])[1];
  const status = (push.match(/<!--\s*push-status:\s*(active|retired)\s*-->/) || [])[1];
  must(pushPath + ' declares a push-window of ' + ORDER.map((k) => '"' + k + '"').join('/') +
    ' (got ' + JSON.stringify(declared) + ')', ORDER.includes(declared));
  must(pushPath + ' declares push-status "active" or "retired" (got ' +
    JSON.stringify(status) + ')', status !== undefined);
  if (status === 'active' && ORDER.includes(declared)) {
    must(pushPath + ' is active and its "' + declared + '" window is still live on ' + asOf +
      (declared === live
        ? ''
        : ' — the live window is "' + live + '" (' + liveRow.price +
          '), so this copy would quote a closed price. Rewrite it for "' + live +
          '" or set push-status: retired'),
      declared === live);
  } else if (status === 'retired') {
    ok(pushPath + ' is retired — window currency not enforced');
  }
} else {
  ok(pushPath + ' absent — skipping the push staleness check');
}

/* --- 8. What to expect on the day --------------------------------------- */
// The live look is a human step. This prints exactly what to look for so the
// check on the day is a comparison, not a judgement call.
must('exactly one rail window matches the active date',
  rail.filter((w) => w.key === live).length === 1);

console.log('\n  As of ' + asOf + ' (America/New_York' +
  (asOf === today ? ', today' : ', simulated') + '), the live page should show:\n');
for (const w of rail) {
  const mark = w.key === live ? '>' : ' ';
  console.log('    ' + mark + ' ' + (w.key === live ? '[CURRENT] ' : '          ') +
    w.price.padEnd(7) + '  ' + w.dates);
}
console.log('\n    With JavaScript ON  : "Current payment window" appears on ' +
  liveRow.price + ' (' + liveRow.dates + ') and nowhere else.');
console.log('    With JavaScript OFF : all three windows show, none marked current.');
console.log('    Any reply template sent today must quote ' + liveRow.price + '.\n');

console.log(failures
  ? 'Tuition-window check: ' + failures + ' check(s) failed.\n'
  : 'Tuition-window check: all checks passed.\n');
process.exit(failures ? 1 : 0);
