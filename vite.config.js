import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: './',
  root: path.resolve(__dirname, 'ui'),
  build: {
    outDir: path.resolve(__dirname, 'client'),
    emptyOutDir: false,
  },
});
