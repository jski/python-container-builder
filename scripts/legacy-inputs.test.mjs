import assert from 'node:assert/strict';
import test from 'node:test';
import { newestPatch } from './legacy-inputs.mjs';

test('selects the newest stable upstream patch independently of Docker aliases', () => {
  const refs = ['3.9.9', '3.9.25', '3.9.23', '3.9.26rc1', '3.10.30'].map(v => 'hash\trefs/tags/v' + v).join('\n');
  assert.equal(newestPatch('3.9', refs), '3.9.25');
  assert.throws(() => newestPatch('3.9', 'hash\trefs/tags/v3.9.26rc1'));
});
