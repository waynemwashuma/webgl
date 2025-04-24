import { Shader } from "./shader.js"
import { Color } from "../math/index.js"
import { basicVertex, phongFragment } from "../shader/index.js"
import { Sampler, Texture } from "../texture/index.js"
import { updateTextureSampler } from "../function.js"

export class PhongMaterial extends Shader {
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
    super(basicVertex, phongFragment)

    this.color = color
    this.mainTexture = mainTexture
    this.mainSampler = mainSampler
    this.specularStrength = specularStrength
    this.specularShininess = specularShininess
  }

  /**
   * 
   * @param {WebGL2RenderingContext} gl 
   * @param {WebGLTexture} defaultTexture 
   */
  uploadUniforms(gl, defaultTexture) {
    const { color, mainTexture, mainSampler, specularShininess, specularStrength } = this
    const colorInfo = this.uniforms.get("color")
    const mainTextureInfo = this.uniforms.get("mainTexture")
    const specularShininessInfo = this.uniforms.get("specularShininess")
    const specularStrengthInfo = this.uniforms.get("specularStrength")

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
      if (mainTexture) {
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, mainTexture.webglTex)
        gl.uniform1i(mainTextureInfo.location, 0)
      } else {
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, defaultTexture)
        gl.uniform1i(mainTextureInfo.location, 0)
      }
    }
    // must occur after the above block
    if (mainSampler) {
      updateTextureSampler(gl, gl.TEXTURE_2D, this.mainSampler)
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