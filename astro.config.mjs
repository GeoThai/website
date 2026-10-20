// @ts-check
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, fontProviders } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://geothai.fasu.dev',
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
  },
});
