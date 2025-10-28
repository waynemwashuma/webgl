import { Mesh } from "./mesh/index.js"
import {
  CompareFunction,
  TextureFormat,
  TextureFilter,
  TextureType,
  TextureWrap,
  UniformType,
  GlDataType
} from "./constant.js"
import { Attribute, UBOLayout, Uniform } from "./core/index.js"
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
 * @param {WebGL2RenderingContext} gl
 * @param {Texture} texture
 */
export function createTexture(gl, texture) {
  const webglTexture = gl.createTexture()

  gl.bindTexture(texture.type, webglTexture)
  updateTextureData(gl, texture)
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

  if (texture.generateMipmaps) {
    if (sampler.minificationFilter === TextureFilter.Linear) {
      if (sampler.mipmapFilter === TextureFilter.Linear) {
        gl.texParameteri(texture.type, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      } else if (sampler.mipmapFilter === TextureFilter.Nearest) {
        gl.texParameteri(texture.type, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
      }
    } else if (sampler.minificationFilter === TextureFilter.Nearest) {
      if (sampler.mipmapFilter === TextureFilter.Linear) {
        gl.texParameteri(texture.type, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
      } else if (sampler.mipmapFilter === TextureFilter.Nearest) {
        gl.texParameteri(texture.type, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
      }
    }
  } else {
    if (sampler.minificationFilter === TextureFilter.Nearest) {
      gl.texParameteri(texture.type, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    } else if (sampler.minificationFilter === TextureFilter.Linear) {
      gl.texParameteri(texture.type, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    }
  }
  if (anisotropyExtenstion) {
    gl.texParameterf(texture.type, anisotropyExtenstion.TEXTURE_MAX_ANISOTROPY_EXT, sampler.anisotropy)
  }

  if (sampler.compare !== undefined) {
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
    case TextureType.Texture2D:
      updateTexture2D(gl, texture)
      break;
    case TextureType.TextureCubeMap:
      updateCubeMap(gl, texture)
    default:
      break;
  }
  if (texture.generateMipmaps) {
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

  gl.useProgram(program)
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
 * @param {ReadonlyMap<string, Attribute>} attributeMap
 * @param {Mesh} geometry
 */
export function createVAO(gl, attributeMap, geometry) {
  const vao = gl.createVertexArray()
  gl.bindVertexArray(vao)

  updateVAO(gl, attributeMap, geometry)

  return vao
}

/**
 * @param {WebGL2RenderingContext} gl
 * @param {ReadonlyMap<string, Attribute>} attributeMap
 * @param {Mesh} geometry
 */
export function updateVAO(gl, attributeMap, geometry) {
  const { indices, attributes } = geometry

  if (indices != void 0) {
    const buffer = gl.createBuffer()

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)
  }
  for (const [name, data] of attributes) {
    const attribute = attributeMap.get(name)

    if (!attribute) {
      throw `The attribute "${name}" is not defined in the \`AttributeMap()\``
    }

    const buffer = gl.createBuffer()

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, data.value, gl.STATIC_DRAW)
    gl.enableVertexAttribArray(attribute.id)
    setVertexAttribute(gl, attribute.id, attribute.type, attribute.size)
  }
}

/**
 *
 * @param {WebGL2RenderingContext} gl - The WebGL2 context.
 * @param {number} index - The attribute location.
 * @param {GlDataType} type - One of the values from GlDataType.
 * @param {number} size - Number of components per attribute (1-4).
 * @param {number} [stride = 0] - Byte stride between attributes.
 * @param {number} [offset = 0] - Byte offset of the first attribute.
 * @param {boolean} [normalized = false] - Whether fixed-point values should be normalized.
 */
function setVertexAttribute(gl, index, type, size, stride = 0, offset = 0, normalized = false) {
  switch (type) {
    case GlDataType.Float:
      gl.vertexAttribPointer(index, size, type, normalized, stride, offset);
      break;

    case GlDataType.Byte:
    case GlDataType.UnsignedByte:
    case GlDataType.Short:
    case GlDataType.UnsignedShort:
    case GlDataType.Int:
    case GlDataType.UnsignedInt:
      gl.vertexAttribIPointer(index, size, type, stride, offset);
      break;

    default:
      throw new Error(`Unsupported GlDataType: ${type}`);
  }
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
    case UniformType.Int:
    case UniformType.Float:
    case UniformType.Bool:
    case UniformType.Sampler2D:
      return 1
    case UniformType.Mat4:
      return 16
    case UniformType.Mat3:
      return 9
    case UniformType.Vec2:
      return 2
    case UniformType.Vec3:
      return 3 //Special Case
    case UniformType.Vec4:
    case UniformType.Mat2:
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
    return UniformType.Bool
  if (type == "number")
    return UniformType.Float
  if (type == "object") {
    if (name === "vector2")
      return UniformType.Vec2
    if (name === "vector3")
      return UniformType.Vec3
    if (name === "vector4" || name === "color" || name == "quaternion")
      return UniformType.Vec4
    if (name === "matrix2")
      return UniformType.Mat2
    if (name === "matrix3")
      return UniformType.Mat3
    if (name === "matrix4")
      return UniformType.Mat4
    if (name === "texture")
      return UniformType.Sampler2D
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
  let texture2d = 0, cubemap = 0, texture2dArray = 0, texture3d = 0
  const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  const map = new Map()
  for (let i = 0; i < numUniforms; i++) {
    const info = gl.getActiveUniform(program, i)
    const location = gl.getUniformLocation(program, info.name)
    const [blockIndex] = gl.getActiveUniforms(
      program,
      [i],
      gl.UNIFORM_BLOCK_INDEX
    )
    if (blockIndex !== -1) continue
    const uniform = new Uniform(
      location,
      info.type,
      info.size
    )

    switch (info.type) {
      case UniformType.Sampler2D:
      case UniformType.ISampler2D:
      case UniformType.USampler2D:
      case UniformType.Sampler2DShadow:
        uniform.texture_unit = texture2d
        texture2d += 1
        gl.uniform1i(location, uniform.texture_unit)
        break
      case UniformType.Sampler2DArray:
      case UniformType.ISampler2DArray:
      case UniformType.USampler2DArray:
      case UniformType.Sampler2DArrayShadow:
        uniform.texture_unit = texture2dArray
        texture2dArray += 1
        gl.uniform1i(location, uniform.texture_unit)
        break
      case UniformType.SamplerCube:
      case UniformType.ISamplerCube:
      case UniformType.USamplerCube:
      case UniformType.SamplerCubeShadow:
        uniform.texture_unit = cubemap
        cubemap += 1
        gl.uniform1i(location, uniform.texture_unit)
        break
      case UniformType.Sampler3D:
      case UniformType.ISampler3D:
      case UniformType.USampler3D:
        uniform.texture_unit = texture3d
        texture3d += 1
        gl.uniform1i(location, uniform.texture_unit)
        break
    }
    map.set(info.name, uniform)
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
  const { internalFormat, format, dataType } = getWebGLTextureFormat(gl, texture.format)

  const { data, width, height } = texture
  const pixelSize = getTextureFormatSize(texture.format)
  if (data && data.byteLength < width * height * pixelSize) {
    return console.warn(`Provided image data does not fit a ${width}x${height} 2d texture`)
  }
  gl.texImage2D(
    texture.type,
    level,
    internalFormat,
    width,
    height,
    border,
    format,
    dataType,
    data ? convertBufferToTypedArray(data, dataType) : null
  )
}

/**
 * @param {WebGL2RenderingContext} gl
 * @param {Texture} texture
 */
function updateCubeMap(gl, texture) {
  const level = 0, border = 0
  const { internalFormat, format, dataType } = getWebGLTextureFormat(gl, texture.format)
  const { data, width, height } = texture
  const pixelSize = getTextureFormatSize(texture.format)
  const sliceSize = pixelSize * width * height

  if (data && data.byteLength < sliceSize * 6) {
    return console.warn(`Provided image data does not fit a ${width}x${height} cubemap texture`)
  }

  for (let i = 0; i < 6; i++) {
    const offset = sliceSize * i
    const src = data ? convertBufferToTypedArray(data, dataType, offset, sliceSize) : null

    gl.texImage2D(
      gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
      level,
      internalFormat,
      width,
      height,
      border,
      format,
      dataType,
      src
    )
  }
}

/**
 * @param {WebGL2RenderingContext} gl
 * @param {number} format
 * @returns {{ internalFormat: number, format: number, dataType: number } | null}
 */
export function getWebGLTextureFormat(gl, format) {
  switch (format) {
    // --- 8-bit ---
    case TextureFormat.R8Unorm:
      return { internalFormat: gl.R8, format: gl.RED, dataType: gl.UNSIGNED_BYTE };
    case TextureFormat.R8Snorm:
      return { internalFormat: gl.R8_SNORM, format: gl.RED, dataType: gl.BYTE };
    case TextureFormat.R8Uint:
      return { internalFormat: gl.R8UI, format: gl.RED_INTEGER, dataType: gl.UNSIGNED_BYTE };
    case TextureFormat.R8Sint:
      return { internalFormat: gl.R8I, format: gl.RED_INTEGER, dataType: gl.BYTE };

    // --- 16-bit ---
    case TextureFormat.R16Uint:
      return { internalFormat: gl.R16UI, format: gl.RED_INTEGER, dataType: gl.UNSIGNED_SHORT };
    case TextureFormat.R16Sint:
      return { internalFormat: gl.R16I, format: gl.RED_INTEGER, dataType: gl.SHORT };
    case TextureFormat.R16Float:
      return { internalFormat: gl.R16F, format: gl.RED, dataType: gl.HALF_FLOAT };
    case TextureFormat.RG8Unorm:
      return { internalFormat: gl.RG8, format: gl.RG, dataType: gl.UNSIGNED_BYTE };
    case TextureFormat.RG8Snorm:
      return { internalFormat: gl.RG8_SNORM, format: gl.RG, dataType: gl.BYTE };
    case TextureFormat.RG8Uint:
      return { internalFormat: gl.RG8UI, format: gl.RG_INTEGER, dataType: gl.UNSIGNED_BYTE };
    case TextureFormat.RG8Sint:
      return { internalFormat: gl.RG8I, format: gl.RG_INTEGER, dataType: gl.BYTE };

    // --- 32-bit ---
    case TextureFormat.R32Uint:
      return { internalFormat: gl.R32UI, format: gl.RED_INTEGER, dataType: gl.UNSIGNED_INT };
    case TextureFormat.R32Sint:
      return { internalFormat: gl.R32I, format: gl.RED_INTEGER, dataType: gl.INT };
    case TextureFormat.R32Float:
      return { internalFormat: gl.R32F, format: gl.RED, dataType: gl.FLOAT };
    case TextureFormat.RG16Uint:
      return { internalFormat: gl.RG16UI, format: gl.RG_INTEGER, dataType: gl.UNSIGNED_SHORT };
    case TextureFormat.RG16Sint:
      return { internalFormat: gl.RG16I, format: gl.RG_INTEGER, dataType: gl.SHORT };
    case TextureFormat.RG16Float:
      return { internalFormat: gl.RG16F, format: gl.RG, dataType: gl.HALF_FLOAT };
    case TextureFormat.RGBA8Unorm:
      return { internalFormat: gl.RGBA8, format: gl.RGBA, dataType: gl.UNSIGNED_BYTE };
    case TextureFormat.RGBA8UnormSRGB:
      return { internalFormat: gl.SRGB8_ALPHA8, format: gl.RGBA, dataType: gl.UNSIGNED_BYTE };
    case TextureFormat.RGBA8Snorm:
      return { internalFormat: gl.RGBA8_SNORM, format: gl.RGBA, dataType: gl.BYTE };
    case TextureFormat.RGBA8Uint:
      return { internalFormat: gl.RGBA8UI, format: gl.RGBA_INTEGER, dataType: gl.UNSIGNED_BYTE };
    case TextureFormat.RGBA8Sint:
      return { internalFormat: gl.RGBA8I, format: gl.RGBA_INTEGER, dataType: gl.BYTE };

    // --- 64-bit ---
    case TextureFormat.RG32Uint:
      return { internalFormat: gl.RG32UI, format: gl.RG_INTEGER, dataType: gl.UNSIGNED_INT };
    case TextureFormat.RG32Sint:
      return { internalFormat: gl.RG32I, format: gl.RG_INTEGER, dataType: gl.INT };
    case TextureFormat.RG32Float:
      return { internalFormat: gl.RG32F, format: gl.RG, dataType: gl.FLOAT };
    case TextureFormat.RGBA16Uint:
      return { internalFormat: gl.RGBA16UI, format: gl.RGBA_INTEGER, dataType: gl.UNSIGNED_SHORT };
    case TextureFormat.RGBA16Sint:
      return { internalFormat: gl.RGBA16I, format: gl.RGBA_INTEGER, dataType: gl.SHORT };
    case TextureFormat.RGBA16Float:
      return { internalFormat: gl.RGBA16F, format: gl.RGBA, dataType: gl.HALF_FLOAT };

    // --- 128-bit ---
    case TextureFormat.RGBA32Uint:
      return { internalFormat: gl.RGBA32UI, format: gl.RGBA_INTEGER, dataType: gl.UNSIGNED_INT };
    case TextureFormat.RGBA32Sint:
      return { internalFormat: gl.RGBA32I, format: gl.RGBA_INTEGER, dataType: gl.INT };
    case TextureFormat.RGBA32Float:
      return { internalFormat: gl.RGBA32F, format: gl.RGBA, dataType: gl.FLOAT };

    // --- Depth / Stencil ---
    case TextureFormat.Depth16Unorm:
      return { internalFormat: gl.DEPTH_COMPONENT16, format: gl.DEPTH_COMPONENT, dataType: gl.UNSIGNED_SHORT };
    case TextureFormat.Depth24Plus:
      return { internalFormat: gl.DEPTH_COMPONENT24, format: gl.DEPTH_COMPONENT, dataType: gl.UNSIGNED_INT };
    case TextureFormat.Depth32Float:
      return { internalFormat: gl.DEPTH_COMPONENT32F, format: gl.DEPTH_COMPONENT, dataType: gl.FLOAT };
    case TextureFormat.Depth24PlusStencil8:
      return { internalFormat: gl.DEPTH24_STENCIL8, format: gl.DEPTH_STENCIL, dataType: gl.UNSIGNED_INT_24_8 };
    case TextureFormat.Depth32FloatStencil8:
      return { internalFormat: gl.DEPTH32F_STENCIL8, format: gl.DEPTH_STENCIL, dataType: gl.FLOAT_32_UNSIGNED_INT_24_8_REV };

    default:
      return null;
  }
}

/**
 * Returns the size in bytes per texel for a given TextureFormat.
 * @param {TextureFormat} format
 * @returns {number}
 */
export function getTextureFormatSize(format) {
  switch (format) {
    // 8-bit = 1 byte
    case TextureFormat.R8Unorm:
    case TextureFormat.R8Snorm:
    case TextureFormat.R8Uint:
    case TextureFormat.R8Sint:
      return 1;

    // 16-bit = 2 bytes
    case TextureFormat.R16Uint:
    case TextureFormat.R16Sint:
    case TextureFormat.R16Float:
    case TextureFormat.RG8Unorm:
    case TextureFormat.RG8Snorm:
    case TextureFormat.RG8Uint:
    case TextureFormat.RG8Sint:
      return 2;

    // 32-bit = 4 bytes
    case TextureFormat.R32Uint:
    case TextureFormat.R32Sint:
    case TextureFormat.R32Float:
    case TextureFormat.RG16Uint:
    case TextureFormat.RG16Sint:
    case TextureFormat.RG16Float:
    case TextureFormat.RGBA8Unorm:
    case TextureFormat.RGBA8UnormSRGB:
    case TextureFormat.RGBA8Snorm:
    case TextureFormat.RGBA8Uint:
    case TextureFormat.RGBA8Sint:
      return 4;

    // 64-bit = 8 bytes
    case TextureFormat.RG32Uint:
    case TextureFormat.RG32Sint:
    case TextureFormat.RG32Float:
    case TextureFormat.RGBA16Uint:
    case TextureFormat.RGBA16Sint:
    case TextureFormat.RGBA16Float:
      return 8;

    // 128-bit = 16 bytes
    case TextureFormat.RGBA32Uint:
    case TextureFormat.RGBA32Sint:
    case TextureFormat.RGBA32Float:
      return 16;

    // Depth/stencil formats — size varies and is implementation-specific
    case TextureFormat.Stencil8:
      return 1;
    case TextureFormat.Depth16Unorm:
      return 2;
    case TextureFormat.Depth24Plus:
    case TextureFormat.Depth24PlusStencil8:
      return 4; // Typically 3 or 4 bytes — assume 4
    case TextureFormat.Depth32Float:
      return 4;
    case TextureFormat.Depth32FloatStencil8:
      return 5; // 4 (depth) + 1 (stencil) — approximate

    default:
      throw new Error(`Unknown or unsupported texture format: ${format}`);
  }
}

/**
 * Converts an ArrayBuffer to a corresponding TypedArray based on `GlDataType`.
 *
 * @param {ArrayBuffer} buffer - The buffer to convert.
 * @param {GlDataType} dataType - One of the values from GlDataType.
 * @throws {Error} If `dataType` is unknown.
 */
export function convertBufferToTypedArray(
  buffer,
  dataType,
  offset = 0,
  length = buffer.byteLength) {
  switch (dataType) {
    case GlDataType.Float:
      return new Float32Array(buffer, offset, length / Float32Array.BYTES_PER_ELEMENT);
    case GlDataType.UnsignedInt:
      return new Uint32Array(buffer, offset, length / Uint32Array.BYTES_PER_ELEMENT);
    case GlDataType.Int:
      return new Int32Array(buffer, offset, length / Int32Array.BYTES_PER_ELEMENT);
    case GlDataType.UnsignedShort:
      return new Uint16Array(buffer, offset, length / Uint16Array.BYTES_PER_ELEMENT);
    case GlDataType.Short:
      return new Int16Array(buffer, offset, length / Int16Array.BYTES_PER_ELEMENT);
    case GlDataType.UnsignedByte:
      return new Uint8Array(buffer, offset, length / Uint8Array.BYTES_PER_ELEMENT);
    case GlDataType.Byte:
      return new Int8Array(buffer, offset, length / Int8Array.BYTES_PER_ELEMENT);
    default:
      throw new Error(`Unsupported GL data type: 0x${dataType.toString(16)}`);
  }
}

/**
 * Converts a TextureFormat enum value to the appropriate framebuffer attachment type.
 * @param {number} format - A value from TextureFormat.
 * @returns {number} A GL_* attachment enum, e.g. gl.COLOR_ATTACHMENT0, gl.DEPTH_ATTACHMENT, etc.
 */
export function getFramebufferAttachment(format) {
  const context = WebGL2RenderingContext;

  switch (format) {
    // --- Depth-only formats ---
    case TextureFormat.Depth16Unorm:
    case TextureFormat.Depth24Plus:
    case TextureFormat.Depth32Float:
      return context.DEPTH_ATTACHMENT;

    // --- Stencil-only format ---
    case TextureFormat.Stencil8:
      return context.STENCIL_ATTACHMENT;

    // --- Combined depth + stencil formats ---
    case TextureFormat.Depth24PlusStencil8:
    case TextureFormat.Depth32FloatStencil8:
      return context.DEPTH_STENCIL_ATTACHMENT;

    // --- Everything else is a color attachment ---
    default:
      return context.COLOR_ATTACHMENT0;
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
 * @property {CompareFunction} [compare]
 */

/**
 * @typedef SamplerLODSettings
 * @property {number} max
 * @property {number} min
 */