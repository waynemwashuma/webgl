import { Color } from "../math/index.js";
import { ViewRectangle, Range } from "../utils/index.js";

/**
 * @abstract
 */
export class RenderTarget {
  /**
   * @protected
   * @type {boolean}
   */
  _change = false
  /**
   * @type {number}
   */
  #width = 0
   /**
   * @type {number}
   */
  #height = 0
  /**
   * @type {Color | undefined}
   */
  clearColor = new Color(0, 0, 0, 1)
  /**
   * @type {number | undefined}
   */
  clearDepth = 1
  /**
   * @type {number | undefined}
   */
  clearStencil = 0
  /**
   * @type {ViewRectangle}
   */
  viewport = new ViewRectangle()
  /**
   * @type {ViewRectangle | undefined}
   */
  scissor
  /**
   * @type {Range | undefined}
   */
  depthRange

  /**
   * @param {number} width
   * @param {number} height
   */
  constructor(width, height){
    this.#width = width
    this.#height = height
  }
  get width(){
    return this.#width
  }
  set width(value){
    this.#width = value
    this._change = true
  }
  get height(){
    return this.#height
  }
  set height(value){
    this.#height = value
    this._change = true
  }

  changed(){
    const prev = this._change
    this._change = false

    return prev
  }
}