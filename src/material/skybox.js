/**@import { WebGLRenderPipelineDescriptor } from '../core/index.js' */
import { Color } from "../math/index.js"
import { skyboxFragment, skyboxVertex } from "../shader/index.js"
import { Sampler, Texture } from "../texture/index.js"
import { Uniform } from "../core/index.js"
import { CullFace } from "../constant.js"
import { RawMaterial } from "./raw.js"

export class SkyBoxMaterial extends RawMaterial {

  /**
   * @type {Color}
   */
  color

  /**
   * @type {Texture | undefined}
   */
  day

  /**
   * @type {Texture | undefined}
   */
  night

  /**
   * @param {SkyboxMaterialOptions} param0
   */
  constructor({
    day = undefined,
    night = undefined,
    lerp = 0
  } = {}) {
    super()
    this.day = day
    this.night = night
    this.lerp = lerp
  }

  vertex() {
    return skyboxVertex
  }

  fragment() {
    return skyboxFragment
  }

  /**
   * 
   * @param {WebGL2RenderingContext} gl
   * @param {Map<string,Uniform>} uniforms
   */
  uploadUniforms(gl, uniforms) {
    const { lerp } = this
    const lerpInfo = uniforms.get("lerp")
    if (lerpInfo) {
      gl.uniform1f(lerpInfo.location, lerp)
    }
  }

  /**
   * @returns {[string, number, Texture | undefined, Sampler | undefined][]}
   */
  getTextures() {
    return [
      ['day',0, this.day, undefined],
      ['night',1, this.night, undefined],
    ]
  }

  /**
   * @param {WebGLRenderPipelineDescriptor} descriptor
   */
  specialize(descriptor) {
    descriptor.cullFace = CullFace.Front
  }
}

/**
 * @typedef SkyboxMaterialOptions
 * @property {Texture} [day]
 * @property {Texture} [night]
 * @property {number} [lerp]
 */