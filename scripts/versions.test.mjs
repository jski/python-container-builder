import test from 'node:test';
import assert from 'node:assert/strict';
import { refresh, validate } from './versions.mjs';

const old = 'sha256:' + 'a'.repeat(64);
const next = 'sha256:' + 'b'.repeat(64);
const row = { python_version: '3.14', debian_version: 'bookworm', latest: true, python_digest: old, debian_digest: old };

test('upstream changes are isolated and a repeated refresh is stable', async () => {
  const resolve = async repo => repo === 'debian' ? next : old;
  const updated = await refresh([row], resolve);
  assert.deepEqual(updated, [{ ...row, debian_digest: next }]);
  assert.deepEqual(await refresh(updated, resolve), updated);
});

test('bad upstream results cannot produce an update', async () => {
  await assert.rejects(refresh([row], async () => 'unknown'));
  await assert.rejects(refresh([row], async () => { throw Error('offline'); }));
});

test('a new minor appears once and exactly one minor owns latest', () => {
  const rows = [{ ...row, latest: false }, { ...row, python_version: '3.15' }];
  validate(rows);
  assert.throws(() => validate([...rows, rows[0]]));
  assert.throws(() => validate([row, rows[1]]));
});
