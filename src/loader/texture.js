/** @import { TextureSettings } from '../texture/index.js' */

import { GlDataType, TextureFormat, TextureFormatUsage, TextureType } from '../constant.js';
import { Renderer } from '../renderer/index.js';
import { Texture } from '../texture/index.js';
export class TextureLoader {

  /**
   * @type {Map<string,Texture>}
  */
  textures = new Map()

  /**
   * 
   * @param {string[]} paths
   */
  async fetch(paths) {
    let width = 0,height = 0
    const data = paths.map(async (path) => {
      const response = await fetch(path)
      const blob = await response.blob()
      const bitmap = await createImageBitmap(blob)
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
      const ctx = canvas.getContext('2d')

      ctx.drawImage(bitmap,0,0)
      width = bitmap.width
      height = bitmap.height

      return ctx.getImageData(0,0,bitmap.width,bitmap.height,{
        colorSpace:"srgb"
      }).data
    })
    const images = await Promise.all(data)

    return {
      width,
      height,
      images
    }
  }

  /**
   * @param {string[]} paths
   * @param {Texture} texture
   */
  async internalLoad(paths, texture) {
    const data = await this.fetch(paths)

    texture.data = data.images.map((image)=>new Uint8Array(image))
    texture.internalFormat = TextureFormat.RGBA8
    texture.format = TextureFormatUsage.RGBA
    texture.dataFormat = GlDataType.UNSIGNED_BYTE
    texture.width = data.width
    texture.height = data.height
    texture.update()
  }
  /**
   * @param {TextureLoadSettings} settings
   */
  load(settings) {
    const texture = new Texture({
      ...settings,
      data: [new Uint8Array([255, 0, 255, 255])],
      type: TextureType.TEXTURE_2D,
      width: 1,
      height: 1
    })

    this.textures.set(settings.name, texture)
    this.internalLoad([settings.path], texture)
    return texture
  }

  /**
   * @param {CubeTextureSettings} settings
   */
  loadCube(settings) {
    const pixel = new Uint8Array([255, 0, 255, 255])
    const texture = new Texture({
      ...settings,
      data: [pixel, pixel, pixel, pixel, pixel, pixel],
      type: TextureType.TEXTURE_CUBE_MAP,
      width: 1,
      height: 1
    })
    this.textures.set(settings.name, texture)
    this.internalLoad(settings.paths, texture)
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
 * @typedef {TextureSettings & {
 *    name:string;
 *    path:string;
 * }} TextureLoadSettings
 */

/***
 * @typedef {TextureSettings & {
 *   name:string;
 *   paths:[string,string,string,string,string,string];
 * }} CubeTextureSettings
 */