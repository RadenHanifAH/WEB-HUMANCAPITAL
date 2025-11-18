import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// ✅ Konfigurasi Vite
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
