import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueDevTools from 'vite-plugin-vue-devtools'
import legacy from '@vitejs/plugin-legacy'
import path from "node:path"

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
      '@': path.join(process.cwd(), "./src"),
      '~': path.join(process.cwd(), "../common")
    }
  },
  build: {
    minify: true,
  },
  define: {
    "import.meta.env.commitHash": process.env.COMMIT_HASH ? JSON.stringify(process.env.COMMIT_HASH) : JSON.stringify(null)
  },
})
