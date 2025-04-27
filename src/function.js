import {
  CompareFunction,
  TextureCompareMode,
  TextureFilter,
  TextureType,
  TextureWrap,
  UniformType
} from "./constant.js"
import { Attribute, AttributeData, UBOLayout, Uniform } from "./core/index.js"
import { Sampler, Texture } from "./texture/index.js"
/**
 * @param {WebGLRenderingContext} gl
 * @param {number} typedarray
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
 * @param {string} src
 * @param {number} type
 */
export function createshader(gl, src, type) {
  let shader = gl.createShader(type)
  gl.shaderSource(shader, src)
  gl.compileShader(shader)

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.log(`Shader could not compile: 
    ${formatGlsl(src)}
    ========================================
    ${gl.getShaderInfoLog(shader)}
    `);
    gl.deleteShader(shader)
    return null
  }
  return shader
}

/**
 * 
 * @param {WebGL2RenderingContext} gl 
 * @param {SamplerSettings} settings
 */
export function createSampler(gl, settings) {
  const sampler = gl.createSampler()

  updateSampler(gl, sampler, settings)

  return sampler
}

/**
 * @param {WebGL2RenderingContext} gl
 * @param {WebGLSampler} sampler
 * @param {SamplerSettings} settings
 */
function updateSampler(gl, sampler, settings) {
  const anisotropyExtenstion = gl.getExtension("EXT_texture_filter_anisotropic")

  gl.samplerParameteri(sampler, gl.TEXTURE_MAG_FILTER, settings.magnificationFilter)
  gl.samplerParameteri(sampler, gl.TEXTURE_WRAP_S, settings.wrapS)
  gl.samplerParameteri(sampler, gl.TEXTURE_WRAP_T, settings.wrapT)
  gl.samplerParameteri(sampler, gl.TEXTURE_WRAP_R, settings.wrapR)
  gl.samplerParameteri(sampler, gl.TEXTURE_MIN_LOD, settings.lod.min)
  gl.samplerParameteri(sampler, gl.TEXTURE_MAX_LOD, settings.lod.max)

  if (settings.minificationFilter === TextureFilter.LINEAR) {
    if (settings.mipmapFilter === TextureFilter.LINEAR) {
      gl.samplerParameteri(sampler, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    }
    if (settings.mipmapFilter === TextureFilter.NEAREST) {
      gl.samplerParameteri(sampler, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    }
  }

  if (settings.minificationFilter === TextureFilter.NEAREST) {
    if (settings.mipmapFilter === TextureFilter.LINEAR) {
      gl.samplerParameteri(sampler, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
    }
    if (settings.mipmapFilter === TextureFilter.NEAREST) {
      gl.samplerParameteri(sampler, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
    }
  }
  if (anisotropyExtenstion) {
    gl.samplerParameterf(sampler, anisotropyExtenstion.TEXTURE_MAX_ANISOTROPY_EXT, settings.anisotropy)
  }

  if (settings.compareMode = TextureCompareMode.COMPARE_REF_TO_TEXTURE) {
    gl.samplerParameteri(sampler, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE);
    gl.samplerParameteri(sampler, gl.TEXTURE_COMPARE_FUNC, settings.compare)
  } else {
    gl.samplerParameteri(sampler, gl.TEXTURE_COMPARE_MODE, gl.NONE);
  }
}
/**
 * @param {WebGL2RenderingContext} gl
 * @param {Texture} texture
 */
export function createTexture(gl, texture) {
  const webglTexture = gl.createTexture()

  gl.bindTexture(texture.type, webglTexture)
  updateTextureData(gl,texture)
  updateTextureSampler(gl, texture, texture.defaultSampler)
  
  gl.bindTexture(texture.type, null)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
  return webglTexture
}

/**
 * @param {WebGL2RenderingContext} gl
 * @param {Texture} texture
 * @param {Sampler} sampler
 */
export function updateTextureSampler(gl, texture, sampler) {
  const lod = sampler.lod
  const anisotropyExtenstion = gl.getExtension("EXT_texture_filter_anisotropic")

  gl.texParameteri(texture.type, gl.TEXTURE_MAG_FILTER, sampler.magnificationFilter)
  gl.texParameteri(texture.type, gl.TEXTURE_WRAP_S, sampler.wrapS)
  gl.texParameteri(texture.type, gl.TEXTURE_WRAP_T, sampler.wrapT)
  gl.texParameteri(texture.type, gl.TEXTURE_WRAP_R, sampler.wrapR)

  if (lod) {
    gl.texParameteri(texture.type, gl.TEXTURE_MIN_LOD, lod.min)
    gl.texParameteri(texture.type, gl.TEXTURE_MAX_LOD, lod.max)
  }

  if (sampler.minificationFilter === TextureFilter.LINEAR) {
    if (sampler.mipmapFilter === TextureFilter.LINEAR) {
      gl.texParameteri(texture.type, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    }
    if (sampler.mipmapFilter === TextureFilter.NEAREST) {
      gl.texParameteri(texture.type, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    }
  }

  if (sampler.minificationFilter === TextureFilter.NEAREST) {
    if (sampler.mipmapFilter === TextureFilter.LINEAR) {
      gl.texParameteri(texture.type, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
    }
    if (sampler.mipmapFilter === TextureFilter.NEAREST) {
      gl.texParameteri(texture.type, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
    }
  }
  if (anisotropyExtenstion) {
    gl.texParameterf(texture.type, anisotropyExtenstion.TEXTURE_MAX_ANISOTROPY_EXT, sampler.anisotropy)
  }

  if (sampler.compareMode = TextureCompareMode.COMPARE_REF_TO_TEXTURE) {
    gl.texParameteri(texture.type, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE);
    gl.texParameteri(texture.type, gl.TEXTURE_COMPARE_FUNC, sampler.compare)
  } else {
    gl.texParameteri(texture.type, gl.TEXTURE_COMPARE_MODE, gl.NONE);
  }
}

/**
 * 
 * @param {WebGL2RenderingContext} gl 
 * @param {Texture} texture 
 */
export function updateTextureData(gl, texture) {
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, texture.flipY)

  switch (texture.type) {
    case TextureType.TEXTURE_2D:
      updateTexture2D(gl, texture)
      break;
    case TextureType.TEXTURE_CUBE_MAP:
      updateCubeMap(gl,texture)
    default:
      break;
  }
  if(texture.generateMipmaps){
    gl.generateMipmap(texture.type)
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
}
/**
 * @param {WebGL2RenderingContext} gl
 * @param {WebGLShader} vshader 
 * @param {WebGLShader} fshader 
 * @param {ReadonlyMap<string, Attribute>} attributes 
 * 
 */
export function createProgram(gl, vshader, fshader, attributes) {
  let program = gl.createProgram()
  gl.attachShader(program, vshader)
  gl.attachShader(program, fshader)

  for (const [name, attribute] of attributes) {
    gl.bindAttribLocation(program, attribute.id, attribute.name)
  }
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
    ${gl.getProgramInfoLog(program)}
    `);
    gl.deleteProgram(program)
    return null
  }

  gl.detachShader(program, vshader)
  gl.detachShader(program, fshader)
  gl.deleteShader(vshader)
  gl.deleteShader(fshader)
  return {
    program,
    uniforms: getActiveUniforms(gl, program),
    uniformBlocks: getActiveUniformBlocks(gl, program)
  }
}

/**
 * @param {WebGL2RenderingContext} gl
 * @param {ReadonlyMap<string, Attribute>} attributes
 * @param {ReadonlyMap<string, AttributeData>} meshData
 * @param {Uint16Array | Uint32Array} [indices] 
 */
export function createVAO(gl, attributes, meshData, indices) {
  const vao = gl.createVertexArray()
  gl.bindVertexArray(vao)
  if (indices != void 0) {
    const buffer = gl.createBuffer()

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)
  }
  for (const [name, data] of meshData) {
    const attribute = attributes.get(name)

    if (!attribute) {
      throw `The attribute "${name}" is not defined in the \`AttributeMap()\``
    }

    const buffer = gl.createBuffer()

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.value), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(attribute.id)
    gl.vertexAttribPointer(attribute.id, attribute.size, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(attribute.id)
    gl.vertexAttribPointer(attribute.id, attribute.size, attribute.type, false, 0, 0)
  }

  return vao
}

/**
 * @param {WebGL2RenderingContext} gl
 * @param {string} vshader
 * @param {string} fshader
 * @param {ReadonlyMap<string, Attribute>} attributes 
 */
export function createProgramFromSrc(gl, vshader, fshader, attributes) {
  let v = createshader(gl, vshader, gl.VERTEX_SHADER)
  let f = createshader(gl, fshader, gl.FRAGMENT_SHADER)
  if (f == null || v == null) {
    gl.deleteShader(v)
    gl.deleteShader(f)
    return null
  }
  let program = createProgram(gl, v, f, attributes)

  return program
}

/**
 * @param {{ type: any; }} uniform
 */
export function sizeofUniform(uniform) {
  const type = uniform.type
  switch (type) {
    case UniformType.INT:
    case UniformType.FLOAT:
    case UniformType.BOOL:
    case UniformType.SAMPLER_2D:
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
    default:
      return 0
  }
}
/**
 * @param {{ constructor: { name: string; }; }} uniform
 */
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
      return UniformType.SAMPLER_2D
  }
  throw "Unsupported type of uniform value  \'" + name + "\'";
}

/**
 * @param {WebGL2RenderingContext} gl
 * @param {WebGLProgram} program
 * @param {number} index
 */
function getUBOLayout(gl, program, index) {
  const size = gl.getActiveUniformBlockParameter(
    program,
    index,
    gl.UNIFORM_BLOCK_DATA_SIZE
  )
  const uniformIndices = gl.getActiveUniformBlockParameter(
    program,
    index,
    gl.UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES
  )
  const offsets = gl.getActiveUniforms(program, uniformIndices, gl.UNIFORM_OFFSET);
  const strides = gl.getActiveUniforms(program, uniformIndices, gl.UNIFORM_ARRAY_STRIDE);
  const fields = new Map()

  uniformIndices.forEach((/** @type {number} */ index, /** @type {string | number} */ i) => {
    const info = gl.getActiveUniform(program, index);
    return fields.set(info.name, {
      type: info.type,
      size: info.size,
      offset: offsets[i],
      stride: strides[i]
    })
  });
  return new UBOLayout("", size, fields)
}

/**
 * @param {WebGL2RenderingContext} gl
 * @param {WebGLProgram} program
 * @returns {Map<string,Uniform>}
 */
function getActiveUniforms(gl, program) {
  const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  const map = new Map()
  for (let i = 0; i < numUniforms; i++) {
    const info = gl.getActiveUniform(program, i);
    const [blockIndex] = gl.getActiveUniforms(
      program,
      [i],
      gl.UNIFORM_BLOCK_INDEX
    )
    if (blockIndex !== -1) continue
    map.set(info.name, new Uniform(
      gl.getUniformLocation(program, info.name),
      info.type,
      info.size
    ))
  }

  return map
}

/**
 * @param {WebGL2RenderingContext} gl 
 * @param {WebGLProgram} program 
 * @returns {Map<string,UBOLayout>}
 */
function getActiveUniformBlocks(gl, program) {
  const results = new Map()
  const numBlocks = gl.getProgramParameter(program, gl.ACTIVE_UNIFORM_BLOCKS);

  for (let i = 0; i < numBlocks; i++) {
    const name = gl.getActiveUniformBlockName(program, i);
    results.set(name, getUBOLayout(gl, program, i))
  }
  return results
}

/**
 * @param {WebGL2RenderingContext} gl
 * @param {Texture} texture
 */
function updateTexture2D(gl, texture) {
  const level = 0, border = 0
  const {
    internalFormat,
    format,
    dataFormat,
    data,
    width,
    height
  } = texture
  if (!data[0]) return
  gl.texImage2D(
    texture.type,
    level,
    internalFormat,
    width,
    height,
    border,
    format,
    dataFormat,
    data[0]
  )
}

/**
 * @param {WebGL2RenderingContext} gl
 * @param {Texture} texture
 */
function updateCubeMap(gl, texture) {
  const level = 0, border = 0
  const {
    internalFormat,
    format,
    dataFormat,
    data,
    width,
    height
  } = texture
  if (data.length < 6) return
  for (let i = 0; i < 6; i++) {
    const src = data[i];

    gl.texImage2D(
      gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
      level,
      internalFormat,
      width,
      height,
      border,
      format,
      dataFormat,
      src
    )
  }
}

/**
 * @param {string} code
 */
function formatGlsl(code) {
  const normalized = code.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalized.split("\n")

  return lines.map((ln, idx) => {
    const num = (idx + 1).toString()
    return `${num}: ${ln}`;
  })
  .join("\n");
}

/**
 * @typedef SamplerSettings
 * @property {TextureFilter} [minificationFilter]
 * @property {TextureFilter} [magnificationFilter]
 * @property {TextureFilter} [mipmapFilter]
 * @property {TextureWrap} [wrapS]
 * @property {TextureWrap} [wrapT]
 * @property {TextureWrap} [wrapR]
 * @property {SamplerLODSettings} [lod]
 * @property {number} [anisotropy]
 * @property {TextureCompareMode} [compareMode]
 * @property {CompareFunction} [compare]
 */

/**
 * @typedef SamplerLODSettings
 * @property {number} max
 * @property {number} min
 */