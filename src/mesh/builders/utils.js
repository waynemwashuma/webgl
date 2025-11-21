import { Mesh } from "../mesh.js"

/**
 * @param {Mesh[]} meshes
 */
export function mergeMeshes(meshes) {
  let result = meshes[0]

  if (!result) {
    return
  }

  for (let i = 1; i < meshes.length; i++) {
    const nextMesh = /**@type {Mesh}*/ (meshes[i])

    result = result.merge(nextMesh)
  }

  return result
}