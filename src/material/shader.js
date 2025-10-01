import {
  createProgramFromSrc,
} from "../function.js"
import {
  UniformType,
  BlendMode,
  DrawMode,
  CullFace
} from "../constant.js"
import { UBOs } from "../core/ubo.js"
import { Attribute } from "../core/index.js"
import { Texture } from "../texture/index.js"
import { Vector2, Vector3, Vector4, Matrix2, Matrix3, Matrix4, Color } from "../math/index.js"
import { Sampler } from "../texture/sampler.js"

// TODO: Find a way to remove these
// Global state, not something to enjoy but it has to be done
// These map to webgl global state slots per object rendeed
let samplerSlot = 0
let texSlot = 0
export class Shader {
  drawMode = DrawMode.TRIANGLES
  cullFace = CullFace.BACK
  distBlendFunc = BlendMode.ONE_MINUS_SRC_ALPHA
  srcBlendFunc = BlendMode.SRC_ALPHA
  uniformValues = new Map()
  /**
   * @param {string} vshaderSrc
   * @param {string} fshaderSrc
   */
  constructor(vshaderSrc, fshaderSrc, uniforms = {}) {
    this.vSrc = vshaderSrc
    this.fSrc = fshaderSrc
    this.uniforms = {}
    this.program = null
    for (let name in uniforms) {
      this.setUniform(name, uniforms[name])
    }
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

    for (const name in this.uniformBlocks) {
      const ubo = ubos.getorSet(gl, name, this.uniformBlocks[name])

      this.prepareUBO(gl, name, ubo)
    }
  }

  uploadUniforms(gl,defaultTexture){

    // TODO: Separate to diferent texture types
    texSlot = 0
    samplerSlot = 0

    for (const [name, value] of this.uniformValues) {
      const uniform = this.uniforms[name]
      if (!uniform) {
        console.log(`Uniform "${name}" is not avaiable in "${this.constructor.name}"`)
        continue
      }
      const { location, type } = uniform
      updateUniform(gl, location, value.value, type, defaultTexture)
      if (
        uniform.type === UniformType.SAMPLER_2D ||
        uniform.type === UniformType.SAMPLER_CUBE)
        texSlot++
    }
  }
  /**
   * @param {WebGL2RenderingContext} gl
   * @param {Texture} defaultTexture 
   */
  activate(gl, defaultTexture) {
    gl.useProgram(this.program)
    this.updateUniform(gl,defaultTexture)
    gl.cullFace(this.cullFace);
  }
  /**
   * @param {WebGL2RenderingContext} gl
   */
  prepareUBO(gl, name, ubo) {
    let index = gl.getUniformBlockIndex(this.program, name)
    gl.uniformBlockBinding(this.program, index, ubo.point)
  }
  /**
   * @param {WebGL2RenderingContext} gl
   */
  deactivate(gl) {
    gl.useProgram(null)
  }
  setUniform(name, value) {
    return this.updateUniform(name, value)
  }

  updateUniform(name, value) {
    const item = this.uniformValues.get(name)
    if (item) {
      item.value = value
    } else {
      this.uniformValues.set(name, {
        value: value
      })
    }
  }
}


/**
 * @param {WebGL2RenderingContext} gl
 * @param {WebGLUniformLocation} location
 * @param {number | Vector2 | Vector3 | Matrix2 | Matrix3 | Matrix4 | Color} value
 * @param {UniformType} type
 * @param {Texture} defaultTexture
 */
function updateUniform(gl, location, value, type, defaultTexture) {
  const arr = new Float32Array(16)
  switch (type) {
    case UniformType.BOOL:
    case UniformType.INT:
      if(typeof value !== "number") return
      gl.uniform1i(location, value)
    case UniformType.FLOAT:
      if(typeof value !== "number") return
      gl.uniform1f(location, value)
      break
    case UniformType.VEC2:
      if(!(value instanceof Vector2)) return
      gl.uniform2f(location, value.x,value.y)
      break
    case UniformType.VEC3:
      if(!(value instanceof Vector3)) return
      gl.uniform3f(location, value.x,value.y,value.z)
      break
    case UniformType.VEC4:
      if(value instanceof Vector4){
        gl.uniform4f(location, value.x,value.y,value.z,value.w)
      }
      if(value instanceof Color){
        gl.uniform4f(location, value.r,value.g,value.b,value.a)
      }
      break
    case UniformType.MAT2:
      if(!(value instanceof Matrix2)) return
      // TODO: Actually update `arr`

      gl.uniformMatrix2fv(location, false, arr)
      break
    case UniformType.MAT3:
      if(!(value instanceof Matrix3)) return
      // TODO: Actually update `arr`
      gl.uniformMatrix3fv(location, false, arr)
      break
    case UniformType.MAT4:
      if(!(value instanceof Matrix4)) return
      value.toArray(arr)
      gl.uniformMatrix4fv(location, false, arr, 0, 16)
      break
    case UniformType.SAMPLER_2D:
      if(value instanceof Texture){
        gl.activeTexture(gl.TEXTURE0 + texSlot)
        gl.bindTexture(gl.TEXTURE_2D, value.webglTex)
        gl.uniform1i(location, texSlot)
      } else {
        gl.activeTexture(gl.TEXTURE0 + texSlot)
        gl.bindTexture(gl.TEXTURE_2D, defaultTexture.webglTex)
        gl.uniform1i(location, texSlot)
      }
      break
    case UniformType.SAMPLER_CUBE:
      if(!(value instanceof Texture)) return
      gl.activeTexture(gl.TEXTURE0 + texSlot)
      gl.bindTexture(gl.TEXTURE_CUBE_MAP, value.webglTex)
      gl.uniform1i(location, texSlot)
  }
}