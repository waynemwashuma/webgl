/**@import { WebGLRenderPipelineDescriptor } from '../core/index.js' */
import { Sampler, Texture } from "../texture/index.js"

/**
 * @abstract
 */
export class RawMaterial {

  /**
   * @returns {string}
   */
  vertex() {
    if (this.constructor === RawMaterial) {
      throw `\`${RawMaterial.name}\` cannot be used directly as a material.`
    }
    throw `Implement \`${this.constructor.name}.vertex()\``
  }

  /**
   * @returns {string}
   */
  fragment() {
    if (this.constructor === RawMaterial) {
      throw `\`${RawMaterial.name}\` cannot be used directly as a material.`
    }
    throw `Implement \`${this.constructor.name}.fragment()\``
  }

  /**
   * @returns {ArrayBuffer}
   */
  getData() {
    if(this.constructor === RawMaterial){
      throw `\`${RawMaterial.name}\` cannot be used directly as a material.`
    }
    throw `Implement \`${this.constructor.name}.uploadUniforms()\``
  }

  /**
   * @returns {[string, number, Texture | undefined, Sampler | undefined][]}
   */
  getTextures(){
    return []
  }

  /**
   * @param {bigint} key
   * @returns {PipelineKey}
   */
  getPipelineKey(key) {
    return /**@type {PipelineKey}*/(key)
  }

  /**
   * @param {WebGLRenderPipelineDescriptor} _descriptor 
   */
  specialize(_descriptor) { }
}

/**
 * @typedef {Brand<bigint,"PipelineKey">} PipelineKey
 */

/**
 * @template T
 * @template {string} U
 * @typedef {T & {__brand:U}} Brand
 */