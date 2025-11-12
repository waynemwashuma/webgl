import { GPUTexture } from "../index.js"

export class FrameBuffer {
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
   * @param {WebGLFramebuffer} frameBuffer
   * @param {GPUTexture[]} colorAttachments
   * @param {WebGLRenderbuffer | undefined} depthBuffer
   */
  constructor(frameBuffer, colorAttachments, depthBuffer) {
    this.buffer = frameBuffer
    this.colorAttachments = colorAttachments
    this.depthBuffer = depthBuffer
  }
}