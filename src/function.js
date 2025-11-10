import {
  GlDataType,
  BufferUsage,
  BufferType
} from "./constants/index.js"
import { assert } from "./utils/index.js"
import { Sampler, Texture } from "./texture/index.js"
import { TextureFilter, TextureFormat, TextureType, getTextureFormatSize } from "./constants/index.js"
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

// TODO: Use dataview instead of this
/**
 * Converts an ArrayBuffer to a corresponding TypedArray based on `GlDataType`.
 *
 * @param {ArrayBufferLike} buffer - The buffer to convert.
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
export function updateTextureData(gl, texture) {
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, texture.flipY)

  const form = getWebGLTextureFormat(texture.format)

  assert(form, "The given texture fromat is not supported")

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
 * @param {GLenum} glDataType
 * @returns {number}
 */
export function getGlDataTypeByteSize(glDataType) {
  switch (glDataType) {
    case WebGL2RenderingContext.FLOAT:
    case WebGL2RenderingContext.UNSIGNED_INT:
    case WebGL2RenderingContext.INT:
    case WebGL2RenderingContext.INT:
    case WebGL2RenderingContext.UNSIGNED_INT_24_8:
    case WebGL2RenderingContext.FLOAT_32_UNSIGNED_INT_24_8_REV:
      return 4
    case WebGL2RenderingContext.UNSIGNED_SHORT:
    case WebGL2RenderingContext.SHORT:
    case WebGL2RenderingContext.HALF_FLOAT:
      return 2
    case WebGL2RenderingContext.UNSIGNED_BYTE:
    case WebGL2RenderingContext.BYTE:
      return 1
    default:
      console.warn('Unknown or unsupported webgl data type: ', glDataType.toString(16));
      return 0
  }
}

/**
 * Returns a WebGL texture format configuration based on a custom texture format enum.
 *
 * @param {number} format - The custom TextureFormat enum value.
 * @returns {WebGLTextureFormat | undefined} The corresponding texture format, or undefined if not supported.
 */
