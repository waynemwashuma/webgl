import { defineConfig } from "astro/config";
import path from "node:path";
import { loadEnv } from "vite";
import remarkGfm from "remark-gfm";
import remarkGithubBlockquoteAlert from "remark-github-blockquote-alert";

const env = loadEnv("", process.cwd(), "");

export default defineConfig({
  srcDir: "./website",
  site: env.URL || undefined,
  base: env.URL_BASE || undefined,
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
  },
  markdown: {
    remarkPlugins: [
      remarkGfm,
      remarkGithubBlockquoteAlert,
    ],
  },
});
