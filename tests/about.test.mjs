import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = process.cwd();
const about = fs.readFileSync(path.join(root, 'src/pages/about.astro'), 'utf8');
const aboutData = fs.readFileSync(path.join(root, 'src/data/about.ts'), 'utf8');
const header = fs.readFileSync(path.join(root, 'src/components/Header.astro'), 'utf8');
const footer = fs.readFileSync(path.join(root, 'src/components/Footer.astro'), 'utf8');
const layout = fs.readFileSync(path.join(root, 'src/layouts/Layout.astro'), 'utf8');
const combined = `${about}\n${aboutData}`;

test('About page has one page H1 and the shared header does not add another', () => {
  assert.equal((about.match(/<h1\b/g) || []).length, 1);
  assert.equal((header.match(/<h1\b/g) || []).length, 0);
  assert.match(about, />About Omet Omeni Ministries<\/h1>/);
});

test('About page includes the approved ministry structure and audiences', () => {
  for (const heading of [
    'Who we are',
    'Our Vision and Mission',
    'Our Ministry Mandate',
    'Our story',
    'What We Believe',
    'Meet the ministry lead',
    'Accra, Kumasi and Online',
    'Governance and trust',
    'Take Your Next Step',
  ]) {
    assert.match(combined.toLowerCase(), new RegExp(heading.toLowerCase()));
  }
  assert.match(about, /ministryLocations/);
  assert.match(about, /Founder and Ministry Lead/);
});

test('About page excludes unapproved legacy content and remote images', () => {
  assert.doesNotMatch(combined, /Christian Life Centre|Royal Cockpit|Ahodwo-Nhyiaeso/i);
  assert.doesNotMatch(combined, /Pastor John Doe|Pastor Sarah Johnson|Elder Michael Asante/i);
  assert.doesNotMatch(combined, /multiple churches planted|small gathering|thriving church/i);
  assert.doesNotMatch(about, /https?:\/\/|pexels/i);
  assert.doesNotMatch(`${footer}\n${layout}`, /Royal Cockpit|Ahodwo-Nhyiaeso/i);
});

test('About page uses the approved local hero and ministry lead images', () => {
  assert.match(about, /oomi-about-hero\.png/);
  assert.match(about, /ometomeni-portrait\.png/);
  assert.match(about, /alt="Omet Omeni, Founder and Ministry Lead"/);
  assert.match(about, /Rev\. Omet Yawelis Omeni/);
  assert.match(about, /disabled aria-disabled="true"[^>]*>Meet The Team/);
});

test('About calls to action use existing routes', () => {
  for (const route of ['/ministries', '/plan-your-visit', '/events', '/contact', '/sermons']) {
    assert.equal(fs.existsSync(path.join(root, 'src/pages', `${route.slice(1)}.astro`)), true);
    assert.match(about, new RegExp(route.replaceAll('/', '\\/').replace('-', '\\-')));
  }
});
