import { Texture } from "../texture/index.js"
import { Object3D } from "./object3d.js"


export class SkyBox extends Object3D {
  /**
   * @type {number}
   */
  lerp

  /**
   * @type {Texture | undefined}
   */
  day

  /**
   * @type {Texture | undefined}
   */
  night

  /**
   * 
   * @param {SkyboxOptions} options 
   */
  constructor(options = {}) {
    super()
    this.lerp = options.lerp || 0
    this.day = options.day
    this.night = options.night
  }
}

/**
 * @typedef SkyboxOptions
 * @property {Texture} [day]
 * @property {Texture} [night]
 * @property {number} [lerp]
 */