/**@import {WebGLRenderPipelineDescriptor} from '../core/index.js' */
import {
  createTexture,
  updateTextureData,
} from "../function.js"
import { Uniform } from "../core/index.js"
import { Texture } from "../texture/index.js"

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
   * @param {WebGL2RenderingContext} _gl 
   * @param {Map<Texture,WebGLTexture>} _cache
   * @param {Map<string,Uniform>} _uniforms
   * @param {WebGLTexture} _defaultTexture
   */
  uploadUniforms(_gl, _cache, _uniforms, _defaultTexture) {
    if(this.constructor === RawMaterial){
      throw `\`${RawMaterial.name}\` cannot be used directly as a material.`
    }
    throw `Implement \`${this.constructor.name}.uploadUniforms()\``
  }

  /**
   * @param {bigint} key
   * @returns {PipelineKey}
   */
  getPipelineKey(key) {
    return /**@type {PipelineKey}*/(key)
  }

  /**
   * @param {WebGLRenderPipelineDescriptor} descriptor 
   */
  specialize(descriptor) { }
}

/**
 * @param {WebGL2RenderingContext} gl
 * @param {Texture} texture
 * @param {Map<Texture,WebGLTexture>} cache
 * @returns {WebGLTexture}
 */
export function getWebglTexture(gl, texture, cache) {
  const tex = cache.get(texture)

  if (tex) {
    if (texture.changed) {
      gl.bindTexture(texture.type, tex)
      updateTextureData(gl, texture)
    }
    return tex
  }
  const newTex = createTexture(gl, texture)
  cache.set(texture, newTex)
  return newTex
}

/**
 * @typedef {Brand<bigint,"PipelineKey">} PipelineKey
 */

/**
 * @template T
 * @template {string} U
 * @typedef {T & {__brand:U}} Brand
 */