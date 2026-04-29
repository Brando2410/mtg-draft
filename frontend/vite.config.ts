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
      '/api': {
        target: 'http://127.0.0.1:4000',
        changeOrigin: true
      },
      '/socket.io': {
        target: 'http://127.0.0.1:4000',
        ws: true,
        changeOrigin: true
      },
      '/avatars': {
        target: 'http://127.0.0.1:4000',
        changeOrigin: true
      },
      '/wallpapers': {
        target: 'http://127.0.0.1:4000',
        changeOrigin: true
      }
    }
  }
})
