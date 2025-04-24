import { CompareFunction, TextureCompareMode, TextureFilter, TextureWrap } from '../constant.js'
import {createSampler} from '../function.js'

/**@import {SamplerSettings} from '../function.js'*/
export class Sampler {
  /**
   * @type {WebGLSampler}
   */
  _sampler
  magnificationFilter
  minificationFilter
  mipmapFilter
  wrapS
  wrapT
  wrapR
  anisotropy
  lod
  compareMode
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
    compareMode = Sampler.defaultSettings.compareMode,
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
    this.compareMode = compareMode
  }

  /**
   * @param {WebGL2RenderingContext} gl
   */
  init(gl){
    this._sampler = createSampler(gl,this)
  }

  static default(){
    return new Sampler()
  }

  /**
   * @readonly
   * @type {Readonly<Required<SamplerSettings>>}
   */
  static defaultSettings = {
    magnificationFilter: TextureFilter.LINEAR,
    minificationFilter: TextureFilter.LINEAR,
    mipmapFilter: TextureFilter.LINEAR,
    wrapS: TextureWrap.CLAMP,
    wrapT: TextureWrap.CLAMP,
    wrapR: TextureWrap.CLAMP,
    lod: { min: 0, max: 12 },
    anisotropy: 1,
    compareMode: TextureCompareMode.NONE,
    compare: CompareFunction.LEQUAL
  }
}