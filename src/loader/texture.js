import { TextureWrap, TextureFormat, TextureFilter, GlDataType } from '../constant.js';
import { Renderer } from '../renderer/index.js';
import { Texture } from '../texture/index.js';
export class TextureLoader {
  /**
   * @private
   * @type {WebGLRenderingContext}
   */
  gl
  /**
   * @type {Map<string,Texture>}
  */
  textures = new Map()
  /**
   * @param {Renderer} renderer
   */
  constructor(renderer) {
    this.gl = renderer.gl
  }
  /**
   * @param {TextureSettings} settings
   */
  load(settings) {
    settings.generateMipmaps = settings.generateMipmaps ?? true
    settings.flipY = settings.flipY ?? true
    settings.wrapS = settings.wrapS ?? TextureWrap.REPEAT
    settings.wrapT = settings.wrapT ?? TextureWrap.REPEAT
    settings.minfilter = settings.minfilter ?? TextureFilter.LINEAR
    settings.magfilter = settings.magfilter ?? TextureFilter.LINEAR
    settings.format = settings.format ?? TextureFormat.RGBA
    settings.internalFormat = settings.internalFormat ?? settings.format
    settings.dataFormat = settings.dataFormat ?? GlDataType.UNSIGNED_BYTE

    // @ts-ignore
    const tex = loadTexture(this.gl, settings)
    const texture = new Texture(tex)

    this.textures.set(settings.name, texture)

    return texture
  }

  /**
   * @param {CubeTextureSettings} settings
   */
  loadCube(settings) {
    settings.flipY = settings.flipY ?? true
    settings.wrapS = settings.wrapS ?? TextureWrap.CLAMP
    settings.wrapT = settings.wrapT ?? TextureWrap.CLAMP
    settings.minfilter = settings.minfilter ?? TextureFilter.LINEAR
    settings.magfilter = settings.magfilter ?? TextureFilter.LINEAR
    settings.format = settings.format ?? TextureFormat.RGBA
    settings.internalFormat = settings.internalFormat ?? settings.format
    settings.dataFormat = settings.dataFormat ?? GlDataType.UNSIGNED_BYTE

    // @ts-ignore
    const tex = loadCubeTexture(this.gl, settings)
    const texture = new Texture(tex)

    this.textures.set(settings.name, texture)

    return texture
  }

  /**
   * @param {string} name
   * @returns {Texture}
   */
  get(name) {
    return this.textures.get(name)
  }
}

/**
 * @param {WebGLRenderingContext} gl
 * @param {Required<TextureSettings>} settings
 */
function loadTexture(gl, settings) {
  const texture = gl.createTexture()
  const level = 0
  const width = 1
  const height = 1
  const border = 0
  const pixel = new Uint8Array([255, 0, 255, 255])

  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texImage2D(
    gl.TEXTURE_2D,
    level,
    settings.internalFormat,
    width,
    height,
    border,
    settings.format,
    settings.dataFormat,
    pixel,
  )
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, settings.wrapS)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, settings.wrapT)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, settings.minfilter)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, settings.magfilter)
  const image = new Image()
  image.src = settings.path
  image.onload = () => {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, settings.flipY)
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      level,
      settings.internalFormat,
      settings.format,
      settings.dataFormat,
      image,
    )
    if (settings.generateMipmaps)
      gl.generateMipmap(gl.TEXTURE_2D)
  }
  return texture;
}

/**
 * @param {WebGL2RenderingContext} gl
 * @param {Required<CubeTextureSettings>} settings
 */
function loadCubeTexture(gl, settings) {
  const level = 0
  const width = 1
  const height = 1
  const border = 0
  const pixel = new Uint8Array([255, 0, 255, 255])
  const texture = gl.createTexture()

  gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture)
  for (let i = 0; i < settings.paths.length; i++) {
    const src = settings.paths[i];

    gl.texImage2D(
      gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
      level,
      settings.internalFormat,
      width,
      height,
      border,
      settings.format,
      settings.dataFormat,
      pixel,
    )
    
    const image = new Image()
    image.src = settings.paths[i]
    image.onload = () => {
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
      gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
      gl.texImage2D(
        gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
        level,
        settings.internalFormat,
        settings.format,
        settings.dataFormat,
        image,
      )
    }
  }
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, settings.wrapS)
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, settings.wrapT)
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, settings.minfilter)
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, settings.magfilter)

  return texture;
}

/**
 * @typedef TextureSettings
 * @property {string} name
 * @property {string} path
 * @property {boolean} [generateMipmaps=true]
 * @property {TextureWrap} [wrapS]
 * @property {TextureWrap} [wrapT]
 * @property {TextureWrap} [wrapR]
 * @property {TextureFormat} [internalFormat]
 * @property {TextureFormat} [format]
 * @property {TextureFilter} [minfilter]
 * @property {TextureFilter} [magfilter]
 * @property {GlDataType} [dataFormat]
 * @property {boolean} [flipY=true]
 */

/***
 * @typedef CubeTextureSettings
 * @property {string} name
 * @property {[string,string,string,string,string,string]} paths
 * @property {TextureWrap} [wrapS]
 * @property {TextureWrap} [wrapT]
 * @property {TextureFormat} [internalFormat]
 * @property {TextureFormat} [format]
 * @property {TextureFilter} [minfilter]
 * @property {TextureFilter} [magfilter]
 * @property {GlDataType} [dataFormat]
 * @property {boolean} [flipY=true]
 */