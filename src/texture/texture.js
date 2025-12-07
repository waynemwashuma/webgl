import { TextureFormat, TextureType } from "../constants/index.js"

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
    this.update()
    return this
  }

  clone() {
    return new /**@type {new (...arg:any) => this}*/(this.constructor)({}).copy(this)
  }

  static default(){
    const width = 1
    const height = 1
    const pixel = new Uint8Array([255, 255, 255, 255])
    const texture = new Texture({
      width,
      height,
      data: pixel.buffer,
      type: TextureType.Texture2D
    })

    return texture
  }
  /**
   * @readonly
   * @type {Readonly<Required<TextureSettings>>}
   */
  static defaultSettings = {
    format: TextureFormat.RGBA8Unorm,
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
 * @property {TextureFormat} [format]
 * @property {boolean} [flipY]
 * @property {number} [width]
 * @property {number} [height]
 * @property {number} [depth]
 */