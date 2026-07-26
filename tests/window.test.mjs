// Unit tests for the pure tuition-window logic. No system clock, no DOM.
// Run: node --test tests/window.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { windowFor } = require('../script.js');

test('early window is inclusive through Aug 15', () => {
  assert.equal(windowFor('2026-07-26'), 'early');
  assert.equal(windowFor('2026-08-01'), 'early');
  assert.equal(windowFor('2026-08-15'), 'early');
});

test('mid window covers Aug 16 through Sep 5 inclusive', () => {
  assert.equal(windowFor('2026-08-16'), 'mid');
  assert.equal(windowFor('2026-08-31'), 'mid');
  assert.equal(windowFor('2026-09-05'), 'mid');
});

test('full window applies after Sep 5', () => {
  assert.equal(windowFor('2026-09-06'), 'full');
  assert.equal(windowFor('2026-09-20'), 'full');
  assert.equal(windowFor('2026-12-31'), 'full');
});

test('boundary flips exactly at the two deadlines', () => {
  // Simulated midnight boundary crossings (the checklist requirement).
  assert.notEqual(windowFor('2026-08-15'), windowFor('2026-08-16'));
  assert.notEqual(windowFor('2026-09-05'), windowFor('2026-09-06'));
});
