import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Configuracion de build/dev para Vue 3 en Vite.
export default defineConfig({
  // Plugin oficial para compilar archivos .vue.
  plugins: [vue()],
})
