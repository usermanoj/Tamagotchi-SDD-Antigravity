import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',
  base: '/Tamagotchi-SDD-Antigravity/',
  publicDir: '../public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    open: true,
  },
});
