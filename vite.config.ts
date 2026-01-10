import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // Open the dev server in Opera by default on Windows.
    // Update the path below if Opera is installed in a different location.
    open: {
      app: {
        name: 'C:\\Program Files\\Opera\\launcher.exe'
      }
    }
  }
})
