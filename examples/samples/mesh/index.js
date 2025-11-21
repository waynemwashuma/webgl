const meshTopology = new URL("./meshTopology.js", import.meta.url)
const geometries = new URL("./geometries.js", import.meta.url)
const plane = new URL("./plane.js", import.meta.url)
const uvSphere = new URL("./uvsphere.js", import.meta.url)
const cuboid = new URL("./cuboid.js", import.meta.url)
const circle = new URL("./circle.js", import.meta.url)
const cylinder = new URL("./cylinder.js", import.meta.url)
const skinning = new URL("./skinning.js", import.meta.url)

export default {
  "plane": plane,
  "uv sphere": uvSphere,
  "cuboid": cuboid,
  "circle": circle,
  "cylinder": cylinder,
  "topology": meshTopology,
  "geometries": geometries,
  "skinning": skinning,
}