import { defineConfig } from 'vite';

export default defineConfig({
  // The game source code lives in src/
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
  },
  server: {
    // Open the browser automatically when you run "npm run dev"
    open: true,
  },
});
