import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      input: {
        // Sito pubblico
        main: resolve(__dirname, 'index.html'),
        // Area riservata agenti: entry separato, nessun impatto sul sito pubblico
        areaAgenti: resolve(__dirname, 'area-agenti/index.html'),
      },
    },
  },
})
