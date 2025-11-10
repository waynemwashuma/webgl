import { TextureType } from "../../constants/index.js"
import { WebGLTextureFormat } from "../../function.js"

export class GPUTexture {
  /**
   * @readonly
   * @type {WebGLTexture}
   */
  inner

  /**
   * @readonly
   * @type {TextureType}
   */
  type

  /**
   * @readonly
   * @type {number}
   */
  width

  /**
   * @readonly
   * @type {number}
   */
  height

  /**
   * @readonly
   * @type {number}
   */
  depth

  /**
   * @readonly
   * @type {WebGLTextureFormat}
   */
  format

  /**
   * @readonly
   * @type {number}
   */
  pixelSize

  /**
   * @param {WebGLTexture} texture
   * @param {TextureType} type
   * @param {WebGLTextureFormat} format
   * @param {number} width
   * @param {number} height
   * @param {number} depth
   * @param {number} pixelSize
   */
  constructor(texture, type, format, width, height, depth, pixelSize){
    this.inner = texture
    this.type = type
    this.format = format
    this.width = width
    this.height = height
    this.depth = depth
    this.pixelSize = pixelSize
  }
}