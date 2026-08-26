// Runs the full dependency-free test suite. Exits non-zero if anything fails.
// Run: node tests/run.mjs
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const steps = [
  ['node', [join(here, 'marketing.mjs')]],
];

let failed = 0;
for (const [cmd, args] of steps) {
  const r = spawnSync(cmd, args, { stdio: 'inherit' });
  if (r.status !== 0) failed++;
}

console.log(failed ? `\n${failed} test group(s) failed.` : '\nAll test groups passed.');
process.exit(failed ? 1 : 0);
