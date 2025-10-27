import { ViewRectangle, Range } from "../utils/index.js";

export class RenderTarget {
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