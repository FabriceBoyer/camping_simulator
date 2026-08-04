import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Set BASE_PATH (e.g. "/my-repo/") when building for a GitHub Pages
  // project site. Defaults to "/" for local dev, Docker, and custom domains.
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
})
