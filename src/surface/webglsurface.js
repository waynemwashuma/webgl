import { WebGLExtensions } from "../core/index.js"

export class WebGLCanvasSurface {
  /**
   * @readonly
   * @type {HTMLCanvasElement}
   */
  canvas

  /**
   * @type {WebGL2RenderingContext}
   */
  gl
  /**
   * @param {HTMLCanvasElement} [canvas]
   * @param {WebGLContextAttributes} [options] 
   */
  constructor(canvas, options) {
    this.canvas = canvas || document.createElement('canvas')
    this.context = canvas.getContext('webgl2', options)
    this.extensions = new WebGLExtensions(this.context)
    this.extensions.get("OES_texture_float_linear")
  }
}