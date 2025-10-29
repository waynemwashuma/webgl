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
   * @param {WebGLVertexArrayObject} object 
   * @param {number} count
   */
  constructor(object, count = 0){
    this.object = object
    this.count = count
  }
}