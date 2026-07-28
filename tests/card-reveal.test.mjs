import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('shared layout enables progressive card reveals across pages', () => {
  const layout = read('src/layouts/Layout.astro');
  const reveal = read('src/components/CardReveal.astro');
  assert.match(layout, /import CardReveal/);
  assert.match(layout, /<CardReveal \/>/);
  assert.match(reveal, /article\[class\*="rounded-"\]/);
  assert.match(reveal, /IntersectionObserver/);
  assert.match(reveal, /is-site-visible/);
});

test('card reveals preserve existing animations and reduced-motion preferences', () => {
  const reveal = read('src/components/CardReveal.astro');
  assert.match(reveal, /prefers-reduced-motion: reduce/);
  assert.match(reveal, /prefers-reduced-motion: no-preference/);
  assert.match(reveal, /:not\(\.connect-card\)/);
  assert.match(reveal, /:not\(\.upcoming-card\)/);
  assert.match(reveal, /:not\(\.ministry-area-card\)/);
});
