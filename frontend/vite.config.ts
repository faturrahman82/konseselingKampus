import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: 'es2020',
    // Hapus console.log & debugger di production
    minify: 'esbuild',
    rollupOptions: {
      output: {
        // Pisahkan vendor dan page chunks untuk caching lebih baik
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor'
            }
            if (id.includes('lucide-react')) {
              return 'icons'
            }
            if (id.includes('axios') || id.includes('sonner')) {
              return 'utils'
            }
            return 'vendor'
          }
        },
      },
    },
  },
  esbuild: {
    // Hapus console & debugger di production build
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  } as any,
})
