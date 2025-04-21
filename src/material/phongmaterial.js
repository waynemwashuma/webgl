import { Shader } from "./shader.js"
import { Color } from "../math/index.js"
import { basicVertex, phongFragment } from "../shader/index.js"

export class PhongMaterial extends Shader {
  constructor({
    color = new Color(1, 1, 1),
    mainTexture = null,
    specularStrength = 0.5,
    specularShininess = 32,
  } = {}) {
    super(basicVertex, phongFragment)

    this.color = color
    this.mainTexture = mainTexture
    this.specularStrength = specularStrength
    this.specularShininess = specularShininess
  }

  /**
   * 
   * @param {WebGL2RenderingContext} gl 
   * @param {WebGLTexture} defaultTexture 
   */
  uploadUniforms(gl, defaultTexture) {
    const { color, mainTexture,specularShininess,specularStrength } = this
    const colorInfo = this.uniforms.get("color")
    const mainTextureInfo = this.uniforms.get("mainTexture")
    const specularShininessInfo = this.uniforms.get("specularShininess")
    const specularStrengthInfo = this.uniforms.get("specularStrength")

    if (colorInfo) {
      gl.uniform4f(colorInfo.location, color.r, color.g, color.b, color.a)
    }
    if (specularShininessInfo){
      gl.uniform1f(specularShininessInfo.location, specularShininess)
    }
    if (specularStrengthInfo){
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
  }
}