const objLoader = new URL("./objloader.js", import.meta.url)
const gltfLoader = new URL("./gltfloader.js", import.meta.url)
const gltfMaterial = new URL("./gltf_material.js", import.meta.url)

export default {
  "obj": objLoader,
  "gltf": gltfLoader,
  "gltf material": gltfMaterial
}