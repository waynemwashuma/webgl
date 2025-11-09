import { TextureFormat } from "../constants/index.js";
import { Texture } from "../texture/index.js"
import { RenderTarget } from "./rendertarget.js";

export class ImageRenderTarget extends RenderTarget {
  /**
   * @type {Texture[]}
   */
  color

  /**
   * @type {Texture | undefined}
   */
  depthTexture

  /**
   * @type {TextureFormat | undefined}
   */
  internalDepthStencil

  /**
   * @param {ImageRenderTargetOptions} options
   */
  constructor({
    color = [],
    depth,
    width,
    height
  }) {
    super()
    this.width = width
    this.height = height
    this.color = color
    this.depthTexture = depth
    
    for (const color of this.color) {
      color.data = undefined
      color.width = width
      color.height = height
    }
  }
}


/**
 * @typedef ImageRenderTargetOptions
 * @property {Texture[]} [color]
 * @property {Texture} [depth]
 * @property {TextureFormat} [internalDepthStencil]
 * @property {number} width
 * @property {number} height
 */