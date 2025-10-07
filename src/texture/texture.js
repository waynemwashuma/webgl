/** @import { SamplerSettings } from '../function.js' */

import { GlDataType, TextureFilter, TextureFormat, TextureFormatUsage, TextureType } from "../constant.js"
import { Sampler } from "./sampler.js"

export class Texture {

  /**
   * @type {boolean}
   */
  #changed
  /**
   * @type {Uint8Array[]}
   */
  data

  /**
   * @type {number}
   */
  width

  /**
   * @type {number}
   */
  height

  /**
   * @type {number}
   */
  depth

  /**
   * @type {TextureFormatUsage}
   */
  format

  /**
   * @type {TextureFormat}
   */
  internalFormat

  /**
   * @type {GlDataType}
   */
  dataFormat

  /**
   * @type {Sampler}
   */
  defaultSampler

  /**
   * @type {boolean}
   */
  generateMipmaps

  /**
   * @type {boolean}
   */
  flipY

  /**
   * @readonly
   * @type {TextureType}
   */
  type
  /**
   * @param {TextureSettings & {data: Uint8Array[], type:TextureType}} settings
   */
  constructor(settings) {
    this.data = settings.data
    this.type = settings.type
    this.apply(settings)
  }

  /**
   * @package
   * @returns {boolean}
   * This is an internal property, do not use!
   */
  get changed(){
    const previous = this.#changed
    this.#changed = false
    return previous
  }

  update(){
    // TODO: Actually implement this on properties when they change
    this.#changed = true
  }
  /**
   * @param {TextureSettings} settings
   */
  apply({
    format = Texture.defaultSettings.format,
    internalFormat = Texture.defaultSettings.internalFormat,
    dataFormat = Texture.defaultSettings.dataFormat,
    sampler = Texture.defaultSettings.sampler,
    generateMipmaps = Texture.defaultSettings.generateMipmaps,
    flipY = Texture.defaultSettings.flipY,
    width = Texture.defaultSettings.width,
    height = Texture.defaultSettings.height,
    depth = Texture.defaultSettings.depth,
  }) {
    this.width = width
    this.height = height
    this.depth = depth
    this.flipY = flipY
    this.format = format
    this.internalFormat = internalFormat
    this.dataFormat = dataFormat
    this.defaultSampler = new Sampler(sampler)
    this.generateMipmaps = generateMipmaps
  }

  /**
   * @readonly
   * @type {Readonly<Required<TextureSettings>>}
   */
  static defaultSettings = {
    format: TextureFormatUsage.RGBA,
    internalFormat: TextureFormat.RGBA8,
    dataFormat: GlDataType.UNSIGNED_BYTE,
    sampler: Sampler.defaultSettings,
    generateMipmaps: true,
    flipY: false,
    width: 0,
    height: 0,
    depth: 1,
  }
}

/**
 * @typedef TextureSettings
 * @property {boolean} [generateMipmaps=true]
 * @property {Required<SamplerSettings>} [sampler]
 * @property {TextureFormat} [internalFormat]
 * @property {TextureFormat} [format]
 * @property {GlDataType} [dataFormat]
 * @property {boolean} [flipY]
 * @property {number} [width]
 * @property {number} [height]
 * @property {number} [depth]
 */