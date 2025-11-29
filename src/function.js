import {
  GlDataType,
  BufferUsage,
  BufferType
} from "./constant.js"
import { assert } from "./utils/index.js"
import { getTextureFormatSize, Sampler, Texture, TextureFilter, TextureFormat, TextureType } from "./texture/index.js"
/**
 * @param {WebGL2RenderingContext} context
 * @param {BufferType} type
 * @param {number} size
 * @param {BufferUsage} usage
 */
export function createBuffer(context, type, size, usage = context.STATIC_DRAW) {
  const buffer = context.createBuffer()
  context.bindBuffer(type, buffer)
  context.bufferData(type, size, usage)
  return buffer
}

/**
 * @param {WebGL2RenderingContext} context 
 * @param {BufferType} type 
 * @param {AllowSharedBufferSource} data 
 * @param {BufferUsage} usage 
 */
export function updateBuffer(context, type, data, usage = context.STATIC_DRAW) {
  context.bufferData(type, data, usage)
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
  length = buffer.byteLength
) {
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
 * @param {WebGL2RenderingContext} gl
 * @param {Texture} texture
 */
export function createTexture(gl, texture) {
  const webglTexture = gl.createTexture()

  gl.bindTexture(texture.type, webglTexture)
  updateTextureData(gl, texture)

  gl.bindTexture(texture.type, null)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
  return webglTexture
}

/**
 * @param {WebGL2RenderingContext} gl 
 * @param {Texture} texture 
 */
export function updateTextureData(gl, texture) {
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, texture.flipY)

  const form = getWebGLTextureFormat(gl, texture.format)

  assert(form,"The given texture fromat is not supported")

  switch (texture.type) {
    case TextureType.Texture2D:
      updateTexture2D(gl, texture, form)
      break;
    case TextureType.TextureCubeMap:
      updateCubeMap(gl, texture, form)
      break
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

  if (sampler.mipmapFilter !== undefined) {
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
 * @param {WebGL2RenderingContext} gl
 * @param {Texture} texture
 * @param {{ internalFormat: any; format: any; dataType: any; }} form
 */
function updateTexture2D(gl, texture, form) {
  const level = 0, border = 0

  const { internalFormat, format, dataType } = form
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
 * @param {{ internalFormat: any; format: any; dataType: any; }} form
 */
function updateCubeMap(gl, texture, form) {
  const level = 0, border = 0
  const { internalFormat, format, dataType } = form
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
 * @returns {{ internalFormat: number, format: number, dataType: number } | undefined}
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
      return undefined;
  }
}