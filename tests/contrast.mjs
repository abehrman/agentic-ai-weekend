// WCAG 2.x contrast check for every locked color pairing that carries meaning.
// Thresholds come from the design direction: body text >= 7:1, large text / UI /
// CTA >= 4.5:1, amber is graphical (large, non-text) and only reported.
// Run: node tests/contrast.mjs

const T = {
  paper:     '#F5F1E8',
  surface:   '#FBF9F4',
  white:     '#FFFFFF',
  ink:       '#1F1D18',
  inkMuted:  '#514C42',
  green:     '#1B4332',
  greenInk:  '#123528',
  greenWash: '#E7EEE8',
  graphite:  '#4A4842',
  amber:     '#B07A2E',
  hairline:  '#DED8CB',
  footInk:   '#1F1D18',
  footMeta:  '#C9C3B4',
};

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

// [foreground, background, minRatio, description]
// minRatio null => graphical, report only.
const pairs = [
  [T.ink,      T.paper,     7,   'body: ink on paper'],
  [T.ink,      T.surface,   7,   'body: ink on surface'],
  [T.ink,      T.white,     7,   'body: ink on white'],
  [T.ink,      T.greenWash, 7,   'body: ink on green-wash'],
  [T.inkMuted, T.paper,     7,   'body: ink-muted on paper'],
  [T.inkMuted, T.surface,   7,   'body: ink-muted on surface'],
  [T.inkMuted, T.white,     7,   'body: ink-muted on white'],
  [T.inkMuted, T.greenWash, 7,   'body: ink-muted on green-wash'],
  [T.greenInk, T.paper,     4.5, 'label: green-ink on paper'],
  [T.greenInk, T.surface,   4.5, 'label: green-ink on surface'],
  [T.greenInk, T.greenWash, 4.5, 'label: green-ink on green-wash'],
  [T.greenInk, T.white,     4.5, 'label: green-ink on white'],
  [T.graphite, T.surface,   4.5, 'label: graphite on surface'],
  [T.graphite, T.white,     4.5, 'label: graphite on white'],
  [T.white,    T.green,     4.5, 'CTA: white on green'],
  [T.greenWash,T.green,     4.5, 'invite CTA note: green-wash on green'],
  [T.paper,    T.footInk,   7,   'footer: paper on ink'],
  [T.footMeta, T.footInk,   4.5, 'footer meta: light gray on ink'],
  [T.amber,    T.paper,     null,'graphical: amber on paper (non-text)'],
];

let failures = 0;
console.log('Contrast check (locked tokens)\n');
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
