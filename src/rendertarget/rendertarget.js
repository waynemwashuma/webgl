import { Color } from "../math/index.js";
import { ViewRectangle, Range, ClearParams } from "../utils/index.js";

/**
 * @abstract
 */
export class RenderTarget {

  /**
   * @type {ClearParams<Color>}
   */
  clearColor = new ClearParams(new Color(0, 0, 0, 1))
  /**
   * @type {ClearParams<number>}
   */
  clearDepth = new ClearParams(1)
  /**
   * @type {ClearParams<number>}
   */
  clearStencil = new ClearParams(0)
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