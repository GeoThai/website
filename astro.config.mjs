// @ts-check
import { readFileSync } from 'node:fs';

import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, fontProviders } from 'astro/config';
import icon from 'astro-icon';

// https://astro.build/config
export default defineConfig({
  site: 'https://geothai.fasu.dev',
  integrations: [icon(), sitemap({ filter: (page) => !page.endsWith('/404/') })],
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Bai Jamjuree',
      cssVariable: '--font-bai-jamjuree',
      weights: [400, 500, 600],
      styles: ['normal'],
      subsets: ['latin', 'thai'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'JetBrains Mono',
      cssVariable: '--font-jetbrains-mono',
      weights: [400, 500],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['monospace'],
    },
  ],
  vite: {
    plugins: [tailwindcss()],
    define: {
      'import.meta.env.DATA_VERSION': JSON.stringify(readFileSync('data.version', 'utf8').trim()),
    },
  },
});
