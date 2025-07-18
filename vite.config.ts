import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2018',
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
    include: [
      'react', 
      'react-dom', 
      'react-router-dom',
      '@mui/material',
      '@mui/icons-material',
      '@emotion/react',
      '@emotion/styled'
    ],
    force: true  // Force re-optimization
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Ensure proper module resolution
      'react-router-dom': path.resolve(__dirname, './node_modules/react-router-dom')
    }
  },
  // Ensure proper resolution for all environments
  esbuild: {
    target: 'es2018'
  }
})
