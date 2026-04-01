import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Production-safe config
export default defineConfig({
  plugins: [react()],

  server: {
    host: true
  },

  preview: {
    host: true,
    port: Number(process.env.PORT) || 4173,
    allowedHosts: true // 🔥 allows all hosts (fixes Render issue permanently)
  }
})