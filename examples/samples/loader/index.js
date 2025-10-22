const objLoader = new URL("./objloader.js", import.meta.url)
const gltfLoader = new URL("./gltfloader.js", import.meta.url)

export default {
  "obj": objLoader,
  "gltf": gltfLoader,
}