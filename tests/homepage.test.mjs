import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const homepage = read('src/pages/index.astro');
const homeComponents = fs.readdirSync(path.join(root, 'src/components/home'))
  .map((file) => read(`src/components/home/${file}`))
  .join('\n');

test('homepage composes the required ministry sections', () => {
  for (const component of [
    'HomeHero', 'MinistryPillars', 'VisionMission', 'FeaturedSermon',
    'UpcomingEvents', 'MinistryOverview', 'LocationConnection',
    'HomeNewsletter', 'HomeCTA',
  ]) assert.match(homepage, new RegExp(`<${component}`));
});

test('homepage contains no old template copy, dates, remote Pexels images or placeholder links', () => {
  const source = `${homepage}\n${homeComponents}`;
  assert.doesNotMatch(source, /Christian Life Centre|December 25, 2024|January 1, 2025|pexels\.com|href=["']#["']/i);
  assert.doesNotMatch(source, /Ready to Join Our Community|Get Directions/i);
});

test('homepage represents Accra, Kumasi and online and has one page heading', () => {
  const source = `${homepage}\n${homeComponents}`;
  assert.match(source, /Accra/);
  assert.match(source, /Kumasi/);
  assert.match(source, /Online/i);
  assert.equal((source.match(/<h1\b/g) || []).length, 1);
});

test('homepage uses approved event and sermon sources', () => {
  assert.match(homepage, /getUpcomingApprovedEvents/);
  assert.match(homepage, /getLatestPublishedSermon/);
  assert.match(read('src/data/events.ts'), /approved/);
  assert.match(read('src/data/sermons.ts'), /published/);
});

test('featured message exposes YouTube playback, message details and engagement metrics', () => {
  const featured = read('src/components/home/FeaturedSermon.astro');
  const sermons = read('src/data/sermons.ts');
  assert.match(featured, /Featured Message/);
  assert.match(featured, /YouTubePlayer/);
  assert.match(featured, /Play Video/);
  assert.match(featured, /Listen/);
  assert.match(featured, /Scripture references/);
  assert.match(featured, /Views/);
  assert.match(featured, /Likes/);
  assert.match(featured, /Comments/);
  assert.match(sermons, /series:/);
  assert.match(sermons, /scriptureReferences:/);
  assert.match(sermons, /viewCount:/);
});

test('sermon archive shares the approved source and contains no legacy sample content', () => {
  const archive = read('src/pages/sermons.astro');
  assert.match(archive, /getPublishedSermons/);
  assert.match(archive, /NewsletterSignup/);
  assert.doesNotMatch(archive, /Pastor John Doe|Pastor Sarah Johnson|pexels\.com|href=["']#["']|2024-/i);
});
