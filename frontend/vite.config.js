import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  
  return {
    plugins: [react()],
    
    // Development server configuration
    server: {
      port: 3000,
      host: true, // Allow external connections
      proxy: {
        '/api': {
          target: process.env.VITE_API_BASE_URL || 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '/api')
        }
      }
    },
    
    // Build configuration
    build: {
      outDir: 'dist',
      sourcemap: !isProduction, // Source maps only in development
      minify: isProduction ? 'terser' : false,
      rollupOptions: {
        output: {
          manualChunks: {
            // Split vendor chunks for better caching
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            utils: ['axios', 'jwt-decode']
          }
        }
      },
      // Increase chunk size warning limit
      chunkSizeWarningLimit: 1000,
      // Optimize for manual deployment
      assetsDir: 'assets',
      emptyOutDir: true
    },
    
    // Preview server configuration (for local testing of build)
    preview: {
      port: 3000,
      host: true
    },
    
    // Define global constants
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      __BUILD_MODE__: JSON.stringify(mode)
    },
    
    // Environment file loading order
    envDir: '.',
    envPrefix: 'VITE_'
  }
})
