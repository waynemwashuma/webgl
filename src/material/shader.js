import {
  createProgramFromSrc,
  createTexture,
  updateTextureData,
} from "../function.js"
import {
  BlendMode,
  PrimitiveTopology,
  CullFace
} from "../constant.js"
import { UBOs } from "../core/ubo.js"
import { Attribute, UBOLayout, Uniform } from "../core/index.js"
import { Texture } from "../texture/index.js"

export class Shader {
  #changed = false
  drawMode = PrimitiveTopology.Triangles
  cullFace = CullFace.Back
  distBlendFunc = BlendMode.OneMinusSrcAlpha
  srcBlendFunc = BlendMode.SrcAlpha
  /**
   * @type {Map<string, string>}
   */
  defines = new Map()
  /**
   * @param {string} vshaderSrc
   * @param {string} fshaderSrc
   */
  constructor(vshaderSrc, fshaderSrc) {
    this.vSrc = vshaderSrc
    this.fSrc = fshaderSrc
  }

  /**
   * @package
   * @readonly
   * @returns {boolean}
   * This is an internal property, do not use!
   */
  get changed() {
    const previous = this.#changed
    this.#changed = false
    return previous
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

  needsUpdate() {
    this.#changed = true
  }

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