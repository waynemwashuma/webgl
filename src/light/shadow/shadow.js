import { OrthographicProjection } from "../../objects/index.js"

export class Shadow {
  /**
   * @type {number}
   */
  bias = 0.001
  /**
   * @type {number}
   */
  normalBias = 0
}
export class OrthographicShadow extends Shadow {
  /**
   * @type {number}
   */
  near = 0.1
  /**
   * @type {number}
   */
  far = 1000
  /**
   * @type {OrthographicProjection}
   */
  projection = new OrthographicProjection()
}

export class SpotLightShadow extends Shadow {
  /**
   * @type {number}
   */
  near = 0.1
}