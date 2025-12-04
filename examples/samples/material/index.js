import standard from './standard/index.js'
const cullFace = new URL("./cullface.js", import.meta.url)
const materials = new URL("./materials.js", import.meta.url)

export default {
  "cull face": cullFace,
  "materials": materials,
  "standard": standard
}