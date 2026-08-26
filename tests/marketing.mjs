import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => readFileSync(join(root, file), 'utf8');
const html = read('index.html');
const register = read('register/index.html');
const welcome = read('welcome/index.html');
const terms = read('terms/index.html');
const privacy = read('privacy/index.html');
const notFound = read('404.html');
const socialCard = read('og.html');
const concepts = read('concepts/index.html');
const sitemap = read('sitemap.xml');
const robots = read('robots.txt');
const readme = read('README.md');
const css = read('styles.css');
const js = read('script.js');
let failures = 0;
const must = (label, condition) => condition
  ? console.log('  pass  ' + label)
  : (failures++, console.error('  FAIL  ' + label));

console.log('\nPublic marketing contract — October intensive\n');

must('one H1', (html.match(/<h1\b/gi) || []).length === 1);
must('second-brain promise', /second-brain/i.test(html));
must('superhuman promise', /superhuman/i.test(html));
must('master brand', html.includes('AgentX AI Course'));
must('October course name', html.includes('Agentic AI Intensive'));
for (const fact of [
  'October 5–27, 2026', 'Nine live sessions', '6:30–9:00 PM',
  'Tenafly, New Jersey', '22.5 live hours', 'No coding required',
]) must('fact: ' + fact, html.includes(fact));

for (const pricingWindow of [
  '$1,950', 'Enroll through Sep 13', '$2,250', 'Sep 14–27', '$2,500', 'From Sep 28',
]) must('pricing window: ' + pricingWindow, html.includes(pricingWindow));
must('structured launch deadline', html.includes('"priceValidUntil": "2026-09-13"'));
must('structured standard window', html.includes('"validFrom": "2026-09-14"') && html.includes('"priceValidUntil": "2026-09-27"'));
must('structured full start', html.includes('"validFrom": "2026-09-28"'));
must('registration shows extended launch deadline', register.includes('$1,950 through September 13'));
must('tuition script uses extended boundaries', js.includes("isoDate <= '2026-09-13'") && js.includes("isoDate <= '2026-09-27'"));
must('old pricing windows removed', !/Sep(?:tember)?\s+(?:6|7|20|21)\b|2026-09-(?:06|07|20|21)/i.test(html + register + js + readme));

for (const date of [
  'Mon, Oct 5', 'Tue, Oct 6', 'Mon, Oct 12', 'Tue, Oct 13', 'Wed, Oct 14',
  'Mon, Oct 19', 'Tue, Oct 20', 'Mon, Oct 26', 'Tue, Oct 27',
]) must('session date: ' + date, html.includes(date));

for (const capability of [
  'personal assistant', 'entrepreneurship', 'budget', 'portfolio research',
  'large purchases', 'travel', 'medical decisions', 'doctors', 'discounts',
  'documents', 'photos',
]) must('capability: ' + capability, html.toLowerCase().includes(capability));

for (const section of ['possibilities', 'method', 'fundamentals', 'program', 'instructor', 'enroll', 'faq']) {
  must('section #' + section, new RegExp(`id=["']${section}["']`).test(html));
}

