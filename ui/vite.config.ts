import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    sourcemap: true,
    // ignore
    chunkSizeWarningLimit: 1_000_000,
  },
  server: {
    proxy: {
      "/api": "http://127.0.0.1:8000",
    },
  },
})
