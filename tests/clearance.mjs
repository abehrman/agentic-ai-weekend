// Focused contract for the signature clearance-rail interaction. Static checks
// only (no browser): the five-station semantic path, its direct controls, and
// the JavaScript state-machine shape. Live behavior is exercised separately in
// browser QA. Run: node tests/clearance.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => readFileSync(join(root, f), 'utf8');
const html = read('index.html');
const js = read('script.js');
const css = read('styles.css');

const require = createRequire(import.meta.url);
const exported = require('../script.js');
const RAIL_GEOMETRY = exported.RAIL_GEOMETRY || { desktop: { stations: [] }, mobile: { stations: [] } };
const carrierTransform = exported.carrierTransform;
// Safe wrapper so missing exports fail assertions cleanly instead of throwing.
const ct = (g, s, r) => {
  try { return carrierTransform(g, s, r); } catch { return '<<missing>>'; }
};

let failures = 0;
const must = (label, cond) => cond ? console.log('  pass  ' + label)
  : (failures++, console.error('  FAIL  ' + label));

console.log('\nClearance-rail interaction contract\n');

// The five stations, in exact order, INSIDE the real <ol class="stations">.
// Scoping to the actual list (not a page-wide name scan) means a stray mention
// of a station name elsewhere can't satisfy the ordered-path contract.
const ORDER = ['Clamp the brief', 'Read the route', 'Seat approved tools', 'Inspect and correct', 'Review and release'];
const stationsOl = (html.match(/<ol class="stations"[\s\S]*?<\/ol>/) || [])[0] || '';
must('the <ol class="stations"> ordered list exists', stationsOl.length > 0);
const stationLis = (stationsOl.match(/<li[^>]*\bdata-station="[1-5]"/g) || []).length;
must('exactly five station list items in the stations list (found ' + stationLis + ')', stationLis === 5);
const stationNames = (stationsOl.match(/<h3 class="station__name">([^<]*)<\/h3>/g) || [])
  .map((m) => m.replace(/<[^>]+>/g, '').trim());
must('five station names present in the list (found ' + stationNames.length + ')', stationNames.length === 5);
must('the five station names appear in exact order within the stations list',
  stationNames.length === 5 && ORDER.every((n, i) => stationNames[i] === n));

// Each station carries a real explanation in HTML (not only SVG).
const explanations = [
  'goal, context, constraints, and desired output',      // 1 Clamp the brief
  'proposes a plan before work begins',                  // 2 Read the route
  'unreachable sockets remain',                          // 3 Seat approved tools
  'unsupported claim',                                   // 4 Inspect and correct
  'artifact',                                            // 5 Review and release
];
for (const e of explanations) must('station explanation in DOM: "' + e + '"', html.includes(e));

// Direct controls: one advance, one reset, five numbered station buttons.
must('advance control present', /data-action="advance"/.test(html) && html.includes('Advance the work'));
must('reset control present', /data-action="reset"/.test(html) && html.includes('Reset the bench'));
for (let n = 1; n <= 5; n++) must('numbered station button ' + n, html.includes('data-goto="' + n + '"'));
must('a static aria-current anchor exists for the first station', /aria-current/.test(html));
must('polite live status region present', /aria-live="polite"/.test(html));
must('final release label present for the last activation', html.includes('Review and release'));

// State-machine shape in script.js.
must('has a clearance-rail setup function', /clearance|rail|station/i.test(js));
must('tracks a current station index', /currentStation|current\b/.test(js));
must('no interval/timer autoplay', !/\bsetInterval\b/.test(js) && !/\bsetTimeout\b/.test(js));
must('does not advance on visibilitychange', !/visibilitychange[\s\S]{0,80}(advance|current\s*\+)/.test(js));
// Reduced motion is enforced by CSS, not merely mentioned in a JS comment. A real
// @media (prefers-reduced-motion: reduce) block must neutralize the carrier/gate
// motion so the fixture never animates a lie. (Previously this only grepped
// script.js for the phrase, which passed on an explanatory comment.)
const rmBlock = (css.match(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?\n\}/) || [])[0] || '';
must('CSS has a prefers-reduced-motion: reduce block', rmBlock.length > 0);
must('reduced-motion disables the carrier/gate motion (real CSS contract, not a JS comment)',
  /\[data-carrier\][\s\S]{0,80}\{[^}]*(?:transition|animation):\s*none/.test(rmBlock));
must('reduced-motion also neutralizes the release gate',
  /\[data-gate\][\s\S]{0,80}\{[^}]*(?:transition|animation):\s*none/.test(rmBlock) ||
  /\[data-carrier\]\s*,\s*\[data-gate\]/.test(rmBlock));
must('updates aria-current on stations', /aria-current/.test(js));
must('updates a live status message', /textContent/.test(js));

// --- Exported, pure carrier geometry (honest Node unit checks) --------
// The final release must move the carrier across the stop bar into the output
// tray — a distinct position from the pre-gate station-5 stop. Desktop travels
// the x-axis; the mobile vertical fixture travels the y-axis.
must('exports a rail geometry helper', !!(exported.RAIL_GEOMETRY && exported.RAIL_GEOMETRY.desktop && exported.RAIL_GEOMETRY.mobile));
must('exports carrierTransform()', typeof carrierTransform === 'function');
must('desktop carrier travels the x-axis',
  /^translate\(\d+,0\)$/.test(ct(RAIL_GEOMETRY.desktop, 1, false)));
must('mobile carrier travels the y-axis',
  /^translate\(0,\d+\)$/.test(ct(RAIL_GEOMETRY.mobile, 1, false)));
must('desktop station-5 pre-gate differs from post-release output tray',
  ct(RAIL_GEOMETRY.desktop, 5, false) !== ct(RAIL_GEOMETRY.desktop, 5, true));
must('mobile station-5 pre-gate differs from post-release output tray',
  ct(RAIL_GEOMETRY.mobile, 5, false) !== ct(RAIL_GEOMETRY.mobile, 5, true));
must('desktop release position is past the station-5 stop (moved forward)',
  RAIL_GEOMETRY.desktop.released > RAIL_GEOMETRY.desktop.stations[4]);
must('mobile release position is past the station-5 stop (moved forward)',
  RAIL_GEOMETRY.mobile.released > RAIL_GEOMETRY.mobile.stations[4]);

// --- State-machine coherence in script.js ----------------------------
must('direct station selection clears the released state',
  /function setStation[\s\S]{0,160}released\s*=\s*false/.test(js));
must('carrier position reflects state even under reduced motion (no !reduced transform guard)',
  !/carrier\s*&&\s*!reduced/.test(js) && !/idx\s*=\s*released\s*\?\s*TOTAL\s*:\s*currentStation/.test(js));
must('release moves the carrier via the exported geometry helper', /carrierTransform\(/.test(js));

console.log('');
if (failures) {
  console.error(`Clearance contract: ${failures} check(s) failed.`);
  process.exit(1);
}
console.log('Clearance contract: all checks passed.');
