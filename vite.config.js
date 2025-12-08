import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Replace 'simcfb-map' with your actual repository name
export default defineConfig({
  plugins: [react()],
  base: '/simcfb-map/', 
})