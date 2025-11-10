import { PrimitiveTopology } from "./constants.js"
import { Attribute } from "./attribute/index.js"

export class Mesh {
  /**
   * @type {Uint8Array | Uint16Array | Uint32Array | undefined}
   */
  indices

  /**
   * @type {Map<string, DataView>}
   */
  _attributes

  /**
   * @type {PrimitiveTopology}
   */
  topology = PrimitiveTopology.Triangles
  constructor() {
    this._attributes = new Map()
  }

  /**
   * @param {string} name
   * @param {DataView} attribute
   */
  setAttribute(name, attribute) {
    this._attributes.set(name, attribute)
    return this
  }
  get attributes() {
    return this._attributes
  }

  normalizeJointWeights() {
    const weights = this.attributes.get(Attribute.JointWeight.name)

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