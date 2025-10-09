import { Material } from "./material.js"
import { Color } from "../math/index.js"
import { basicVertex, phongFragment } from "../shader/index.js"
import { Sampler, Texture } from "../texture/index.js"
import { updateTextureSampler } from "../function.js"
import { Uniform } from "../core/index.js"

export class PhongMaterial extends Material {
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
   * @param {PhongMaterialOptions} param0 
   */
  constructor({
    color = new Color(1, 1, 1),
    mainTexture = undefined,
    mainSampler = undefined,
    specularStrength = 0.5,
    specularShininess = 32,
  } = {}) {
    super()
    this.color = color
    this.mainTexture = mainTexture
    this.mainSampler = mainSampler
    this.specularStrength = specularStrength
    this.specularShininess = specularShininess
  }

  vertex() {
    return basicVertex
  }

  fragment() {
    return phongFragment
  }

  /**
   * @param {WebGL2RenderingContext} gl
   * @param {Map<string,Uniform>} uniforms
   */
  uploadUniforms(gl, uniforms) {
    const {
      color,
      specularShininess,
      specularStrength
    } = this
    const colorInfo = uniforms.get("color")
    const specularShininessInfo = uniforms.get("specularShininess")
    const specularStrengthInfo = uniforms.get("specularStrength")

    if (colorInfo) {
      gl.uniform4f(colorInfo.location, color.r, color.g, color.b, color.a)
    }
    if (specularShininessInfo) {
      gl.uniform1f(specularShininessInfo.location, specularShininess)
    }
    if (specularStrengthInfo) {
      gl.uniform1f(specularStrengthInfo.location, specularStrength)
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
 * @typedef PhongMaterialOptions
 * @property {Color} [color]
 * @property {Texture} [mainTexture]
 * @property {Sampler} [mainSampler]
 * @property {number} [specularShininess]
 * @property {number} [specularStrength]
 */