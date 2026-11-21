import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const digestPattern = /^sha256:[0-9a-f]{64}$/;

export function validate(rows) {
  if (!Array.isArray(rows) || rows.filter(row => row.latest === true).length !== 1)
    throw Error('Select exactly one latest image');
  const minors = new Set();
  for (const row of rows) {
    if (!/^3\.\d+$/.test(row.python_version) || minors.has(row.python_version) ||
        !/^[a-z]+$/.test(row.debian_version) || typeof row.latest !== 'boolean' ||
        !digestPattern.test(row.python_digest) || !digestPattern.test(row.debian_digest))
      throw Error('Invalid version entry: ' + JSON.stringify(row));
    minors.add(row.python_version);
  }
}

async function resolveDigest(repository, tag) {
  const response = await fetch('https://registry.hub.docker.com/v2/repositories/library/' + repository + '/tags/' + tag);
  if (!response.ok) throw Error(repository + ':' + tag + ' returned ' + response.status);
  return (await response.json()).digest;
}

export async function refresh(rows, resolve = resolveDigest) {
  validate(rows);
  const result = [];
  for (const row of rows) {
    const python_digest = await resolve('python', row.python_version + '-slim-' + row.debian_version);
    const debian_digest = await resolve('debian', row.debian_version + '-slim');
    result.push({ ...row, python_digest, debian_digest });
  }
  validate(result);
  return result;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const file = new URL('../versions.json', import.meta.url);
  const rows = JSON.parse(readFileSync(file, 'utf8'));
  validate(rows);
  if (process.argv.includes('--refresh')) {
    const updated = await refresh(rows);
    if (JSON.stringify(rows) !== JSON.stringify(updated))
      writeFileSync(file, JSON.stringify(updated, null, 2) + '\n');
  } else {
    console.log(JSON.stringify({ include: rows }));
  }
}
