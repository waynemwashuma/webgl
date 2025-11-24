/**@import { WebGLRenderPipelineDescriptor } from '../caches/index.js' */
import { Sampler, Texture } from "../texture/index.js"
import { abstractClass, abstractMethod } from "../utils/index.js"

/**
 * @abstract
 */
export class RawMaterial {

  constructor(){
    abstractClass(this, RawMaterial)
  }
  /**
   * @returns {string}
   */
  vertex() {
    abstractMethod(this, RawMaterial, RawMaterial.prototype.vertex.name)
  }

  /**
   * @returns {string}
   */
  fragment() {
    abstractMethod(this, RawMaterial, RawMaterial.prototype.fragment.name)
  }

  /**
   * @returns {ArrayBuffer}
   */
  getData() {
    abstractMethod(this, RawMaterial, RawMaterial.prototype.getData.name)
  }

  /**
   * @returns {[string, number, Texture | undefined, Sampler | undefined][]}
   */
  getTextures(){
    return []
  }

  /**
   * @returns {bigint}
   */
  getPipelineBits() {
    return 0n
  }

  /**
   * @param {WebGLRenderPipelineDescriptor} _descriptor 
   */
  specialize(_descriptor) { }
}
