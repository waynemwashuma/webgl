import {
  ATTR_POSITION_LOC,
  ATTR_NORMAL_LOC,
  ATTR_UV_LOC,
  ATTR_POSITION_NAME,
  ATTR_NORMAL_NAME,
  ATTR_UV_NAME,
  UniformType
} from "./constant.js"
/**
 * @param {WebGLRenderingContext} gl
 */
export function createBuffer(gl, typedarray, isstatic = true) {
  let buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, typedarray,
    isstatic ? gl.STATIC_DRAW : gl.DYNAMIC_DRAW)
  gl.bindBuffer(gl.ARRAY_BUFFER, null)
  return buffer
}
/**
 * @param {WebGLRenderingContext} gl
 */
export function createshader(gl, src, type) {
  let shader = gl.createShader(type)
  gl.shaderSource(shader, src)
  gl.compileShader(shader)
  
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.log(`Shader could not compile: 
    ${src}
    ========================================
    ${gl.getShaderInfoLog(shader)}
    `);
    gl.deleteShader(shader)
    return null
  }
  return shader
}
/**
 * @param {WebGLRenderingContext} gl
 */
export function createTexture(gl, img, flipY) {
  let tex = gl.createTexture()
  
  if (flipY) gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
  gl.bindTexture(gl.TEXTURE_2D, tex)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST)
  gl.generateMipmap(gl.TEXTURE_2D)
  gl.bindTexture(gl.TEXTURE_2D, null)
  
  if (flipY) gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
  return tex
}
/**
 * @param {WebGLRenderingContext} gl
 */
export function createProgram(gl, vshader, fshader) {
  let program = gl.createProgram()
  gl.attachShader(program, vshader)
  gl.attachShader(program, fshader)
  gl.bindAttribLocation(program, ATTR_POSITION_LOC, ATTR_POSITION_NAME)
  gl.bindAttribLocation(program, ATTR_NORMAL_LOC, ATTR_NORMAL_NAME)
  gl.bindAttribLocation(program, ATTR_UV_LOC, ATTR_UV_NAME)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.log(`Program could not be linked: 
    ========================================
    ${gl.getProgramInfoLog(program)}
    `);
    gl.deleteProgram(program)
    return null
  }
  gl.validateProgram(program)
  if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
    console.log(`Program could not be validated: 
    ========================================
    ${gl.getProgramInfoLog(shader)}
    `);
    gl.deleteProgram(shader)
    return null
  }
  
  gl.detachShader(program, vshader)
  gl.detachShader(program, fshader)
  gl.deleteShader(vshader)
  gl.deleteShader(fshader)
  return {
    program,
    uniforms:getActiveUniforms(gl, program),
    uniformBlocks:getActiveUniformBlocks(gl,program)
  }
}

/**
 * @param {WebGL2RenderingContext} gl
 */
export function createVAO(gl, indices, vertices, normals, uv) {
  let vao = {
    drawMode: gl.TRIANGLES,
    attributes: {
      
    }
  }
  vao.vao = gl.createVertexArray()
  gl.bindVertexArray(vao.vao)
  if (indices != void 0) {
    let dict = vao.attributes.indices = {}
    let buffer = gl.createBuffer()
    dict.buffer = buffer
    dict.size = 1
    dict.count = indices.length
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)
  }
  if (vertices != void 0) {
    let dict = vao.attributes.position = {}
    let buffer = gl.createBuffer()
    dict.buffer = buffer
    dict.size = 3;
    dict.count = vertices.length / dict.size
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(ATTR_POSITION_LOC)
    gl.vertexAttribPointer(ATTR_POSITION_LOC, dict.size, gl.FLOAT, false, 0, 0)
  }
  if (normals != void 0) {
    let dict = vao.attributes.normals = {}
    let buffer = gl.createBuffer()
    dict.buffer = buffer
    dict.size = 3;
    dict.count = normals.length / dict.size
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(ATTR_NORMAL_LOC)
    gl.vertexAttribPointer(ATTR_NORMAL_LOC, dict.size, gl.FLOAT, false, 0, 0)
  }
  if (uv != void 0) {
    let dict = vao.attributes.uv = {}
    let buffer = gl.createBuffer()
    dict.buffer = buffer
    dict.size = 2;
    dict.count = vertices.length / dict.size
    
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(ATTR_UV_LOC)
    gl.vertexAttribPointer(ATTR_UV_LOC, dict.size, gl.FLOAT, false, 0, 0)
  }
  gl.bindVertexArray(null)
  gl.bindBuffer(gl.ARRAY_BUFFER, null)
  return vao
}

/**
 * @param {WebGL2RenderingContext} gl
 */
export function createProgramFromSrc(gl, vshader, fshader) {
  let v = createshader(gl, vshader, gl.VERTEX_SHADER)
  let f = createshader(gl, fshader, gl.FRAGMENT_SHADER)
  if (f == null || v == null) {
    gl.deleteShader(v)
    gl.deleteShader(f)
    return null
  }
  let program = createProgram(gl, v, f)
  console.log(program)
  return program
}

