import { Material } from "./material.js"
import { Color } from "../math/index.js"
import { basicVertex, lambertFragment } from "../shader/index.js"
import { Texture, Sampler } from "../texture/index.js"
import { Uniform } from "../core/index.js"

export class LambertMaterial extends Material {
  /**
   * @type {Color}
   */
  color

  /**
   * @type {Texture | undefined}
   */
  mainTexture

  /**
   * @type {Sampler | undefined}
   */
  mainSampler

  /**
   * @param {LambertMaterialOptions} param0 
   */
  constructor({
    mainTexture = undefined,
    mainSampler = undefined,
    color = new Color(1, 1, 1)
  } = {}) {
    super()
    this.color = color
    this.mainTexture = mainTexture
    this.mainSampler = mainSampler
  }

  vertex() {
    return basicVertex
  }

  fragment() {
    return lambertFragment
  }

  /**
   * 
   * @param {WebGL2RenderingContext} gl
   * @param {Map<string,Uniform>} uniforms
   */
  uploadUniforms(gl, uniforms) {
    const {
      color,
    } = this
    const colorInfo = uniforms.get("color")

    if (colorInfo) {
      gl.uniform4f(colorInfo.location, color.r, color.g, color.b, color.a)
    }
  }

  /**
   * @returns {[string, number, Texture | undefined, Sampler | undefined][]}
   */
  getTextures() {
    return [['mainTexture', 0, this.mainTexture, this.mainSampler]]
  }
}

/**
 * @typedef LambertMaterialOptions
 * @property {Color} [color]
 * @property {Texture} [mainTexture]
 * @property {Sampler} [mainSampler]
 */