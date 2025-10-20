import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// ✅ Konfigurasi Vite
export default defineConfig({
  plugins: [react(), tailwindcss()],

  // ✅ Tambahkan proxy ke backend Express (port 4000)
  // server: {
  //   proxy: {
  //     '/api': {
  //       target: 'http://localhost:4000', // arahkan ke backend
  //       changeOrigin: true,
  //       secure: false,
  //     },
  //   },
  // },
})
