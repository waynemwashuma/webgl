import { Attribute, AttributeData } from "../core/index.js"
import { createVAO } from "../function.js"

export class Geometry {
  /**
   * @type {Uint8Array | Uint16Array | Uint32Array | undefined}
   */
  indices

  /**
   * @type {Map<string, AttributeData>}
   */
  _attributes
  constructor() {
    this._VAO = null
    this._attributes = new Map()
  }
  /**
   * @param {WebGL2RenderingContext} gl
   * @param {ReadonlyMap<string,Attribute>} attributes 
   */
  init(gl, attributes) {
    this._VAO = createVAO(gl,attributes, this._attributes, this.indices)
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
  get VAO() {
    return this._VAO
  }
}