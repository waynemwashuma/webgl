import { defineConfig } from "astro/config";
import path from "node:path";
import { loadEnv } from "vite";

const env = loadEnv("", process.cwd(), "");

export default defineConfig({
  srcDir: "./website",
  site: env.URL || "",
  publicDir: "./assets",
  outDir: "./dist/website",
  vite: {
    resolve: {
      alias: {
        "webgllis": path.resolve("./src/index.js"),
        "@configs": path.resolve("./website/config"),
        "@layouts": path.resolve("./website/layouts"),
        "@components": path.resolve("./website/components"),
      }
    }
  }
});
