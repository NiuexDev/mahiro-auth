import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueDevTools from 'vite-plugin-vue-devtools'
import { execSync } from "node:child_process"

let commitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim()

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VueDevTools(),
  ],
  resolve: { 
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '~': fileURLToPath(new URL('../', import.meta.url))
    }
  },
  build: {
    target: 'esnext',
  },
  define: {
    "import.meta.env.commitHash": JSON.stringify(commitHash),
  },
})
