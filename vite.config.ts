import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base relativo: el sitio funciona en cualquier hosting o subcarpeta
export default defineConfig({
  base: './',
  plugins: [react()],
  build: { chunkSizeWarningLimit: 1500 },
})
