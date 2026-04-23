import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../shared')
    }
  },
  server: {
    proxy: {
      '/api': 'http://localhost:4000',
      '/avatars': 'http://localhost:4000',
      '/wallpapers': 'http://localhost:4000'
    }
  }
})
