// Unit tests for the pure tuition-window logic. No system clock, no DOM.
// Run: node --test tests/window.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { priceWindow: windowFor } = require('../script.js');

test('launch window is inclusive through September 13', () => {
  assert.equal(windowFor('2026-08-26'), 'launch');
  assert.equal(windowFor('2026-09-01'), 'launch');
  assert.equal(windowFor('2026-09-13'), 'launch');
});

test('standard window covers September 14 through 27 inclusive', () => {
  assert.equal(windowFor('2026-09-14'), 'standard');
  assert.equal(windowFor('2026-09-20'), 'standard');
  assert.equal(windowFor('2026-09-27'), 'standard');
});

test('full window applies from September 28', () => {
  assert.equal(windowFor('2026-09-28'), 'full');
  assert.equal(windowFor('2026-10-05'), 'full');
  assert.equal(windowFor('2026-12-31'), 'full');
});

test('boundary flips exactly at the two deadlines', () => {
  assert.notEqual(windowFor('2026-09-13'), windowFor('2026-09-14'));
  assert.notEqual(windowFor('2026-09-27'), windowFor('2026-09-28'));
});
