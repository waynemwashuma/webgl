/**@import {SamplerSettings} from './sampler.js' */
import { TextureFormat, TextureType } from "../constant.js"
import { Sampler } from "./sampler.js"

export class Texture {

  /**
   * @type {boolean}
   */
  #changed = false
  /**
   * @type {ArrayBuffer | undefined}
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
   * @type {TextureFormat}
   */
  format

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
   * @type {TextureType}
   */
  type
  /**
   * @param {TextureSettings & { data?: ArrayBuffer, type: TextureType }} settings
   */
  constructor({
    data,
    type,
    format = Texture.defaultSettings.format,
    sampler = Texture.defaultSettings.sampler,
    generateMipmaps = Texture.defaultSettings.generateMipmaps,
    flipY = Texture.defaultSettings.flipY,
    width = Texture.defaultSettings.width,
    height = Texture.defaultSettings.height,
    depth = Texture.defaultSettings.depth,
  }) {
    this.data = data
    this.type = type
    this.width = width
    this.height = height
    this.depth = depth
    this.flipY = flipY
    this.format = format
    this.defaultSampler = new Sampler(sampler)
    this.generateMipmaps = generateMipmaps
  }

  /**
   * @package
   * @returns {boolean}
   * This is an internal property, do not use!
   */
  get changed() {
    const previous = this.#changed
    this.#changed = false
    return previous
  }

  update() {
    // TODO: Actually implement this on properties when they change
    this.#changed = true
  }
  /**
   * @param {TextureSettings} settings
   */
  apply({
    format = Texture.defaultSettings.format,
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
    this.defaultSampler = new Sampler(sampler)
    this.generateMipmaps = generateMipmaps
  }

  /**
   * @param {this} other
   */
  copy(other) {
    this.data = other.data ? other.data.slice() : undefined
    this.format = other.format
    this.width = other.width
    this.height = other.height
    this.depth = other.depth
    this.type = other.type
    this.flipY = other.flipY
    this.generateMipmaps = other.generateMipmaps
    this.defaultSampler = other.defaultSampler
    this.update()
    return this
  }

  clone() {
    return new /**@type {new (...arg:any) => this}*/(this.constructor)({}).copy(this)
  }

  /**
   * @readonly
   * @type {Readonly<Required<TextureSettings>>}
   */
  static defaultSettings = {
    format: TextureFormat.RGBA8Unorm,
    sampler: Sampler.defaultSettings,
    generateMipmaps: false,
    flipY: false,
    width: 0,
    height: 0,
    depth: 1,
  }
}

/**
 * @typedef TextureSettings
 * @property {boolean} [generateMipmaps=true]
 * @property {SamplerSettings} [sampler]
 * @property {TextureFormat} [format]
 * @property {boolean} [flipY]
 * @property {number} [width]
 * @property {number} [height]
 * @property {number} [depth]
 */