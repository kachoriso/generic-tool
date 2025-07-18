import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      external: [],  // Empty external to ensure all dependencies are bundled
      output: {
        manualChunks: {
          // Explicitly group react-router-dom with other vendor libraries
          'vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'mui': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    force: true  // Force re-optimization
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      // Ensure react-router-dom uses the correct React instance
      'react-router-dom': 'react-router-dom'
    }
  }
})
