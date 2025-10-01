import {
  createProgramFromSrc,
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
   * @param {Map<string, Attribute>} attributes 
   * 
   */
  init(gl, ubos, attributes) {
    if (this.program) return
    const programInfo = createProgramFromSrc(gl, this.vSrc, this.fSrc, attributes)
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
   * @param {WebGLTexture} _defaultTexture 
   */
  uploadUniforms(_gl,_defaultTexture){
    throw `Implement \`${this.constructor.name}.uploadUniforms\``
  }

  /**
   * @param {WebGL2RenderingContext} gl
   * @param {Texture} defaultTexture 
   */
  activate(gl, defaultTexture) {
    gl.useProgram(this.program)
    this.uploadUniforms(gl,defaultTexture.webglTex)
    gl.cullFace(this.cullFace);
  }

  /**
   * @param {WebGL2RenderingContext} gl
   */
  deactivate(gl) {
    gl.useProgram(null)
  }
}