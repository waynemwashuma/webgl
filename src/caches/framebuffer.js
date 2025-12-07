/** @import { Caches } from "./cache.js" */
import { Texture } from "../texture/index.js"
import { TextureFormat } from "../constants/index.js"
import { ImageRenderTarget } from "../rendertarget/index.js"

export class ImageFrameBuffer {
  /**
   * @type {WebGLFramebuffer}
   */
  buffer

  /**
   * @type {WebGLTexture[]}
   */
  colorAttachments = []
  /**
   * @type {WebGLRenderbuffer | undefined}
   */
  depthBuffer

  /**
   * @type {WebGLTexture | undefined}
   */
  depthImage

  /**
   * @param {WebGL2RenderingContext} context
   * @param {ImageRenderTarget} rendertarget
   * @param {Caches} caches
   */
  constructor(context, rendertarget, caches) {
    const framebuffer = context.createFramebuffer()

    context.bindFramebuffer(context.FRAMEBUFFER, framebuffer)
    this.buffer = framebuffer

    for (let i = 0; i < rendertarget.color.length; i++) {
      const color = /**@type {Texture}*/ (rendertarget.color[i])
      const textColor = caches.getTexture(context, color)
      context.framebufferTexture2D(
        context.FRAMEBUFFER,
        context.COLOR_ATTACHMENT0 + i,
        color.type,
        textColor,
        0
      )
      this.colorAttachments[i] = textColor
    }

    if (rendertarget.internalDepthStencil) {
      const depth = context.createRenderbuffer()
      const format = rendertarget.internalDepthStencil

      context.bindRenderbuffer(context.RENDERBUFFER, depth)
      context.renderbufferStorage(
        context.RENDERBUFFER,
        format,
        rendertarget.width,
        rendertarget.height
      )
      context.framebufferRenderbuffer(
        context.FRAMEBUFFER,
        getFramebufferAttachment(format),
        context.RENDERBUFFER,
        depth
      )
      this.depthBuffer = depth
    }

    if (rendertarget.depthTexture) {
      const { format, type } = rendertarget.depthTexture
      const texture = caches.getTexture(context, rendertarget.depthTexture)
      this.depthImage = texture
      context.framebufferTexture2D(
        context.FRAMEBUFFER,
        getFramebufferAttachment(format),
        type,
        texture,
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