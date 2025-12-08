import { Mesh, Attribute } from "../../mesh/index.js"
import { VertexBufferLayout } from "./vertexbuffer.js"

export class MeshVertexLayout {
  /**
   * @type {readonly VertexBufferLayout[]}
   */
  layouts = []

  /**
   * @param {VertexBufferLayout[]} layouts
   */
  constructor(layouts) {
    this.layouts = layouts
  }

  /**
   * @param {Mesh} mesh
   */
  compatibleWithMesh(mesh) {
    for (const attributeName of mesh.attributes.keys()) {
      let found = false
      for (const layout of this.layouts) {
        found = layout.hasOnly([attributeName])
        if (found) {
          break
        }
      }

      if (!found) {
        return false
      }
    }
    return true
  }

  /**
   * @param {Attribute} attribute
   */
  hasAttribute(attribute){
    return this.layouts.some((layout)=>layout.has(attribute))
  }
  /**
   * @param {Mesh} mesh
   * @param {ReadonlyMap<string, Attribute>} attributes
   * @returns {MeshVertexLayout}
   */
  static fromMesh(mesh, attributes) {
    const result = []
    for (const name of mesh.attributes.keys()) {
      const attribute = attributes.get(name)
      if (!attribute) {
        throw `The attribute "${name}" is not available in the attribute map`
      }
      result.push(new VertexBufferLayout([attribute]))
    }

    return new MeshVertexLayout(result)
  }
}
