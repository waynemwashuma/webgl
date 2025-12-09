import { BufferType } from "../../constants/index.js"

export class GPUBuffer {
  /**
   * @readonly
   * @type {WebGLBuffer}
   */
  inner

  /**
   * @readonly
   * @type {BufferType}
   */
  type

  /**
   * @readonly
   * @type {number}
   */
  size

  /**
   * @param {WebGLBuffer} buffer
   * @param {number} type
   * @param {number} size
   */
  constructor(buffer, type, size) {
    this.inner = buffer
    this.type = type
    this.size = size
  }
}