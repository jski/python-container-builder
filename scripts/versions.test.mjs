import test from 'node:test';
import assert from 'node:assert/strict';
import { newestPatch, refresh, validate } from './versions.mjs';

const old = 'sha256:' + 'a'.repeat(64);
const next = 'sha256:' + 'b'.repeat(64);
const refs = 'refs/tags/v3.14.1';
const row = { python_version: '3.14', debian_version: 'bookworm', latest: true, patch: '3.14.1', python_digest: old, debian_digest: old };

test('upstream changes are isolated and a repeated refresh is stable', async () => {
  const resolve = async repo => repo === 'debian' ? next : old;
  const updated = (await refresh([row], refs, resolve)).result;
  assert.deepEqual(updated, [{ ...row, debian_digest: next }]);
  assert.deepEqual((await refresh(updated, refs, resolve)).result, updated);
});

test('bad upstream results cannot produce an update', async () => {
  const second = { ...row, python_version: '3.13', patch: '3.13.1', latest: false };
  const { result, errors } = await refresh([row, second], refs + ' refs/tags/v3.13.2', async (repo, tag) => {
    if (tag.startsWith('3.14.')) throw Error('upstream missing');
    return next;
  });
  assert.equal(errors.length, 1);
  assert.deepEqual(result[0], row);
  assert.equal(result[1].patch, '3.13.2');
});

test('a new minor appears once and exactly one minor owns latest', () => {
  const rows = [{ ...row, latest: false }, { ...row, python_version: '3.15', patch: '3.15.0' }];
  validate(rows);
  assert.throws(() => validate([...rows, rows[0]]));
  assert.throws(() => validate([row, rows[1]]));
});

test('selects the newest stable upstream patch independently of Docker aliases', () => {
  const refs = ['3.9.9', '3.9.25', '3.9.23', '3.9.26rc1', '3.10.30'].map(v => 'hash\trefs/tags/v' + v).join('\n');
  assert.equal(newestPatch('3.9', refs), '3.9.25');
  assert.throws(() => newestPatch('3.9', 'hash\trefs/tags/v3.9.26rc1'));
});
