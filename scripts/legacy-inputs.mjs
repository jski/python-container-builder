import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

export function newestPatch(minor, refs) {
  if (!['3.9', '3.10'].includes(minor)) throw Error('Unsupported minor: ' + minor);
  const prefix = 'refs/tags/v' + minor + '.';
  const patches = refs.split(/\s+/).filter(ref => ref.startsWith(prefix))
    .map(ref => ref.slice(prefix.length)).filter(patch => /^\d+$/.test(patch));
  if (!patches.length) throw Error('No stable CPython release found for ' + minor);
  return minor + '.' + Math.max(...patches.map(Number));
}

async function pinnedImage(repo, tag) {
  const response = await fetch('https://registry.hub.docker.com/v2/repositories/library/' + repo + '/tags/' + tag);
  if (!response.ok) throw Error('Cannot qualify ' + repo + ':' + tag + ' (HTTP ' + response.status + ')');
  const { digest, images } = await response.json();
  if (!/^sha256:[0-9a-f]{64}$/.test(digest) || !['amd64', 'arm64'].every(
    arch => images.some(image => image.os === 'linux' && image.architecture === arch)
  )) throw Error('Incomplete multi-platform image: ' + repo + ':' + tag);
  return repo + ':' + tag + '@' + digest;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const minor = process.argv[2];
  const refs = execFileSync('git', ['ls-remote', '--tags', '--refs',
    'https://github.com/python/cpython.git', 'refs/tags/v' + minor + '.*'], { encoding: 'utf8' });
  const patch = newestPatch(minor, refs);
  console.log('PATCH=' + patch);
  console.log('PYTHON_IMAGE=' + await pinnedImage('python', patch + '-slim-bookworm'));
  console.log('DEBIAN_IMAGE=' + await pinnedImage('debian', 'bookworm-slim'));
}
