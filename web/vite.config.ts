import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueDevTools from 'vite-plugin-vue-devtools'
import legacy from '@vitejs/plugin-legacy'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VueDevTools(),
    legacy({
      targets: ["last 8 years"],
    })
  ],
  resolve: { 
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '~': fileURLToPath(new URL('../', import.meta.url))
    }
  },
  build: {
    minify: true,
  },
  define: {
    "import.meta.env.commitHash": process.env.COMMIT_HASH ? JSON.stringify(process.env.COMMIT_HASH) : JSON.stringify(null)
  },
})
