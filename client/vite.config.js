import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  root: __dirname,
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
    manifest: true, // needed so prerender.mjs can map dev-mode /src/assets/*
                     // URLs (from vite.ssrLoadModule) to the real hashed
                     // production URLs vite build already emitted.
    assetsInlineLimit: 0, // keep every asset as a real emitted file (with a
                           // manifest entry) instead of inlining small ones
                           // as base64 — prerender.mjs's URL rewrite needs a
                           // real file to point every /src/assets/* URL at.
  },
  server: {
    port: 5173,
  },
})
