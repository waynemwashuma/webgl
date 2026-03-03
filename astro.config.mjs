import { defineConfig } from "astro/config";
import path from "node:path";
import remarkGfm from "remark-gfm";
import remarkGithubBlockquoteAlert from "remark-github-blockquote-alert";
import remarkLinkBase from "./website/plugins/remark-link-base.js";

export default defineConfig({
  output:'static',
  srcDir: "./website",
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
      remarkLinkBase,
    ],
  },
});
