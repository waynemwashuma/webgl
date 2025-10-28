import { CompareFunction, TextureFilter, TextureWrap } from '../constant.js'

/**@import {SamplerSettings} from '../function.js'*/
export class Sampler {
  magnificationFilter
  minificationFilter
  mipmapFilter
  wrapS
  wrapT
  wrapR
  anisotropy
  lod
  compare
  /**
   * @param {Partial<SamplerSettings>} settings 
   */
  constructor({
    magnificationFilter = Sampler.defaultSettings.magnificationFilter,
    minificationFilter = Sampler.defaultSettings.minificationFilter,
    mipmapFilter = Sampler.defaultSettings.mipmapFilter,
    wrapS = Sampler.defaultSettings.wrapS,
    wrapT = Sampler.defaultSettings.wrapT,
    wrapR = Sampler.defaultSettings.wrapR,
    lod = Sampler.defaultSettings.lod,
    anisotropy = Sampler.defaultSettings.anisotropy,
    compare = Sampler.defaultSettings.compare
  } = Sampler.defaultSettings) {
    this.minificationFilter = minificationFilter
    this.magnificationFilter = magnificationFilter
    this.mipmapFilter = mipmapFilter
    this.wrapS = wrapS
    this.wrapT = wrapT
    this.wrapR = wrapR
    this.anisotropy = anisotropy
    this.lod = lod
    this.compare = compare
  }

  static default(){
    return new Sampler()
  }

  /**
   * @readonly
   * @type {Readonly<
   *   Required<Omit<SamplerSettings,'compare'>>
   *   > & {compare:CompareFunction | undefined}
   * }
   */
  static defaultSettings = {
    magnificationFilter: TextureFilter.Linear,
    minificationFilter: TextureFilter.Linear,
    mipmapFilter: TextureFilter.Linear,
    wrapS: TextureWrap.Clamp,
    wrapT: TextureWrap.Clamp,
    wrapR: TextureWrap.Clamp,
    lod: { min: 0, max: 12 },
    anisotropy: 1,
    compare: undefined
  }
}