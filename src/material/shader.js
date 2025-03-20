import {
  createProgramFromSrc,
  typeOfUniform,
  sizeofUniform
} from "../function.js"
import {
  UNI_CAM_MAT,
  UNI_PROJ_MAT,
  UNI_MODEL_MAT,
  UniformType,
  BlendMode,
  DrawMode,
  CullFace
} from "../constant.js"

export class Shader {
  drawMode = DrawMode.TRIANGLES
  cullFace = CullFace.BACK
  distBlendFunc = BlendMode.ONE_MINUS_SRC
  srcBlendFunc = BlendMode.SRC_ALPHA
  /**
   * @param {string} vshaderSrc
   * @param {string} fshaderSrc
   */
  constructor(vshaderSrc, fshaderSrc, uniforms = {}) {
    this.vSrc = vshaderSrc
    this.fSrc = fshaderSrc
    this.program = null
    this.uniforms = {}
    for (let name in uniforms) {
      this.setUniform(name, uniforms[name])
    }
  }
  /**
   * @param {WebGL2RenderingContext} gl
   */
  init(gl) {
    if (this.program) return
    this.program = createProgramFromSrc(gl, this.vSrc, this.fSrc)

    for (let name in this.uniforms) {
      let uniform = this.uniforms[name]
      uniform.type = typeOfUniform(
        uniform.value
      )
      uniform.size = sizeofUniform(uniform)
      //if (uniform.type === UniformType.TEXTURE)
      //TODO - warn if location is null.
      uniform.location = gl.getUniformLocation(this.program, name)
    }
  }
  /**
   * @param {WebGL2RenderingContext} gl
   */
  activate(gl) {
    let texIndex = 0
    gl.useProgram(this.program)
    for (var name in this.uniforms) {
      let u = this.uniforms[name]
      updateUniform(gl, u, texIndex)
      if (u.type === UniformType.TEXTURE)
        texIndex++
    }
    gl.cullFace(this.cullFace);
  }
  /**
   * @param {WebGL2RenderingContext} gl
   */
  prepareUBO(gl, ubo) {
    let index = gl.getUniformBlockIndex(this.program, ubo.name)
    gl.uniformBlockBinding(this.program, index, ubo.point)
  }
  /**
   * @param {WebGL2RenderingContext} gl
   */
  deactivate(gl) {
    gl.useProgram(null)
  }
  setUniform(name, value, type) {
    if (name in this.uniforms)
      return this.updateUniform(name, value)

    this.uniforms[name] = {
      value,
      type: 0,
      location: null,
      size: 0
    }
  }
  updateUniform(name, value) {
    this.uniforms[name].value = value
  }
}


/**
 * @param {WebGL2RenderingContext} gl
 */
function updateUniform(gl, uniform, offset) {
  const arr = new Float32Array(uniform.size)
  switch (uniform.type) {
    case UniformType.BOOL:
    case UniformType.INT:
      gl.uniform1i(uniform.location, uniform.value)
    case UniformType.FLOAT:
      gl.uniform1f(uniform.location, uniform.value)
      break
    case UniformType.VEC2:
      gl.uniform2f(uniform.location, ...uniform.value, 0, 2)
      break
    case UniformType.VEC3:
      gl.uniform3f(uniform.location, ...uniform.value, 0, 3)
      break
    case UniformType.VEC4:
      gl.uniform4f(uniform.location,...uniform.value)
      break
    case UniformType.MAT2:
      gl.uniformMatrix2fv(uniform.location,)
      break
    case UniformType.MAT3:
      uniform.value.toArray(arr)
      gl.uniformMatrix3fv(uniform.location, arr, false, arr, 0, 9)
      break
    case UniformType.MAT4:
      uniform.value.toArray(arr)
      gl.uniformMatrix4fv(uniform.location, false, arr, 0, 16)
      break
    case UniformType.TEXTURE:
      gl.activeTexture(gl.TEXTURE0 + offset)
      gl.bindTexture(gl.TEXTURE_2D, uniform.value.webglTex)
      gl.uniform1i(uniform.location, offset)
      break
    case UniformType.ARR_VEC2:
      for (let i = 0; i < uniform.value.length; i++) {
        uniform.value[i].toArray(arr, i * 2)
      }
      gl.uniform2fv(uniform.location, arr)
      break
    case UniformType.ARR_VEC3:
      for (let i = 0; i < uniform.value.length; i++) {
        uniform.value[i].toArray(arr, i * 3)
      }
      gl.uniform3fv(uniform.location, arr)
      break
    case UniformType.ARR_VEC4:
      for (let i = 0; i < uniform.value.length; i++) {
        uniform.value[i].toArray(arr, i * 4)
      }
      gl.uniform4fv(uniform.location, arr)
      break
    case UniformType.ARR_MAT2:
      for (let i = 0; i < uniform.value.length; i++) {
        uniform.value[i].toArray(arr, i * 4)
      }
      gl.uniformMatrix2fv(uniform.location, false, arr)
      break
    case UniformType.ARR_MAT2:
      for (let i = 0; i < uniform.value.length; i++) {
        uniform.value[i].toArray(arr, i * 4)
      }
      gl.uniformMatrix2fv(uniform.location, false, arr)
      break
    case UniformType.ARR_MAT2:
      for (let i = 0; i < uniform.value.length; i++) {
        uniform.value[i].toArray(arr, i * 4)
      }
      gl.uniformMatrix4fv(uniform.location, false, arr)
      break
    case UniformType.ARR_FLOAT:
    case UniformType.ARR_BOOL:
      break
  }
}