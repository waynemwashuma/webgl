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
    depthTexture,
    width,
    height,
    internalDepthStencil
  }) {
    super(width, height)
    this.color = color
    this.depthTexture = depthTexture
    this.internalDepthStencil = internalDepthStencil

    for (const color of this.color) {
      color.data = undefined
      color.width = width
      color.height = height
    }

    if (this.depthTexture) {
      this.depthTexture.data = undefined
      this.depthTexture.width = width
      this.depthTexture.height = height
    }
  }

  /**
   * @override
   */
  get width() {
    return super.width
  }

  /**
   * @override
   * @param {number} value
   */
  set width(value) {
    super.width = value
    this.color.forEach((attachment) => {
      attachment.width = value
    })
    if (this.depthTexture) {
      this.depthTexture.width = value
    }
  }

  /**
   * @override
   */
  get height() {
    return super.height
  }

  /**
   * @override
   * @param {number} value
   */
  set height(value) {
    super.height = value
    this.color.forEach((attachment) => {
      attachment.height = value
    })
    if (this.depthTexture) {
      this.depthTexture.height = value
    }
  }
}

/**
 * @typedef ImageRenderTargetOptions
 * @property {Texture[]} [color]
 * @property {Texture} [depthTexture]
 * @property {TextureFormat} [internalDepthStencil]
 * @property {number} width
 * @property {number} height
 */