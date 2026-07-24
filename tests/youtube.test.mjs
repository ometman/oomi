import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import ts from 'typescript';

const root = process.cwd();
const source = fs.readFileSync(path.join(root, 'src/lib/youtube.ts'), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
}).outputText;
const youtube = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);

test('extracts video IDs from supported HTTPS YouTube links', () => {
  const id = 'dQw4w9WgXcQ';
  assert.equal(youtube.getYouTubeVideoId(`https://youtu.be/${id}`), id);
  assert.equal(youtube.getYouTubeVideoId(`https://www.youtube.com/watch?v=${id}`), id);
  assert.equal(youtube.getYouTubeVideoId(`https://youtube.com/shorts/${id}`), id);
  assert.equal(youtube.getYouTubeVideoId(`https://youtube.com/live/${id}`), id);
  assert.equal(youtube.getYouTubeVideoId(`https://youtube.com/embed/${id}`), id);
});

test('rejects spoofed, insecure and malformed video links', () => {
  assert.equal(youtube.getYouTubeVideoId('https://youtube.com.evil.example/watch?v=dQw4w9WgXcQ'), '');
  assert.equal(youtube.getYouTubeVideoId('http://youtube.com/watch?v=dQw4w9WgXcQ'), '');
  assert.equal(youtube.getYouTubeVideoId('https://vimeo.com/dQw4w9WgXcQ'), '');
  assert.equal(youtube.getYouTubeVideoId('https://youtube.com/watch?v=too-short'), '');
});

test('builds privacy-enhanced embed URLs only after validation', () => {
  assert.equal(
    youtube.getYouTubeEmbedUrl('https://youtu.be/dQw4w9WgXcQ'),
    'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&playsinline=1&rel=0',
  );
  assert.equal(youtube.getYouTubeEmbedUrl('javascript:alert(1)'), '');
});

test('player is click-to-load and used by homepage and sermon archive', () => {
  const player = fs.readFileSync(path.join(root, 'src/components/sermons/YouTubePlayer.astro'), 'utf8');
  const home = fs.readFileSync(path.join(root, 'src/components/home/FeaturedSermon.astro'), 'utf8');
  const archive = fs.readFileSync(path.join(root, 'src/pages/sermons.astro'), 'utf8');
  assert.match(player, /data-youtube-play/);
  assert.match(player, /document\.createElement\('iframe'\)/);
  assert.match(player, /strict-origin-when-cross-origin/);
  assert.match(home, /YouTubePlayer/);
  assert.match(archive, /YouTubePlayer/);
});
