/**@import { WebGLRenderPipelineOptions } from '../core/index.js' */
import { skyboxFragment, skyboxVertex } from "../shader/index.js"
import { Sampler, Texture } from "../texture/index.js"
import { CullFace } from "../constants/index.js"
import { RawMaterial } from "./raw.js"

export class SkyBoxMaterial extends RawMaterial {

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

  /**
   * @override
   */
  vertex() {
    return skyboxVertex
  }

  /**
   * @override
   */
  fragment() {
    return skyboxFragment
  }

  /**
   * @returns {ArrayBuffer}
   * @override
   */
  getData() {
    return new Float32Array([this.lerp]).buffer
  }

  /**
   * @returns {[string, number, Texture | undefined, Sampler | undefined][]}
   * @override
   */
  getTextures() {
    return [
      ['day',0, this.day, undefined],
      ['night',1, this.night, undefined],
    ]
  }

  /**
   * @param {WebGLRenderPipelineOptions} descriptor
   * @override
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