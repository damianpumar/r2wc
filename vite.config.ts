import { resolve } from "path";
import { defineConfig } from "Vite";
import react from "@Vitejs/plugin-react";
import typescript from "@rollup/plugin-typescript";

export default defineConfig(() => ({
  plugins: [react(), typescript()],
  define: {
    "process.env.NODE_ENV": '"production"',
  },
  build: {
    minify: false,
    lib: {
      formats: ["es", "umd"],
      entry: resolve(__dirname, "src/index.ts"),
      name: "index",
      fileName: (format) => `index.${format}.js`,
    },
  },
}));
