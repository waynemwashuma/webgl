import { PrimitiveTopology } from "../constant.js"
import { AttributeData } from "../core/index.js"

export class Mesh {
  /**
   * @type {Uint8Array | Uint16Array | Uint32Array | undefined}
   */
  indices

  /**
   * @type {Map<string, AttributeData>}
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
   * @param {AttributeData} attribute
   */
  setAttribute(name, attribute) {
    this._attributes.set(name, attribute)
    return this
  }
  get attributes() {
    return this._attributes
  }
}