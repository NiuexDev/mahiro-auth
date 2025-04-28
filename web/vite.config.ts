import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueDevTools from 'vite-plugin-vue-devtools'

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
    "import.meta.env.commitHash": process.env.COMMIT_HASH ? JSON.stringify(process.env.COMMIT_HASH) : JSON.stringify("__COMMIT_HASH__".slice(0, 7)),
    "import.meta.env.longCommitHash": process.env.COMMIT_HASH ? JSON.stringify(process.env.COMMIT_HASH) : JSON.stringify("__COMMIT_HASH__"),
  },
})
