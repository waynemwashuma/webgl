import { RenderTarget } from "./rendertarget.js";

export class CanvasTarget extends RenderTarget {
  /**
   * @type {HTMLCanvasElement}
   */
  canvas
  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas){
    super()
    this.canvas = canvas
  }
}