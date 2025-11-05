import { Color } from "../math/index.js";
import { basicVertex, standardFragment } from "../shader/index.js";
import { Sampler, Texture } from "../texture/index.js";
import { Material } from "./material.js";

export class StandardMaterial extends Material {
  /**
   * @type {Color}
   */
  color

  /**
   * @type {number}
   */
  metallic = 1

  /**
   * @type {number}
   */
  roughness = 0

  /**
   * @type {Texture | undefined}
   */
  mainTexture

  /**
   * @type {Sampler | undefined}
   */
  mainSampler
  /**
   * @param {StandardMaterialOptions} param0 
   */
  constructor({
    color = new Color(1, 1, 1),
    mainTexture = undefined,
    mainSampler = undefined,
  } = {}) {
    super()
    this.color = color
    this.mainTexture = mainTexture
    this.mainSampler = mainSampler
  }

  /**
   * @override
   */
  vertex() {
    return basicVertex
  }

  /**
   * @override
   */
  fragment() {
    return standardFragment
  }

  /**
   * @override
   */
  getData() {
    const {
      color,
      metallic,
      roughness
    } = this

    return new Float32Array([
      ...color,
      metallic,
      roughness
    ]).buffer
  }

  /**
   * @override
   * @returns {[string, number, Texture | undefined, Sampler | undefined][]}
   */
  getTextures() {
    return [['mainTexture', 0, this.mainTexture, this.mainSampler]]
  }
}


/**
 * @typedef StandardMaterialOptions
 * @property {Color} [color]
 * @property {Texture} [mainTexture]
 * @property {Sampler} [mainSampler]
 */