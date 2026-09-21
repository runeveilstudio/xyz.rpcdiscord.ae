import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// CEP runs on file:// with an old Chromium build that:
//   1. Breaks on crossorigin attributes for local assets
//   2. Has broken/partial ES module support (type="module" scripts silently fail)
// This plugin strips crossorigin from the final HTML output.
function cepCompatPlugin() {
  return {
    name: 'cep-strip-crossorigin',
    transformIndexHtml(html) {
      return html
        .replace(/<script([^>]*) crossorigin([^>]*)>/g, '<script$1$2>')
        .replace(/<link([^>]*) crossorigin([^>]*)>/g, '<link$1$2>')
        .replace(/<script([^>]*) type="module"([^>]*)>/g, '<script$1$2>');
    }
  };
}

export default defineConfig({
  plugins: [react(), cepCompatPlugin()],
  base: './',
  root: path.resolve(__dirname, 'ui'),
  build: {
    outDir: path.resolve(__dirname, 'client'),
    emptyOutDir: false,
    target: 'es2019',
    // Build as a classic IIFE — no type="module", works on CEP's old Chromium
    lib: false,
    rollupOptions: {
      output: {
        format: 'iife',
        entryFileNames: 'assets/app.js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
  },
});
