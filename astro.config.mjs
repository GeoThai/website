// @ts-check
import { readFileSync } from 'node:fs';

import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import { defineConfig, fontProviders } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://geothai.fasu.dev',
  integrations: [icon()],
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
  ],
  vite: {
    plugins: [tailwindcss()],
    define: {
      'import.meta.env.DATA_VERSION': JSON.stringify(readFileSync('data.version', 'utf8').trim()),
    },
  },
});
