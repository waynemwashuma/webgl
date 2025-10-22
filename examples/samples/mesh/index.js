const meshTopology = new URL("./meshTopology.js", import.meta.url)
const geometries = new URL("./geometries.js", import.meta.url)
const skinning = new URL("./skinning.js", import.meta.url)

export default {
  "topology": meshTopology,
  "geometries": geometries,
  "skinning": skinning,
}