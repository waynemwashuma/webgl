import { Affine3, Vector3 } from "../../math/index.js"
import { copyBuffer } from "../../utils/index.js"
import { Attribute } from "../attribute/index.js"

export class SeparateAttributeData {
  /**
   * @type {Map<string, DataView>}
   */
  data = new Map()

  /**
   * @param {string} name
   * @param {DataView<ArrayBufferLike>} data
   * @returns {this}
   */
  set(name, data) {
    this.data.set(name, data)
    return this
  }

  /**
   * @param {string} name
   * @returns {DataView | undefined}
   */
  get(name) {
    return this.data.get(name)
  }

  /**
   * @param {string} name
   * @returns {boolean}
   */
  has(name) {
    return this.data.has(name)
  }

  /**
   * @param {string} name
   * @returns {boolean}
   */
  delete(name) {
    return this.data.delete(name)
  }

  clear() {
    this.data.clear()
    return this
  }

  /**
   * @param {Affine3} affine
   */
  transform(affine) {
    const positions = this.get(Attribute.Position.name)
    const normals = this.get(Attribute.Normal.name)
    const tangents = this.get(Attribute.Tangent.name)

    if (positions) {
      const trPositions = new Float32Array(positions.buffer, positions.byteOffset, positions.byteLength / Float32Array.BYTES_PER_ELEMENT)
      for (let i = 0; i < trPositions.length; i += 3) {
        const position = new Vector3(
          trPositions[i],
          trPositions[i + 1],
          trPositions[i + 2],
        )
        affine.transform(position)

        trPositions[i] = position.x
        trPositions[i + 1] = position.y
        trPositions[i + 2] = position.z
      }
    }

    if (normals) {
      const floats = new Float32Array(normals.buffer, normals.byteOffset, normals.byteLength / Float32Array.BYTES_PER_ELEMENT)
      for (let i = 0; i < floats.length; i += 3) {
        const normal = new Vector3(
          floats[i],
          floats[i + 1],
          floats[i + 2],
        )
        affine.transformWithoutTranslation(normal)

        floats[i] = normal.x
        floats[i + 1] = normal.y
        floats[i + 2] = normal.z
      }
    }

    if (tangents) {
      const floats = new Float32Array(tangents.buffer, tangents.byteOffset, tangents.byteLength / Float32Array.BYTES_PER_ELEMENT)
      for (let i = 0; i < floats.length; i += 3) {
        const tangent = new Vector3(
          floats[i],
          floats[i + 1],
          floats[i + 2],
        )
        affine.transformWithoutTranslation(tangent)

        floats[i] = tangent.x
        floats[i + 1] = tangent.y
        floats[i + 2] = tangent.z
      }
    }
  }
}