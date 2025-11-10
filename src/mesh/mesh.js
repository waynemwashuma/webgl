import { PrimitiveTopology } from "./constants.js"
import { Attribute } from "./attribute/index.js"
import { SeparateAttributeData } from "./attributedata/separate.js"

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