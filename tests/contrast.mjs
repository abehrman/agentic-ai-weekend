// WCAG 2.x contrast check for every locked Clearance Bench color pairing that
// carries meaning. Thresholds from the design direction: body text >= 7:1,
// large text / UI / CTA control copy >= 4.5:1, ambient accents on the bench are
// graphical (large, non-text) and only reported.
// Run: node tests/contrast.mjs

// The dark workshop tokens (see .design/sol-native-spatial.md).
const T = {
  floor:  '#111619', // primary background (linoleum floor) + deep ink on controls
  bench:  '#28312F', // raised work surface
  chalk:  '#F4F1E8', // primary text
  zinc:   '#B9C2BE', // secondary text and rails
  orange: '#E85D36', // human-required action, CTA fill, focus
  blue:   '#7FA7B8', // admitted / checked information
};
T.ink = T.floor; // deep ink used on orange and blue controls is the floor color

function lin(c) {
  c /= 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}
function lum(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}
function ratio(a, b) {
  const L1 = lum(a), L2 = lum(b);
  const hi = Math.max(L1, L2), lo = Math.min(L1, L2);
  return (hi + 0.05) / (lo + 0.05);
}

// [foreground, background, minRatio, description]  (minRatio null => graphical)
const pairs = [
  // Body-strength text.
  [T.chalk, T.floor, 7,   'body: chalk on floor'],
  [T.chalk, T.bench, 7,   'body: chalk on bench'],
  [T.zinc,  T.floor, 7,   'secondary: zinc on floor'],
  [T.zinc,  T.bench, 7,   'secondary: zinc on bench'],
  [T.blue,  T.floor, 7,   'admitted info: blue on floor'],
  // Labels / UI / control copy.
  [T.blue,  T.bench, 4.5, 'label: blue on bench'],
  [T.ink,   T.orange, 4.5, 'CTA: deep ink on signal orange'],
  [T.ink,   T.blue,   4.5, 'control: deep ink on daylight blue'],
  [T.orange, T.floor, 4.5, 'accent/focus: signal orange on floor'],
  // Ambient accents, non-text.
  [T.orange, T.bench, null, 'graphical: signal orange on bench (non-text)'],
];

let failures = 0;
console.log('Contrast check (Clearance Bench tokens)\n');
for (const [fg, bg, min, desc] of pairs) {
  const r = ratio(fg, bg);
  const rr = r.toFixed(2).padStart(6);
  if (min === null) {
    console.log(`  graphical  ${rr}:1  ${desc}`);
    continue;
  }
  const ok = r >= min;
  if (!ok) failures++;
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${rr}:1  (>= ${min})  ${desc}`);
}

console.log('');
if (failures) {
  console.error(`Contrast: ${failures} pairing(s) below threshold.`);
  process.exit(1);
}
console.log('Contrast: all text pairings meet their thresholds.');
