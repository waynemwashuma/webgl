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
   */
  init(gl, ubos) {
    if (this.program) return
    const programInfo = createProgramFromSrc(gl, this.vSrc, this.fSrc)
    this.program = programInfo.program
    this.uniforms = programInfo.uniforms
    this.uniformBlocks = programInfo.uniformBlocks

    for (const name in this.uniformBlocks) {
      const ubo = ubos.getorSet(gl, name, this.uniformBlocks[name])

      this.prepareUBO(gl, name, ubo)
    }
  }
  /**
   * @param {WebGL2RenderingContext} gl
   */
  activate(gl) {

    // TODO: Separate to diferent texture types
    let texIndex = 0
    gl.useProgram(this.program)
    for (const [name, value] of this.uniformValues) {
      const uniform = this.uniforms[name]
      if(!uniform){
        console.log(`Uniform "${name}" is not avaiable in "${this.constructor.name}"`)
        continue 
      }
      const {location,type} = uniform
      updateUniform(gl,location, value.value, texIndex, type)
      if (
        uniform.type === UniformType.SAMPLER_2D ||
        uniform.type === UniformType.SAMPLER_CUBE)
        texIndex++
    }
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
      item.dirty = true
    } else {
      this.uniformValues.set(name, {
        value: value,
        dirty: true
      })
    }
  }
}


/**
 * @param {WebGL2RenderingContext} gl
 */
function updateUniform(gl,location, value, offset, type) {
  const arr = new Float32Array(16)
  switch (type) {
    case UniformType.BOOL:
    case UniformType.INT:
      gl.uniform1i(location, value)
    case UniformType.FLOAT:
      gl.uniform1f(location, value)
      break
    case UniformType.VEC2:
      gl.uniform2f(location, ...value, 0, 2)
      break
    case UniformType.VEC3:
      gl.uniform3f(location, ...value, 0, 3)
      break
    case UniformType.VEC4:
      gl.uniform4f(location, ...value)
      break
    case UniformType.MAT2:
      gl.uniformMatrix2fv(location, ...value)
      break
    case UniformType.MAT3:
      value.toArray(arr)
      gl.uniformMatrix3fv(location, false, arr)
      break
    case UniformType.MAT4:
      value.toArray(arr)
      
      gl.uniformMatrix4fv(location, false, arr, 0, 16)
      break
    case UniformType.SAMPLER_2D:
      gl.activeTexture(gl.TEXTURE0 + offset)
      gl.bindTexture(gl.TEXTURE_2D, value.webglTex)
      gl.uniform1i(location, offset)
      break
    case UniformType.SAMPLER_CUBE:
      gl.activeTexture(gl.TEXTURE0 + offset)
      gl.bindTexture(gl.TEXTURE_CUBE_MAP, value.webglTex)
      gl.uniform1i(location, offset)
      
  }
}