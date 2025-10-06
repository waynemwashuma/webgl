import {
  createProgramFromSrc,
  createTexture,
  updateTextureData,
} from "../function.js"
import {
  BlendMode,
  DrawMode,
  CullFace
} from "../constant.js"
import { UBOs } from "../core/ubo.js"
import { Attribute, UBOLayout, Uniform } from "../core/index.js"
import { Texture } from "../texture/index.js"

export class Shader {
  drawMode = DrawMode.TRIANGLES
  cullFace = CullFace.BACK
  distBlendFunc = BlendMode.ONE_MINUS_SRC_ALPHA
  srcBlendFunc = BlendMode.SRC_ALPHA
  /**
   * @type {Map<string, string>}
   */
  defines = new Map()
  /**
   * @type {Map<string,Uniform>}
   */
  uniforms

  /**
   * @type {Map<string,UBOLayout>}
   */
  uniformBlocks
  /**
   * @param {string} vshaderSrc
   * @param {string} fshaderSrc
   */
  constructor(vshaderSrc, fshaderSrc) {
    this.vSrc = vshaderSrc
    this.fSrc = fshaderSrc
    this.program = null
  }
  /**
   * @param {WebGL2RenderingContext} gl
   * @param {UBOs} ubos
   * @param {ReadonlyMap<string, Attribute>} attributes
   * @param {ReadonlyMap<string,string>} includes
   * @param {ReadonlyMap<string,string>} globalDefines
   * 
   */
  init(gl, ubos, attributes, includes, globalDefines) {
    if (this.program) return
    const vSrc = preprocessShader(this.vSrc, includes, [globalDefines, this.defines])
    const fSrc = preprocessShader(this.fSrc, includes, [globalDefines, this.defines])
    const programInfo = createProgramFromSrc(gl, vSrc, fSrc, attributes)
    this.program = programInfo.program
    this.uniforms = programInfo.uniforms
    this.uniformBlocks = programInfo.uniformBlocks

    for (const [name, uboLayout] of this.uniformBlocks) {
      const ubo = ubos.getorSet(gl, name, uboLayout)
      const index = gl.getUniformBlockIndex(this.program, name)

      gl.uniformBlockBinding(this.program, index, ubo.point)
    }
  }

  /**
   * @param {WebGL2RenderingContext} _gl 
   * @param {Map<Texture,WebGLTexture>} _cache
   * @param {WebGLTexture} _defaultTexture 
   */
  uploadUniforms(_gl, _cache, _defaultTexture) {
    throw `Implement \`${this.constructor.name}.uploadUniforms\``
  }

  /**
   * @param {WebGL2RenderingContext} gl 
   */
  activate(gl) {
    gl.useProgram(this.program)
    gl.cullFace(this.cullFace);
  }

  /**
   * @param {WebGL2RenderingContext} gl
   */
  deactivate(gl) {
    gl.useProgram(null)
  }
}

/**
 * @param {string} source
 * @param {ReadonlyMap<string,string>} includes 
 * @param {ReadonlyMap<string,string>[]} defines
 * @returns {string}
 */
function preprocessShader(source, includes, defines) {
  const version = "#version 300 es\n"
  const mergedDefines = defines.flatMap(map => [...map.entries()])
    .map(([name, value]) => `#define ${name} ${value}`)
    .join("\n")
  const preprocessed = source.replace(/#include <(.*?)>/g, (_, name) => {
    const include = includes.get(name)
    if (!include) {
      console.error(`Could not find the include "${name}"`)
    }
    return include || ""
  })
  return version + mergedDefines + preprocessed
}

/**
 * @param {WebGL2RenderingContext} gl
 * @param {Texture} texture
 * @param {Map<Texture,WebGLTexture>} cache
 * @returns {WebGLTexture}
 */
export function getWebglTexture(gl,texture,cache){
  const tex = cache.get(texture)

  if(tex){
    if(texture.changed){
      gl.bindTexture(texture.type, tex)
      updateTextureData(gl,texture)
    }
    return tex
  }
  const newTex = createTexture(gl,texture)
  cache.set(texture,newTex)
  return newTex
}