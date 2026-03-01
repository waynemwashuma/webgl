/**  @import { AstroConfig } from 'astro/config' */
import { loadEnv } from "vite";

const env = loadEnv("", process.cwd(), "");

export default {
  srcDir: "./website",
  site: env.URL || '',
  publicDir: 'assets',
  outDir: 'dist/website',
}
