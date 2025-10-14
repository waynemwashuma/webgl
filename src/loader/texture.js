/** @import { TextureSettings } from '../texture/index.js' */

import { GlDataType, TextureFormat, TextureFormatUsage, TextureType } from '../constant.js';
import { Texture } from '../texture/index.js';
import { Loader, OnAssetLoadedStrategy } from './loader.js';

/**
 * @extends {Loader<Texture,TextureLoadSettings>}
 */
export class TextureLoader extends Loader {

  constructor() {
    super(Texture)
    this.strategy = OnAssetLoadedStrategy.Original
  }

  /**
   * @param {ArrayBuffer[]} buffers
   * @param {Texture} destination 
   * @param {TextureLoadSettings} settings
   */
  async parse(buffers, destination, settings) {
    let width = 0, height = 0
    const data = buffers.map(async (buffer) => {
      const blob = await new Blob([buffer])
      const bitmap = await createImageBitmap(blob)
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
      const ctx = canvas.getContext('2d')

      ctx.drawImage(bitmap, 0, 0)
      width = bitmap.width
      height = bitmap.height

      return ctx.getImageData(0, 0, bitmap.width, bitmap.height, {
        colorSpace: "srgb"
      }).data
    })
    const images = await Promise.all(data)

    destination.data = images.map((image) => new Uint8Array(image))
    destination.internalFormat = TextureFormat.Rgba8
    destination.format = TextureFormatUsage.Rgba
    destination.dataFormat = GlDataType.UnsignedByte
    destination.width = width
    destination.height = height
    destination.update()
  }

  /**
   * @param {TextureLoadSettings} settings
   */
  default(settings) {
    const pixel = new Uint8Array([255, 0, 255, 255])
    const texture = new Texture({
      ...(settings.textureSettings || {}),
      data: settings.paths.map(() => pixel),
      type: settings.type || TextureType.Texture2D,
      width: 1,
      height: 1,
      depth:settings.paths.length
    })

    return texture
  }
}

/**
 * @typedef TextureLoadSettings
 * @property {string[]} paths
 * @property {TextureType} [type]
 * @property {TextureSettings} [textureSettings]
 */