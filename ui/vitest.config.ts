import { defineConfig } from "vitest/config"

// https://vitejs.dev/config/
// in its own file to make typescript happy
export default defineConfig({
  test: {
    // automatically inject describe/it/test into tests
    globals: true,
  },
})