export function getWebGLTextureFormat(format) {
  const gl = WebGL2RenderingContext
  switch (format) {
    // --- 8-bit ---
    case TextureFormat.R8Unorm:
      return new WebGLTextureFormat(gl.R8, gl.RED, gl.UNSIGNED_BYTE);
    case TextureFormat.R8Snorm:
      return new WebGLTextureFormat(gl.R8_SNORM, gl.RED, gl.BYTE);
    case TextureFormat.R8Uint:
      return new WebGLTextureFormat(gl.R8UI, gl.RED_INTEGER, gl.UNSIGNED_BYTE);
    case TextureFormat.R8Sint:
      return new WebGLTextureFormat(gl.R8I, gl.RED_INTEGER, gl.BYTE);

    // --- 16-bit ---
    case TextureFormat.R16Uint:
      return new WebGLTextureFormat(gl.R16UI, gl.RED_INTEGER, gl.UNSIGNED_SHORT);
    case TextureFormat.R16Sint:
      return new WebGLTextureFormat(gl.R16I, gl.RED_INTEGER, gl.SHORT);
    case TextureFormat.R16Float:
      return new WebGLTextureFormat(gl.R16F, gl.RED, gl.HALF_FLOAT);
    case TextureFormat.RG8Unorm:
      return new WebGLTextureFormat(gl.RG8, gl.RG, gl.UNSIGNED_BYTE);
    case TextureFormat.RG8Snorm:
      return new WebGLTextureFormat(gl.RG8_SNORM, gl.RG, gl.BYTE);
    case TextureFormat.RG8Uint:
      return new WebGLTextureFormat(gl.RG8UI, gl.RG_INTEGER, gl.UNSIGNED_BYTE);
    case TextureFormat.RG8Sint:
      return new WebGLTextureFormat(gl.RG8I, gl.RG_INTEGER, gl.BYTE);

    // --- 32-bit ---
    case TextureFormat.R32Uint:
      return new WebGLTextureFormat(gl.R32UI, gl.RED_INTEGER, gl.UNSIGNED_INT);
    case TextureFormat.R32Sint:
      return new WebGLTextureFormat(gl.R32I, gl.RED_INTEGER, gl.INT);
    case TextureFormat.R32Float:
      return new WebGLTextureFormat(gl.R32F, gl.RED, gl.FLOAT);
    case TextureFormat.RG16Uint:
      return new WebGLTextureFormat(gl.RG16UI, gl.RG_INTEGER, gl.UNSIGNED_SHORT);
    case TextureFormat.RG16Sint:
      return new WebGLTextureFormat(gl.RG16I, gl.RG_INTEGER, gl.SHORT);
    case TextureFormat.RG16Float:
      return new WebGLTextureFormat(gl.RG16F, gl.RG, gl.HALF_FLOAT);
    case TextureFormat.RGBA8Unorm:
      return new WebGLTextureFormat(gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE);
    case TextureFormat.RGBA8UnormSRGB:
      return new WebGLTextureFormat(gl.SRGB8_ALPHA8, gl.RGBA, gl.UNSIGNED_BYTE);
    case TextureFormat.RGBA8Snorm:
      return new WebGLTextureFormat(gl.RGBA8_SNORM, gl.RGBA, gl.BYTE);
    case TextureFormat.RGBA8Uint:
      return new WebGLTextureFormat(gl.RGBA8UI, gl.RGBA_INTEGER, gl.UNSIGNED_BYTE);
    case TextureFormat.RGBA8Sint:
      return new WebGLTextureFormat(gl.RGBA8I, gl.RGBA_INTEGER, gl.BYTE);

    // --- 64-bit ---
    case TextureFormat.RG32Uint:
      return new WebGLTextureFormat(gl.RG32UI, gl.RG_INTEGER, gl.UNSIGNED_INT);
    case TextureFormat.RG32Sint:
      return new WebGLTextureFormat(gl.RG32I, gl.RG_INTEGER, gl.INT);
    case TextureFormat.RG32Float:
      return new WebGLTextureFormat(gl.RG32F, gl.RG, gl.FLOAT);
    case TextureFormat.RGBA16Uint:
      return new WebGLTextureFormat(gl.RGBA16UI, gl.RGBA_INTEGER, gl.UNSIGNED_SHORT);
    case TextureFormat.RGBA16Sint:
      return new WebGLTextureFormat(gl.RGBA16I, gl.RGBA_INTEGER, gl.SHORT);
    case TextureFormat.RGBA16Float:
      return new WebGLTextureFormat(gl.RGBA16F, gl.RGBA, gl.HALF_FLOAT);

    // --- 128-bit ---
    case TextureFormat.RGBA32Uint:
      return new WebGLTextureFormat(gl.RGBA32UI, gl.RGBA_INTEGER, gl.UNSIGNED_INT);
    case TextureFormat.RGBA32Sint:
      return new WebGLTextureFormat(gl.RGBA32I, gl.RGBA_INTEGER, gl.INT);
    case TextureFormat.RGBA32Float:
      return new WebGLTextureFormat(gl.RGBA32F, gl.RGBA, gl.FLOAT);

    // --- Depth / Stencil ---
    case TextureFormat.Depth16Unorm:
      return new WebGLTextureFormat(gl.DEPTH_COMPONENT16, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT);
    case TextureFormat.Depth24Plus:
      return new WebGLTextureFormat(gl.DEPTH_COMPONENT24, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT);
    case TextureFormat.Depth32Float:
      return new WebGLTextureFormat(gl.DEPTH_COMPONENT32F, gl.DEPTH_COMPONENT, gl.FLOAT);
    case TextureFormat.Depth24PlusStencil8:
      return new WebGLTextureFormat(gl.DEPTH24_STENCIL8, gl.DEPTH_STENCIL, gl.UNSIGNED_INT_24_8);
    case TextureFormat.Depth32FloatStencil8:
      return new WebGLTextureFormat(gl.DEPTH32F_STENCIL8, gl.DEPTH_STENCIL, gl.FLOAT_32_UNSIGNED_INT_24_8_REV);

    default:
      return undefined;
  }
}


/**
 * Represents a WebGL texture format configuration.
 */
export class WebGLTextureFormat {
  /**
   * @type {GLenum} Internal format of the texture (e.g., gl.RGBA8)
   */
  internalFormat;

  /**
   * @type {GLenum} Format of the pixel data (e.g., gl.RGBA)
   */
  format;

  /**
   * @type {GLenum} Data type of the pixel data (e.g., gl.UNSIGNED_BYTE)
   */
  dataType;

  /**
   * Creates a WebGLTextureFormat instance.
   * @param {GLenum} internalFormat - The internal format of the texture.
   * @param {GLenum} format - The format of the pixel data.
   * @param {GLenum} dataType - The data type of the pixel data.
   */
  constructor(internalFormat, format, dataType) {
    this.internalFormat = internalFormat;
    this.format = format;
    this.dataType = dataType;
  }
}
