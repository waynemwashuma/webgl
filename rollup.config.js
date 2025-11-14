import { readFileSync } from "fs"
import { resolve } from "path"
import { cwd } from "process"

const pkg = JSON.parse(readFileSync(resolve(cwd(), "./package.json")).toString())

const input = "src/index.js"
const created = `2023-${new Date().getFullYear()}`
const name = pkg.name.toUpperCase()
  .replace("@", "")
  .replaceAll("/", "_")
  .replaceAll("-", "_")
const banner = `/*
 * @author ${pkg.author}
 * @copyright  ${created} ${pkg.author}
 * {@link ${pkg.repository.url}}
 *
 * @license ${pkg.license}
 * @version ${pkg.version}
 */`
export default [{

  // UMD
  input,
  output: {
    file: "dist/index.umd.js",
    format: "umd",
    name,
    esModule: false,
    exports: "named",
    sourcemap: true,
    banner
  }
},
{

  // ESM
  input,
  output: {
    file: "dist/index.module.js",
    format: "esm",
    exports: "named",
    sourcemap: true,
    banner
  },
}]