import { TextureFormat, TextureType, BufferUsage, BufferType, getTextureFormatSize } from "../../constants/index.js"
import { assert } from "../../utils/index.js"
import { convertBufferToTypedArray, getWebGLTextureFormat, WebGLTextureFormat } from "../../function.js"
import { Vector3 } from "../../math/index.js"
import { WebGLExtensions } from "../extensions.js"
import { GPUBuffer, GPUTexture } from "../resources/index.js"

export class WebGLRenderDevice {
  /**
   * @readonly
   * @type {HTMLCanvasElement}
   */
  canvas

  /**
   * @readonly
   * @type {WebGLExtensions}
   */
  extensions

  /**
   * @readonly
   * @type {WebGL2RenderingContext}
   */
  context
  /**
   * @param {HTMLCanvasElement} [canvas]
   * @param {WebGLContextAttributes} [options] 
   */
  constructor(canvas, options) {
    this.canvas = canvas || document.createElement('canvas')
    const context = this.canvas.getContext('webgl2', options)

    assert(context, "Webgl context creation failed")

    this.context = context
    this.extensions = new WebGLExtensions(this.context)
    this.extensions.get("OES_texture_float_linear")
  }

  /**
   * @param {WebGLBufferDescriptor} descriptor 
   * @returns {GPUBuffer}
   */
  createBuffer({
    size,
    usage,
    type
  }) {
    const { context } = this
    const buffer = context.createBuffer()

    context.bindBuffer(type, buffer)
    context.bufferData(type, size, usage)

    return new GPUBuffer(buffer, type, size)
  }

  /**
   * @param {GPUBuffer} buffer
   * @param {ArrayBufferView} data
   * @param {number} bufferOffset
   * @param {number} dataOffset
   * @param {number} size
   */
  writeBuffer(buffer, data, bufferOffset = 0, dataOffset = 0, size = data.byteLength) {
    const { context } = this
    const dataView = new DataView(data.buffer, data.byteOffset, data.byteLength)
    
    context.bindBuffer(buffer.type, buffer.inner)
    context.bufferSubData(buffer.type, bufferOffset, dataView, dataOffset, size)
  }

  /**
   * @param {WebGLTextureDescriptor} descriptor 
   * @returns {GPUTexture}
   */
  createTexture(descriptor) {
    const { width, height, depth = 1, type, format } = descriptor
    const { context } = this
    const texture = context.createTexture()
    const form = getWebGLTextureFormat(format)

    assert(form, "Invalid texture format")

    context.bindTexture(type, texture)
    switch (type) {
      case TextureType.Texture2D:
        allocateTexture2D(context, descriptor, form)
        break
      case TextureType.TextureCubeMap:
        allocateCubemap(context, descriptor, form)
        break
    }
    const pixelSize = getTextureFormatSize(format)
    return new GPUTexture(texture, type, form,format, width, height, depth, pixelSize)
  }

  /**
   * @param {WebGLWriteTextureDescriptor} descriptor
   */
  writeTexture(descriptor) {
    const { texture } = descriptor
    const { context } = this

    context.bindTexture(texture.type, texture.inner)
    switch (texture.type) {
      case TextureType.Texture2D:
        updateTexture2D(context, descriptor)
        break;
      case TextureType.TextureCubeMap:
        updateCubeMap(context, descriptor)
        break
      default:
        break;
    }
  }
}

/**
 * @param {WebGL2RenderingContext} context 
 * @param {WebGLTextureDescriptor} descriptor 
 * @param {WebGLTextureFormat} format 
 */
function allocateTexture2D(context, descriptor, format) {
  context.texImage2D(
    WebGL2RenderingContext.TEXTURE_2D,
    0,
    format.internalFormat,
    descriptor.width,
    descriptor.height,
    0,
    format.format,
    format.dataType,
    null
  )
}

/**
 * @param {WebGL2RenderingContext} context 
 * @param {WebGLTextureDescriptor} descriptor 
 * @param {WebGLTextureFormat} format 
 */
function allocateCubemap(context, descriptor, format) {
  for (let offset = 0; offset < 6; offset++) {
    context.texImage2D(
      WebGL2RenderingContext.TEXTURE_CUBE_MAP_POSITIVE_X + offset,
      0,
      format.internalFormat,
      descriptor.width,
      descriptor.height,
      0,
      format.format,
      format.dataType,
      null
    )
  }
}
/**
 * @param {WebGL2RenderingContext} context
 * @param {WebGLWriteTextureDescriptor} descriptor
 */
function updateTexture2D(context, descriptor) {
  const {
    texture,
    data,
    mipmapLevel = 0,
    offset = new Vector3(0, 0, 0),
    size = new Vector3(texture.width, texture.height, texture.depth)
  } = descriptor
  const { format, dataType } = texture.format

  context.texSubImage2D(
    WebGL2RenderingContext.TEXTURE_2D,
    mipmapLevel,
    offset.x,
    offset.y,
    size.x,
    size.y,
    format,
    dataType,
    convertBufferToTypedArray(data, dataType)
  )
}

/**
 * @param {WebGL2RenderingContext} gl
 * @param {WebGLWriteTextureDescriptor} descriptor
 */
function updateCubeMap(gl, descriptor) {
  const {
    texture,
    data,
    mipmapLevel = 0,
    offset = new Vector3(0, 0, 0),
    size = new Vector3(texture.width, texture.height, texture.depth)
  } = descriptor
  const { format, dataType } = texture.format
  const { width, height, pixelSize } = texture
  const sliceSize = pixelSize * width * height
  const src = convertBufferToTypedArray(data, dataType)

  for (let i = 0; i < 6; i++) {
    gl.texSubImage2D(
      WebGLRenderingContext.TEXTURE_CUBE_MAP_POSITIVE_X + i,
      mipmapLevel,
      offset.x,
      offset.y,
      size.x,
      size.y,
      format,
      dataType,
      src,
      sliceSize * i
    )
  }
}

/**
 * @typedef WebGLBufferDescriptor
 * @property {number} size
 * @property {BufferUsage} usage
 * @property {BufferType} type
 */

/**
 * @typedef WebGLTextureDescriptor
 * @property {TextureType} type
 * @property {TextureFormat} format
 * @property {number} width
 * @property {number} height
 * @property {number} [depth = 1]
 * @property {number} [mipmapCount = 1]
 */

/**
 * @typedef WebGLWriteTextureDescriptor
 * @property {GPUTexture} texture
 * @property {ArrayBufferLike} data
 * @property {number} [mipmapLevel]
 * @property {Vector3} [offset]
 * @property {Vector3} [size]
 */
