export const rotatingCube = new URL('./rotatingCube.js', import.meta.url)
export const rotatingSphere = new URL('./rotatingSphere.js', import.meta.url)
export const textureWrap = new URL("./textureWrap.js", import.meta.url)
export const materials = new URL("./materials.js", import.meta.url)
export const meshTopology = new URL("./meshTopology.js", import.meta.url)
export const geometries = new URL("./geometries.js", import.meta.url)
export const cullFace = new URL("./cullface.js", import.meta.url)
export const skyBox = new URL("./skybox.js", import.meta.url)
export const objLoader = new URL("./objloader.js", import.meta.url)
export const gltfLoader = new URL("./gltfloader.js", import.meta.url)
export const separateSamplers = new URL("./separateSampler.js", import.meta.url)
export const transformPropagation = new URL("./transformPropagation.js", import.meta.url)

export const demos = {
  "mesh topology": meshTopology,
  "rotating sphere": rotatingSphere,
  "rotating cube": rotatingCube,
  "separate samplers": separateSamplers,
  "texture wrap": textureWrap,
  "materials": materials,
  "geometries": geometries,
  "cullface": cullFace,
  "skybox": skyBox,
  "obj loader": objLoader,
  "gltf loader": gltfLoader,
  "transform propagation": transformPropagation,
}