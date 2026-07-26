// Static validator: locked facts present and exact, forbidden inflations absent,
// structural + glyph rules, required files present. No browser, no dependencies.
// Run: node tests/validate.mjs
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => readFileSync(join(root, f), 'utf8');

const html = read('index.html');
const notfound = read('404.html');
const css = read('styles.css');
const js = read('script.js');

let failures = 0;
const fail = (msg) => { failures++; console.error('  FAIL  ' + msg); };
const ok = (msg) => console.log('  pass  ' + msg);

const must = (label, cond) => cond ? ok(label) : fail(label);
const contains = (hay, needle) => hay.includes(needle);

console.log('\nStatic validation\n');

// --- Required files ---------------------------------------------------
const files = [
  'index.html', 'styles.css', 'script.js', '.nojekyll', '404.html',
  'favicon.svg', 'robots.txt', 'sitemap.xml', 'og-image.png', 'README.md',
];
for (const f of files) must('file exists: ' + f, existsSync(join(root, f)));

// --- Locked verbatim facts (must be present, exact) -------------------
const exact = [
  'Go from asking AI questions to directing an agent that can help move real work forward.',
  'can help move real work forward',
  'No coding required',
  'command-line experience',
  'No payment is taken on this site.',
  'Payment is not collected on this website.',
  'Requesting a seat does not reserve a price',
  'Illustrative course walkthrough',
  'Request your seat',
  'Turn my rough notes into a one-page plan for a neighborhood event',
  'Your tuition is determined by the date your completed payment is received.',
  'One program. One small cohort. Only the payment date changes the price.',
  // prices and savings (the six real figures)
  '$1,500', '$1,850', '$2,250', '$750', '$400',
  // dates / schedule / location
  'September 18', '18–20, 2026', 'Tenafly, New Jersey',
  '6:00–9:00 PM', '9:00 AM–5:00 PM', '90-minute lunch',
  // prerequisites / subscription / venue
  'ChatGPT Plus', 'separate from tuition', 'exact venue is shared with enrolled learners',
  // certificate
  'AgentX Certificate of Completion',
  // instructor approved facts
  'Chief Model Risk Officer', '$30B bank', 'McKinsey',
  'NYU Stern MBA', 'CFA', 'FRM',
  'AWS Certified Machine Learning', 'Completed executive AI study at MIT',
  // honest CTA microcopy
  'Opens an email to request enrollment and payment details.',
];
for (const s of exact) must('present: "' + s.slice(0, 52) + (s.length > 52 ? '…' : '') + '"', contains(html, s));

// learning hours 16 across 19
must('present: 16 learning hours', /\b16\b[\s\S]{0,40}(learning|hours)/i.test(html));
must('present: 19 hours on site', /\b19\b[\s\S]{0,40}(hours|site)/i.test(html));

// The exact mailto string from the brief must be used for the CTA.
const mailto = 'mailto:adam.behrman@gmail.com?subject=Agentic%20AI%20Weekend%20enrollment&body=Hi%20Adam%2C%0A%0AI%27m%20interested%20in%20the%20September%2018-20%20Agentic%20AI%20Weekend.%20Please%20send%20enrollment%20and%20payment%20details.%0A';
must('exact brief mailto present', contains(html, mailto));

// --- Structural rules -------------------------------------------------
const h1count = (html.match(/<h1\b/gi) || []).length;
must('exactly one <h1> (found ' + h1count + ')', h1count === 1);

must('has lang attribute', /<html[^>]*lang="en"/.test(html));
must('has canonical to project URL', contains(html, '<link rel="canonical" href="https://abehrman.github.io/agentic-ai-weekend/">'));
must('og:image is absolute project URL', contains(html, 'https://abehrman.github.io/agentic-ai-weekend/og-image.png'));
must('local stylesheet is relative', contains(html, 'href="styles.css"'));
must('local script is relative + deferred', contains(html, 'src="script.js" defer'));
must('JSON-LD Course present', contains(html, '"@type": "Course"'));
must('JSON-LD has three offers (prices 1500/1850/2250)',
  contains(html, '"price": "1500"') && contains(html, '"price": "1850"') && contains(html, '"price": "2250"'));

// Single primary CTA label; the co-equal "Get enrollment details" button is not used.
const seatCount = (html.match(/Request your seat/g) || []).length;
must('primary CTA "Request your seat" repeated at decision points (found ' + seatCount + ')', seatCount >= 3);
must('no co-equal "Get enrollment details" button label', !contains(html, 'Get enrollment details'));

// All three tuition windows always in the DOM.
must('tuition window: early in DOM', contains(html, 'data-window="early"'));
must('tuition window: mid in DOM', contains(html, 'data-window="mid"'));
must('tuition window: full in DOM', contains(html, 'data-window="full"'));
must('current-window marker starts hidden (no-JS shows none)', /data-marker hidden/.test(html));

// --- Forbidden inflations / fake proof / trackers ---------------------
const forbidden = [
  'spots remaining', 'seats remaining', 'seats left', 'last chance', 'act now',
  'countdown', 'limited time', 'only 3 left', 'sold out',
  'job placement', 'guaranteed job', 'salary', 'earn $', 'double your income',
  'testimonial', 'star rating', 'aggregateRating', 'reviewCount',
  // positive university-affiliation claims (the truthful negation is asserted separately)
  'mit program', 'mit-certified', 'accredited by', 'in partnership with',
  'endorsed by', 'official mit', 'university-accredited', 'college credit toward',
  'google-analytics', 'googletagmanager', 'gtag(', 'fbq(', 'hotjar',
  'mixpanel', 'segment.com/analytics', 'data-analytics',
];
const shipped = html + '\n' + css + '\n' + js + '\n' + notfound;
for (const s of forbidden) must('absent (forbidden): "' + s + '"', !shipped.toLowerCase().includes(s.toLowerCase()));

// The required truthful non-affiliation disclaimer must be present.
must('non-affiliation disclaimer present',
  contains(html, 'not presented as MIT, Harvard, or Columbia faculty') &&
  contains(html, 'no university affiliation, accreditation, or transferable academic credit'));

// --- No section-symbol or arrow glyphs in user-facing files -----------
const glyphs = ['§', '→', '←', '↑', '↓', '⇒', '⇐', '⟶', '➜', '➔', '»«'];
for (const g of glyphs) {
  must('no glyph in index.html: ' + g, !html.includes(g));
  must('no glyph in 404.html: ' + g, !notfound.includes(g));
}

// --- 404 uses repo-absolute asset paths (resolve from any deep URL) ---
must('404 stylesheet is repo-absolute', contains(notfound, '/agentic-ai-weekend/styles.css'));

console.log('');
if (failures) {
  console.error(`Static validation: ${failures} check(s) failed.`);
  process.exit(1);
}
console.log('Static validation: all checks passed.');
