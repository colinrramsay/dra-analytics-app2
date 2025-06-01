import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  build: {
    // Set the output directory to the server/dist folder
    outDir: path.resolve(__dirname, '../server/dist'),
    // Ensure that the assets are properly referenced
    emptyOutDir: true,
  },
  server: {
    proxy: {
      // Proxy all /single requests to your backend server
      '/single': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
      // Add proxy for shutdown endpoint
      '/shutdown': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
      // Proxy all /volume requests to your backend server
      '/volume': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    }
  }
})
