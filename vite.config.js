import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// En Tailwind v4 (@tailwindcss/vite), los plugins NO van aquí.
// Van directamente en tu archivo .css usando @plugin.
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})