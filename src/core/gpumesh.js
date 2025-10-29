import { GlDataType } from "../constant.js"

export class GPUMesh {
  /**
   * @readonly
   * @type {WebGLVertexArrayObject}
   */
  object

  /**
   * @type {WebGLBuffer[]}
   */
  attributeBuffers = []

  /**
   * @type {WebGLBuffer | undefined}
   */
  indexBuffer

  /**
   * @type {GlDataType | undefined}
   */
  indexType

  /**
   * @type {number}
   */
  count

  /**
   * @type {number}
   */
  layoutHash

  /**
   * @param {WebGLVertexArrayObject} object
   * @param {number} layoutHash
   * @param {number} count
   */
  constructor(object, layoutHash, count = 0) {
    this.object = object
    this.count = count
    this.layoutHash = layoutHash
  }
}