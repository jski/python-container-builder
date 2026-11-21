import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const digestPattern = /^sha256:[0-9a-f]{64}$/;

export function newestPatch(minor, refs) {
  const prefix = 'refs/tags/v' + minor + '.';
  const patches = refs.split(/\s+/).filter(ref => ref.startsWith(prefix))
    .map(ref => ref.slice(prefix.length)).filter(patch => /^\d+$/.test(patch));
  if (!patches.length) throw Error('No stable CPython release found for ' + minor);
  return minor + '.' + Math.max(...patches.map(Number));
}

export function validate(rows) {
  if (!Array.isArray(rows) || rows.filter(row => row.latest === true).length !== 1)
    throw Error('Select exactly one latest image');
  const minors = new Set();
  for (const row of rows) {
    if (!/^3\.\d+$/.test(row.python_version) || minors.has(row.python_version) ||
        !/^3\.\d+\.\d+$/.test(row.patch) || !row.patch.startsWith(row.python_version + '.') ||
        !/^[a-z]+$/.test(row.debian_version) || typeof row.latest !== 'boolean' ||
        !digestPattern.test(row.python_digest) || !digestPattern.test(row.debian_digest))
      throw Error('Invalid version entry: ' + JSON.stringify(row));
    minors.add(row.python_version);
  }
}

async function resolveDigest(repository, tag) {
  const response = await fetch('https://registry.hub.docker.com/v2/repositories/library/' + repository + '/tags/' + tag);
  if (!response.ok) throw Error(repository + ':' + tag + ' returned ' + response.status);
  const { images, digest } = await response.json();
  if (!digestPattern.test(digest) || !['amd64', 'arm64'].every(arch =>
    images.some(image => image.os === 'linux' && image.architecture === arch)
  )) throw Error('Incomplete multi-platform image: ' + repository + ':' + tag);
  return digest;
}

export async function refresh(rows, refs, resolve = resolveDigest) {
  validate(rows);
  const result = [];
  const errors = [];
  for (const row of rows) {
    try {
      const patch = newestPatch(row.python_version, refs);
      const python_digest = await resolve('python', patch + '-slim-' + row.debian_version);
      const debian_digest = await resolve('debian', row.debian_version + '-slim');
      if (!digestPattern.test(python_digest) || !digestPattern.test(debian_digest))
        throw Error('Invalid registry digest');
      result.push({ ...row, patch, python_digest, debian_digest });
    } catch (error) {
      errors.push(row.python_version + ': ' + error.message);
      result.push(row);
    }
  }
  return { result, errors };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const file = new URL('../versions.json', import.meta.url);
  const rows = JSON.parse(readFileSync(file, 'utf8'));
  validate(rows);
  if (process.argv.includes('--refresh')) {
    const refs = execFileSync('git', ['ls-remote', '--refs', '--tags',
      'https://github.com/python/cpython.git', 'refs/tags/v3.*'], { encoding: 'utf8' });
    const { result: updated, errors } = await refresh(rows, refs);
    for (const message of errors) console.error(message);
    if (errors.length) process.exitCode = 1;
    if (JSON.stringify(rows) !== JSON.stringify(updated))
      writeFileSync(file, JSON.stringify(updated, null, 2) + '\n');
  } else {
    console.log(JSON.stringify({ include: rows }));
  }
}
