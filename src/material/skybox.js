import { Shader } from "./shader.js"
import { Color } from "../math/index.js"
import { skyboxFragment, skyboxVertex } from "../shader/index.js"
import { Texture } from "../texture/index.js"

export class SkyBoxMaterial extends Shader {

  /**
   * @type {Color}
   */
  color

  /**
   * @type {Texture}
   */
  mainTexture
  constructor({
    day = undefined,
    night = undefined,
    lerp = 0
  } = {}) {
    super(skyboxVertex, skyboxFragment)

    this.day = day
    this.night = night
    this.lerp = lerp
  }

  /**
   * 
   * @param {WebGL2RenderingContext} gl 
   * @param {WebGLTexture} _defaultTexture 
   */
  uploadUniforms(gl, _defaultTexture) {
    const { day, night, lerp } = this
    const dayInfo = this.uniforms.get("day")
    const nightInfo = this.uniforms.get("night")
    const lerpInfo = this.uniforms.get("lerp")

    if (lerpInfo) {
      gl.uniform1f(lerpInfo.location, lerp)
    }
    if (dayInfo) {
      if (day) {
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, day.webglTex)
        gl.uniform1i(dayInfo.location, 0)
      }
    }
    if (nightInfo) {
      if (night) {
        gl.activeTexture(gl.TEXTURE1)
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, night.webglTex)
        gl.uniform1i(nightInfo.location, 1)
      }
    }
  }
}