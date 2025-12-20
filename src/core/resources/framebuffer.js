import { TextureFormat } from "../../constants/index.js"
import { GPUTexture } from "./gputexture.js"

export class FrameBuffer {
  /**
   * @type {WebGLFramebuffer}
   */
  buffer

  /**
   * @type {GPUTexture[]}
   */
  colorAttachments

  /**
   * @type {GLenum[]}
   */
  drawBuffers

  /**
   * @type {[WebGLRenderbuffer, TextureFormat] | undefined}
   */
  depthBuffer

  /**
   * @param {WebGLFramebuffer} frameBuffer
   * @param {GPUTexture[]} colorAttachments
   * @param {GLenum[]} drawBuffers
   * @param {[WebGLRenderbuffer, TextureFormat] | undefined} depthBuffer
   */
  constructor(frameBuffer, colorAttachments, drawBuffers, depthBuffer) {
    this.buffer = frameBuffer
    this.colorAttachments = colorAttachments
    this.depthBuffer = depthBuffer
    this.drawBuffers = drawBuffers
  }
}