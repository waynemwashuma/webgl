import { Color } from "../../math/index.js"

export class Fog {
  /**
   * @type {Color}
   */
  color

  /**
   * Distance at which fog starts.
   * @type {number}
   */
  start

  /**
   * Distance at which fog is fully opaque.
   * @type {number}
   */
  end

  /**
   * World-space height that caps the fog fade.
   * Fog stays clear at and above this plane and gets denser below it.
   * @type {number}
   */
  height

  /**
   * Vertical distance over which the fog fades in below `height`.
   * @type {number}
   */
  heightFalloff

  /**
   * @param {FogOptions} [options]
   */
  constructor(options = {}) {
    this.color = options.color ?? new Color(0.5, 0.5, 0.5, 1)
    this.start = options.start ?? 30
    this.end = options.end ?? 120
    this.height = options.height ?? 0
    this.heightFalloff = options.heightFalloff ?? 8
  }

  /**
   * @param {Fog} object
   * @returns {this}
   */
  copy(object) {
    this.color.copy(object.color)
    this.start = object.start
    this.end = object.end
    this.height = object.height
    this.heightFalloff = object.heightFalloff ?? 8
    return this
  }

  /**
   * @returns {Fog}
   */
  clone() {
    return new Fog().copy(this)
  }
}

/**
 * @typedef FogOptions
 * @property {Color} [color]
 * @property {number} [start]
 * @property {number} [end]
 * @property {number} [height]
 * @property {number} [heightFalloff]
 */