export function sizeofUniform(uniform) {
  const type = uniform.type
  switch (type) {
    case UniformType.INT:
    case UniformType.FLOAT:
    case UniformType.BOOL:
    case UniformType.TEXTURE:
      return 1
    case UniformType.MAT4:
      return 16
    case UniformType.MAT3:
      return 9
    case UniformType.VEC2:
      return 2
    case UniformType.VEC3:
      return 3 //Special Case
    case UniformType.VEC4:
    case UniformType.MAT2:
      return 4
    case UniformType.ARR_FLOAT:
      return uniform.value.length
    case UniformType.ARR_FLOAT:
    case UniformType.ARR_BOOL:
    case UniformType.ARR_INT:
      return uniform.value.length
    case UniformType.ARR_VEC2:
      return uniform.value.length * 2
    case UniformType.ARR_VEC3:
      return uniform.value.length * 3
    case UniformType.ARR_VEC4:
    case UniformType.ARR_MAT2:
      return uniform.value.length * 4
    case UniformType.ARR_MAT3:
      return uniform.value.length * 9
    case UniformType.ARR_MAT4:
      return uniform.value.length * 16
    default:
      return 0
  }
}
export function typeOfUniform(uniform) {
  if (uniform === void 0) return -1
  let name = uniform.constructor.name.toLowerCase()
  let type = typeof uniform
  
  if (type == "boolean")
    return UniformType.BOOL
  if (type == "number")
    return UniformType.FLOAT
  if (type == "object") {
    if (name === "vector2")
      return UniformType.VEC2
    if (name === "vector3")
      return UniformType.VEC3
    if (name === "vector4" || name === "color" || name == "quaternion")
      return UniformType.VEC4
    if (name === "matrix2")
      return UniformType.MAT2
    if (name === "matrix3")
      return UniformType.MAT3
    if (name === "matrix4")
      return UniformType.MAT4
    if (name === "texture")
      return UniformType.TEXTURE
    if (name === "array") {
      let eltype = typeOfUniform(uniform[0])
      return convertToArrUniType(eltype)
    }
    return UniformType.ARR
    if (name === "object")
      return UniformType.STRUCT
    //Todo : add UBO for objects here
  }
  throw "Unsupported type of uniform value  \'" + name + "\'";
}

function convertToArrUniType(type) {
  switch (type) {
    case UniformType.INT:
      return UniformType.ARR_INT
    case UniformType.FLOAT:
      return UniformType.ARR_FLOAT
    case UniformType.BOOL:
      return UniformType.ARR_BOOL
    case UniformType.MAT4:
      return UniformType.ARR_MAT4
    case UniformType.MAT3:
      return UniformType.ARR_MAT3
    case UniformType.VEC2:
      return UniformType.ARR_VEC2
    case UniformType.VEC3:
      return UniformType.ARR_VEC3
    case UniformType.VEC4:
      return UniformType.ARR_VEC4
    default:
      return 0
  }
}

/**
 * @param {WebGL2RenderingContext} gl
 * @param {WebGLProgram} program
 * @param {string} name
 */
function getUBOLayout(gl, program, index) {
  const size = gl.getActiveUniformBlockParameter(
    program,
    index,
    gl.UNIFORM_BLOCK_DATA_SIZE
  )
  const numUniforms = gl.getActiveUniformBlockParameter(
    program,
    index,
    gl.UNIFORM_BLOCK_ACTIVE_UNIFORMS
  );
  
  const uniformIndices = gl.getActiveUniformBlockParameter(
    program,
    index,
    gl.UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES
  )
  const offsets = gl.getActiveUniforms(program, uniformIndices, gl.UNIFORM_OFFSET);
  const strides = gl.getActiveUniforms(program, uniformIndices, gl.UNIFORM_ARRAY_STRIDE);
  
  const fields = {}
  uniformIndices.forEach((index, i) => {
    const info = gl.getActiveUniform(program, index);
    return fields[info.name] = {
      type: info.type,
      size: info.size,
      offset: offsets[i],
      stride: strides[i]
    }
  });
  return {
    name,
    size,
    fields
  }
}

/**
 * @param {WebGL2RenderingContext} gl
 * @param {WebGLProgram} program
 */
function getActiveUniforms(gl, program) {
  const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  const array = {}
  for (let i = 0; i < numUniforms; i++) {
    const info = gl.getActiveUniform(program, i);
    const [blockIndex] = gl.getActiveUniforms(
      program,
      [i],
      gl.UNIFORM_BLOCK_INDEX
    )
    if (blockIndex !== -1) continue
    array[info.name] = {
      size: info.size,
      type: info.type,
      location: gl.getUniformLocation(program, info.name)
    }
  }
  
  return array
}

function getActiveUniformBlocks(gl, program) {
  const results = {}
  const numBlocks = gl.getProgramParameter(program, gl.ACTIVE_UNIFORM_BLOCKS);
  
  for (let i = 0; i < numBlocks; i++) {
    const name = gl.getActiveUniformBlockName(program, i);
    results[name] = getUBOLayout(gl, program, i)
  }
  return results
}