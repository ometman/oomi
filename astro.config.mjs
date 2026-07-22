import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://ometomeni.org',
  integrations: [
    tailwind(),
    sitemap(),
    mdx()
  ],
  adapter: vercel(),
  output: 'static'
});
