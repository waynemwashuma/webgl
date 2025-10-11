/**@import {WebGLRenderPipelineDescriptor, BlendDescriptor } from '../core/index.js' */
import {
  createTexture,
  updateTextureData,
} from "../function.js"
import {
  CullFace,
  FrontFaceDirection,
} from "../constant.js"
import { Uniform } from "../core/index.js"
import { Texture } from "../texture/index.js"
import { MeshKey } from "../objects/mesh.js"

export class Material {
  /**
   * @type {FrontFaceDirection}
   */
  frontFace = FrontFaceDirection.CCW
  /**
   * @type {CullFace}
   */
  cullFace = CullFace.Back
  /**
   * @type {boolean}
   */
  depthTest = true
  /**
   * @type {boolean}
   */
  depthWrite = true
  /**
   * @type {BlendDescriptor | undefined}
   */
  blend
  /**
   * @param {string} vshaderSrc
   * @param {string} fshaderSrc
   */
  constructor(vshaderSrc, fshaderSrc) {
    this.vSrc = vshaderSrc
    this.fSrc = fshaderSrc
  }

  /**
   * @param {WebGL2RenderingContext} _gl 
   * @param {Map<Texture,WebGLTexture>} _cache
   * @param {Map<string,Uniform>} _uniforms
   * @param {WebGLTexture} _defaultTexture
   */
  uploadUniforms(_gl, _cache, _uniforms, _defaultTexture) {
    throw `Implement \`${this.constructor.name}.uploadUniforms\``
  }

  /**
   * @param {bigint} key
   * @returns {PipelineKey}
   */
  getPipelineKey(key){
    let materialKey = MaterialKey.None
    if(this.cullFace === CullFace.Front){
      materialKey |= MaterialKey.CullFaceFront
    }else if(this.cullFace === CullFace.Back){
      materialKey |= MaterialKey.CullFaceBack
    }else if(this.cullFace === CullFace.FrontAndBack){
      materialKey |= MaterialKey.CullFaceBoth
    }

    if(this.depthTest){
      materialKey |= MaterialKey.DepthTest
    }
    if(this.depthWrite){
      materialKey |= MaterialKey.DepthWrite
    }
    if(this.frontFace == FrontFaceDirection.CW){
      materialKey |= MaterialKey.FrontFaceCW
    }
    
    return /**@type {PipelineKey}*/(key | (materialKey << MeshKey.LastBit))
  }
  
  /**
   * @param {WebGLRenderPipelineDescriptor} descriptor 
   */
 specialize(descriptor){
    // TODO: Incorporate blending to the pipeline key
    descriptor.blend = this.blend
    descriptor.cullFace = this.cullFace
    descriptor.frontFace = this.frontFace
    descriptor.depthTest = this.depthTest
    descriptor.depthWrite = this.depthWrite
  }
}

/**
 * @enum {bigint}
 */
export const MaterialKey = {
  LastBit: 63n,
  None:0n,
  CullFaceFront:1n << 0n,
  CullFaceBack:1n << 1n,
  CullFaceBoth:1n << 2n,
  FrontFaceCW:1n << 3n,
  DepthWrite:1n << 4n,
  DepthTest:1n << 5n
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