const fundamentals = (html.match(/<section class="fundamentals[\s\S]*?<\/section>/) || [])[0] || '';
for (const concept of [
  'Large language model (LLM)', 'Agent', 'Agentic system', 'Tools', 'Memory',
  'Evidence', 'Human approval',
]) must('fundamental: ' + concept, fundamentals.includes(concept));
for (const sessionMap of [
  'Sessions 1–3', 'Session 4', 'Sessions 4–5', 'Sessions 5 &amp; 8',
  'Sessions 6–7', 'Sessions 4 &amp; 9', 'Every session',
]) must('fundamentals curriculum map: ' + sessionMap, fundamentals.includes(sessionMap));
must('fundamentals require no coding knowledge', fundamentals.includes('No coding knowledge is assumed'));

for (const asset of [
  'assets/multigenerational-agent-workshop.webp',
  'assets/intergenerational-travel-planning.webp',
  'assets/entrepreneur-workflow.png', 'assets/household-decisions.png',
  'assets/life-archive.png', 'assets/adam-behrman.jpg',
]) must('media wired: ' + asset, html.includes(asset) && existsSync(join(root, asset)));

const landingPhotos = [...html.matchAll(/<img\s+[^>]*src=["']([^"']+\.(?:png|jpe?g|webp))["']/gi)]
  .map((match) => match[1]);
must('no landing photo is reused', new Set(landingPhotos).size === landingPhotos.length);

must('register route linked', /href=["']register\//.test(html));
must('checkout configuration hook', /data-checkout-url/.test(register) && /data-checkout-link/.test(register));
must('welcome route exists', existsSync(join(root, 'welcome/index.html')));
must('registration route exists', existsSync(join(root, 'register/index.html')));
must('terms route exists', existsSync(join(root, 'terms/index.html')) && terms.includes('Cancellation, refund, and transfer'));
must('privacy route exists', existsSync(join(root, 'privacy/index.html')) && privacy.includes('Payment data'));
must('registration links policy pages', register.includes('../terms/') && register.includes('../privacy/'));
must('welcome does not expose payment details', !/card number|payment method id|customer id/i.test(welcome));
must('no test Stripe URL shipped', !/buy\.stripe\.com\/test_/i.test(html + register + welcome + terms + privacy + js));

const brandedSurfaces = [html, register, welcome, terms, privacy, notFound, socialCard, concepts];
const publicCopy = [...brandedSurfaces, readme].join('\n');
must('AgentX AI Course brands every public surface', brandedSurfaces.every((page) => page.includes('AgentX AI Course')));
must('course contact is Adam', [html, register, welcome, terms, privacy].every((page) => page.includes('adam.behrman@gmail.com')));
must('canonical uses agentxaicourse.com', html.includes('<link rel="canonical" href="https://agentxaicourse.com/">'));
must('open graph uses agentxaicourse.com', html.includes('content="https://agentxaicourse.com/"') && html.includes('content="https://agentxaicourse.com/og-image.png"'));
must('structured data uses agentxaicourse.com', html.includes('"@id": "https://agentxaicourse.com/#course"') && html.includes('"url": "https://agentxaicourse.com/register/"'));
must('sitemap and robots use agentxaicourse.com', sitemap.includes('<loc>https://agentxaicourse.com/</loc>') && robots.includes('Sitemap: https://agentxaicourse.com/sitemap.xml'));
must('README names public domain', readme.includes('https://agentxaicourse.com/'));
must('old GitHub Pages URL removed from public source', !/abehrman\.github\.io\/agentic-ai-weekend/i.test([html, register, welcome, terms, privacy, notFound, socialCard, concepts, sitemap, robots, readme].join('\n')));
must('concept route redirects to current home', concepts.includes('http-equiv="refresh"') && concepts.includes('<link rel="canonical" href="https://agentxaicourse.com/">'));
must('concept route has no stale September course', !/September 18|16 live instructional hours|Agentic AI Weekend|\$1,500|\$1,850/i.test(concepts));

must('violet action token', /#2b22fa/i.test(css));
must('reduced motion supported', /prefers-reduced-motion:\s*reduce/.test(css));
must('no runtime font request', !/fonts\.googleapis|fonts\.gstatic|use\.typekit/i.test(html));
must('no tracker', !/googletagmanager|google-analytics|gtag\(|fbq\(|hotjar/i.test(html + css + js));
must('no filler storage copy', !/typed work stays|clear local work|course checkmarks|files you downloaded/i.test(html));
must('no stale September offer', !/September 18|16 live instructional hours|Agentic AI Weekend/i.test(brandedSurfaces.join('\n')));
must('no fake social proof', !/testimonial|star rating|students enrolled|spots left/i.test(html));
must('no separate paid AI account prerequisite', !new RegExp(['ChatGPT', 'Plus'].join(' '), 'i').test(publicCopy));
must('no power-accessory requirement', !/charg(?:er|ing)/i.test(publicCopy));
must('no technical Mac chip-family label', !/Apple\s+Silicon/i.test(publicCopy));
must('plain Mac compatibility', html.includes('M1, M2, M3, M4, or newer M-series') && html.includes('About This Mac'));
must('Windows compatibility', [html, register, terms].every((page) => /Windows 10\/11/.test(page)));
must('Intel Mac exclusion is explained', html.includes('Macs showing an Intel processor are not supported'));

console.log('');
if (failures) {
  console.error(`Marketing contract: ${failures} check(s) failed.`);
  process.exit(1);
}
console.log('Marketing contract: all checks passed.');
