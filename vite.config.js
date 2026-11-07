import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages project sites need the repository name as the base path.
export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_ACTIONS ? '/task-manager-fullstack/' : '/',
})
