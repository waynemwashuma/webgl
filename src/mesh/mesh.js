import { PrimitiveTopology } from "../constants/index.js"
import { Attribute } from "./attribute/index.js"
import { SeparateAttributeData } from "./attributedata/separate.js"
import { Affine3 } from "../math/index.js"

export class Mesh {
  /**
   * @type {Uint8Array | Uint16Array | Uint32Array | undefined}
   */
  indices

  /**
   * @type {SeparateAttributeData}
   */
  attributes

  /**
   * @type {PrimitiveTopology}
   */
  topology = PrimitiveTopology.Triangles
  /**
   * @param {SeparateAttributeData} attributes
   */
  constructor(attributes) {
    this.attributes = attributes
  }

  /**
   * @param {Affine3} affine
   */
  transform(affine) {
    this.attributes.transform(affine)
    return this
  }

  /**
   * @param {Mesh} other
   */
  merge(other) {
    const newAttributes = this.attributes.merge(other.attributes)
    const newMesh = new Mesh(newAttributes)
    
    if (this.indices && other.indices) {
      const positions = this.attributes.get(Attribute.Position.name)

      if(!positions){
        return newMesh
      }

      // TODO: Remove this hardcoding and use the attribute map instead
      const attributeCount = positions.byteLength / (3 * 4)
      const offset = this.indices.length

      const newIndices = new Uint16Array(this.indices.length + other.indices.length)

      for (let i = 0; i < this.indices.length; i++) {
        const index = /**@type {number} */(this.indices[i]);

        newIndices[i] = index
      }

      for (let i = 0; i < other.indices.length; i++) {
        const index = /**@type {number} */(other.indices[i]);

        newIndices[i + offset] = index + attributeCount
      }
      newMesh.indices = newIndices
    } else if (!this.indices && !this.indices) {
      // Do nothing because attributes are already merged
    } else {
      // TODO: How do we merge an indexed and non-indexed mesh?
      throw "Invalid merge, both meshes must either have indices or not have them."
    }
    return newMesh
  }

  normalizeJointWeights() {
    const weights = this.attributes.data.get(Attribute.JointWeight.name)

    if (!weights) return

    const data = new Float32Array(
      weights.buffer,
      weights.byteOffset,
      weights.byteLength / Float32Array.BYTES_PER_ELEMENT
    )

    for (let i = 0; i < data.length; i += 4) {
      const sum = /**@type {number}*/(data[i]) +
        /**@type {number}*/ (data[i + 1]) +
        /**@type {number}*/ (data[i + 2]) +
        /**@type {number}*/ (data[i + 3])

      if (sum === 0) {
        data[i] = 0
        data[i + 1] = 0
        data[i + 2] = 0
        data[i + 3] = 0
      } else {
        const inv = 1 / sum
        data[i] = /**@type {number}*/(data[i]) * inv
        data[i + 1] = /**@type {number}*/ (data[i + 1]) * inv
        data[i + 2] = /**@type {number}*/(data[i + 2]) * inv
        data[i + 3] = /**@type {number}*/(data[i + 3]) * inv
      }
    }
  }
}