import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const page = await readFile(new URL('../src/pages/ministries.astro', import.meta.url), 'utf8');
const data = await readFile(new URL('../src/data/ministries.ts', import.meta.url), 'utf8');
const handler = await readFile(new URL('../src/lib/server/form-submissions.ts', import.meta.url), 'utf8');

test('ministries use typed local content and real detail links', () => {
  assert.equal(data.includes('https://images.pexels.com'), false);
  assert.match(data, /Biblical Teaching Ministry/);
  assert.match(data, /Prayer and Worship Ministry/);
  assert.match(data, /\/images\/ministries\/mins1\.png/);
  assert.match(page, /src=\{ministry\.thumbnail\}/);
  assert.match(page, /href=\{`\/ministries\/\$\{ministry\.slug\}`\}/);
  assert.equal(page.includes('alert('), false);
});

test('directory filters expose accessible state and result messaging', () => {
  assert.match(page, /aria-pressed=/);
  assert.match(page, /filter-result-count/);
  assert.match(page, /filter-empty-state/);
  assert.match(page, /clear-filters/);
});

test('ministry application requires consent and placement acknowledgement', () => {
  assert.match(page, /name="placementAcknowledgement"/);
  assert.match(page, /name="contactConsent"/);
  assert.match(page, /name="newsletter"/);
  assert.match(handler, /placementAcknowledgement/);
  assert.match(handler, /no automatic subscription/);
});

test('fictional ministry placeholders are removed', () => {
  for (const placeholder of ['Pastor John Doe', 'Pastor Sarah Johnson', 'Youth Ministry', '200+']) {
    assert.equal(page.includes(placeholder), false);
    assert.equal(data.includes(placeholder), false);
  }
});
