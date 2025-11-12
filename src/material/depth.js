import { Material } from "./material.js"
import { basicVertex, depthFragment } from "../shader/index.js"
import { Texture } from "../texture/index.js"
import { Sampler } from "../texture/sampler.js"
import { TextureFilter } from "../constants/texture.js"

// This should be a post processing effect as it renders the entire scene.
export class DepthMaterial extends Material {

  /**
   * @type {Texture | undefined}
   */
  depth

  near = 0.1

  far = 1000
  /**
   * @type {Sampler | undefined}
   */
  mainSampler

  /**
   * @param {DepthMaterialOptions} options 
   */
  constructor({
    depth
  }) {
    super()
    this.depth = depth
    this.mainSampler = new Sampler({
      minificationFilter: TextureFilter.Nearest,
      magnificationFilter: TextureFilter.Nearest
    })
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
    return depthFragment
  }

  /**
   * @override
   */
  getData() {
    return new Float32Array([
      this.near,
      this.far
    ]).buffer
  }

  /**
   * @override
   * @returns {[string, number, Texture | undefined, Sampler | undefined][]}
   */
  getTextures() {
    return [['depth_texture', 0, this.depth, this.mainSampler]]
  }
}

/**
 * @typedef DepthMaterialOptions
 * @property {Texture} depth
 */