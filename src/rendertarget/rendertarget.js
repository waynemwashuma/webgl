import { Color } from "../math/index.js";
import { ViewRectangle, Range } from "../utils/index.js";

/**
 * @abstract
 */
export class RenderTarget {

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
}