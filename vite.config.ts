import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  server: {
    proxy: {
      '/api/aviationweather': {
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/aviationweather/, '/api/data'),
        target: 'https://aviationweather.gov',
      },
    },
  },
})
