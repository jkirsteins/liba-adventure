import { defineConfig } from 'vite';

export default defineConfig({
  // The game source code lives in src/
  base: '/liba-adventure/',
  root: '.',
  publicDir: 'public',
  define: {
    __GIT_HASH__: JSON.stringify(process.env.GIT_HASH || 'dev'),
  },
  build: {
    outDir: 'dist',
  },
  server: {
    // Open the browser automatically when you run "npm run dev"
    open: true,
  },
});
