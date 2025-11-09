import { WebGLExtensions } from "../core/index.js"
import { assert } from "../utils/index.js"

export class WebGLCanvasSurface {
  /**
   * @readonly
   * @type {HTMLCanvasElement}
   */
  canvas

  /**
   * @type {WebGL2RenderingContext}
   */
  context
  /**
   * @param {HTMLCanvasElement} [canvas]
   * @param {WebGLContextAttributes} [options] 
   */
  constructor(canvas, options) {
    this.canvas = canvas || document.createElement('canvas')
    const context = this.canvas.getContext('webgl2', options)

    assert(context, "Webgl context creation failed")
    
    this.context = context
    this.extensions = new WebGLExtensions(this.context)
    this.extensions.get("OES_texture_float_linear")
  }
}