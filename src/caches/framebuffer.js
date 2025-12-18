/** @import { Caches } from "./cache.js" */
import { Texture } from "../texture/index.js"
import { TextureFormat } from "../constants/index.js"
import { ImageRenderTarget } from "../rendertarget/index.js"
import { GPUTexture, WebGLRenderDevice } from "../core/index.js"

export class ImageFrameBuffer {
  /**
   * @type {WebGLFramebuffer}
   */
  buffer

  /**
   * @type {GPUTexture[]}
   */
  colorAttachments = []
  /**
   * @type {WebGLRenderbuffer | undefined}
   */
  depthBuffer

  /**
   * @type {GPUTexture | undefined}
   */
  depthImage

  /**
   * @param {WebGLRenderDevice} device
   * @param {ImageRenderTarget} rendertarget
   * @param {Caches} caches
   */
  constructor(device, rendertarget, caches) {
    const framebuffer = device.context.createFramebuffer()

    device.context.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, framebuffer)
    this.buffer = framebuffer

    for (let i = 0; i < rendertarget.color.length; i++) {
      const color = /**@type {Texture}*/ (rendertarget.color[i])
      const textColor = caches.getTexture(device, color)
      device.context.framebufferTexture2D(
        WebGL2RenderingContext.FRAMEBUFFER,
        WebGL2RenderingContext.COLOR_ATTACHMENT0 + i,
        color.type,
        textColor.inner,
        0
      )
      this.colorAttachments[i] = textColor
    }

    if (rendertarget.internalDepthStencil) {
      const depth = device.context.createRenderbuffer()
      const format = rendertarget.internalDepthStencil

      device.context.bindRenderbuffer(WebGL2RenderingContext.RENDERBUFFER, depth)
      device.context.renderbufferStorage(
        WebGL2RenderingContext.RENDERBUFFER,
        format,
        rendertarget.width,
        rendertarget.height
      )
      device.context.framebufferRenderbuffer(
        WebGL2RenderingContext.FRAMEBUFFER,
        getFramebufferAttachment(format),
        WebGL2RenderingContext.RENDERBUFFER,
        depth
      )
      this.depthBuffer = depth
    }

    if (rendertarget.depthTexture) {
      const { format, type } = rendertarget.depthTexture
      const texture = caches.getTexture(device, rendertarget.depthTexture)
      this.depthImage = texture
      device.context.framebufferTexture2D(
        WebGL2RenderingContext.FRAMEBUFFER,
        getFramebufferAttachment(format),
        type,
        texture.inner,
        0
      )
    }
  }

  /**
   * @param {WebGL2RenderingContext} _context
   */
  resolve(_context){
    if(this.depthBuffer && this.depthImage){
      //TODO: blit depth buffer into depth image
    }
  }
}

/**
 * Converts a TextureFormat enum value to the appropriate framebuffer attachment type.
 * @param {number} format - A value from TextureFormat.
 * @returns {number} A GL_* attachment enum, e.g. gl.COLOR_ATTACHMENT0, gl.DEPTH_ATTACHMENT, etc.
 */
export function getFramebufferAttachment(format) {
  const context = WebGL2RenderingContext;

  switch (format) {
    // --- Depth-only formats ---
    case TextureFormat.Depth16Unorm:
    case TextureFormat.Depth24Plus:
    case TextureFormat.Depth32Float:
      return context.DEPTH_ATTACHMENT;

    // --- Stencil-only format ---
    case TextureFormat.Stencil8:
      return context.STENCIL_ATTACHMENT;

    // --- Combined depth + stencil formats ---
    case TextureFormat.Depth24PlusStencil8:
    case TextureFormat.Depth32FloatStencil8:
      return context.DEPTH_STENCIL_ATTACHMENT;

    // --- Everything else is a color attachment ---
    default:
      return context.COLOR_ATTACHMENT0;
  }
}