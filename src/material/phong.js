import { getWebglTexture, Material } from "./material.js"
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

  vertex(){
    return basicVertex
  }

  fragment(){
    return phongFragment
  }

  /**
   * @param {WebGL2RenderingContext} gl 
   * @param {Map<Texture,WebGLTexture>} cache
   * @param {Map<string,Uniform>} uniforms
   * @param {Texture} defaultTexture
   */
  uploadUniforms(gl, cache, uniforms, defaultTexture) {
    const {
      color,
      mainTexture = defaultTexture,
      mainSampler,
      specularShininess,
      specularStrength
    } = this
    const colorInfo = uniforms.get("color")
    const mainTextureInfo = uniforms.get("mainTexture")
    const specularShininessInfo = uniforms.get("specularShininess")
    const specularStrengthInfo = uniforms.get("specularStrength")
    const maintex = getWebglTexture(gl,mainTexture,cache)

    if (colorInfo) {
      gl.uniform4f(colorInfo.location, color.r, color.g, color.b, color.a)
    }
    if (specularShininessInfo) {
      gl.uniform1f(specularShininessInfo.location, specularShininess)
    }
    if (specularStrengthInfo) {
      gl.uniform1f(specularStrengthInfo.location, specularStrength)
    }
    if (mainTextureInfo) {
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, maintex)
      gl.uniform1i(mainTextureInfo.location, 0)

      if (mainSampler) {
        updateTextureSampler(gl, mainTexture, mainSampler)
      }
    }
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