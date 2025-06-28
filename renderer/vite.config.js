import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Optimize for low-end hardware
    target: 'es2015', // Better compatibility
    minify: 'terser', // Better compression than esbuild
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        // Code splitting for better memory management
        manualChunks: {
          vendor: ['react', 'react-dom'],
          // Add more chunks as your app grows
        },
        // Optimize chunk size
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Reduce bundle size
    chunkSizeWarningLimit: 1000, // 1MB warning
  },
  // Development optimizations
  server: {
    hmr: {
      overlay: false, // Reduce memory usage
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
})
