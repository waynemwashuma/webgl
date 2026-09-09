import { Color } from "../../math/index.js"

export class LinearMode {
  /**
   * Numeric shader enum for linear fog.
   * @type {number}
   */
  static Type = 0

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
   * @param {LinearModeOptions} [options]
   */
  constructor(options = {}) {
    this.start = options.start ?? 30
    this.end = options.end ?? 120
  }

  /**
   * @param {LinearMode} object
   * @returns {this}
   */
  copy(object) {
    this.start = object.start
    this.end = object.end
    return this
  }

  /**
   * @returns {LinearMode}
   */
  clone() {
    return new LinearMode().copy(this)
  }
}

export class ExponentialMode {
  /**
   * Numeric shader enum for exponential fog.
   * @type {number}
   */
  static Type = 1

  /**
   * Exponential fog density.
   * @type {number}
   */
  density

  /**
   * @param {ExponentialModeOptions} [options]
   */
  constructor(options = {}) {
    this.density = options.density ?? 0.04
  }

  /**
   * @param {ExponentialMode} object
   * @returns {this}
   */
  copy(object) {
    this.density = object.density
    return this
  }

  /**
   * @returns {ExponentialMode}
   */
  clone() {
    return new ExponentialMode().copy(this)
  }
}

export class Fog {
  /**
   * @type {Color}
   */
  color

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
   * Distance fog mode.
   * @type {LinearMode | ExponentialMode}
   */
  mode

  /**
   * @param {FogOptions} [options]
   */
  constructor(options = {}) {
    this.color = options.color ?? new Color(0.5, 0.5, 0.5, 1)
    this.height = options.height ?? 0
    this.heightFalloff = options.heightFalloff ?? 8
    this.mode = options.mode ?? new LinearMode()
  }

  /**
   * @param {Fog} object
   * @returns {this}
   */
  copy(object) {
    this.color.copy(object.color)
    this.height = object.height
    this.heightFalloff = object.heightFalloff ?? 8
    this.mode = object.mode.clone()
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
 * @typedef LinearModeOptions
 * @property {number} [start]
 * @property {number} [end]
 */

/**
 * @typedef ExponentialModeOptions
 * @property {number} [density]
 */

/**
 * @typedef FogOptions
 * @property {Color} [color]
 * @property {number} [height]
 * @property {number} [heightFalloff]
 * @property {LinearMode | ExponentialMode} [mode]
 */
