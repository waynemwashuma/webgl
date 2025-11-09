import { getFramebufferAttachment } from "../function.js"
import { Caches } from "../renderer/renderer.js"
import { ImageRenderTarget } from "../rendertarget/image.js"
import { Texture } from "../texture/index.js"

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