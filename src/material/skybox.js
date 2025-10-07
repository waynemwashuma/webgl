import { getWebglTexture, Shader } from "./shader.js"
import { Color } from "../math/index.js"
import { skyboxFragment, skyboxVertex } from "../shader/index.js"
import { Texture } from "../texture/index.js"
import { Uniform } from "../core/index.js"

export class SkyBoxMaterial extends Shader {

  /**
   * @type {Color}
   */
  color

  /**
   * @type {Texture}
   */
  mainTexture

  /**
   * @param {SkyboxMaterialOptions} param0
   */
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
   * @param {Map<Texture,WebGLTexture>} cache
   * @param {Map<string,Uniform>} uniforms
   * @param {WebGLTexture} _defaultTexture
   */
  uploadUniforms(gl, cache, uniforms, _defaultTexture) {
    const { day, night, lerp } = this
    const dayInfo = uniforms.get("day")
    const nightInfo = uniforms.get("night")
    const lerpInfo = uniforms.get("lerp")
    const dayTex = getWebglTexture(gl,day,cache)
    const nightTex = getWebglTexture(gl,night,cache)
    
    if (lerpInfo) {
      gl.uniform1f(lerpInfo.location, lerp)
    }
    if (dayInfo) {
      if (day) {
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, dayTex)
        gl.uniform1i(dayInfo.location, 0)
      }
    }
    if (nightInfo) {
      if (night) {
        gl.activeTexture(gl.TEXTURE1)
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, nightTex)
        gl.uniform1i(nightInfo.location, 1)
      }
    }
  }
}

/**
 * @typedef SkyboxMaterialOptions
 * @property {Texture} [day]
 * @property {Texture} [night]
 * @property {number} [lerp]
 */