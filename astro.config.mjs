// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import partytown from '@astrojs/partytown';
import node from '@astrojs/node';

export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [partytown()],
  output: "server",
  adapter: node({
    mode:"standalone"
  }),
});