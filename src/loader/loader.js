/**
 * @enum {number}
 */
export const OnAssetLoadedStrategy = {
  Original: 0,
  Clone: 1
}

/**
 * @template {Clonable<Asset> & Copyable<Asset>} Asset
 * @template {LoadSettings} [Settings = LoadSettings]
 */
export class Loader {
  /**
   * @readonly
   * @type {Constructor<Asset>}
   */
  asset

  /**
   * @protected
   * @type {OnAssetLoadedStrategy}
   */
  strategy = OnAssetLoadedStrategy.Clone

  /**
   * @private
   * @readonly
   * @type {Map<string,Asset>}
   */
  assets = new Map()

  /**
   * @private
   * @readonly
   * @type {Map<string,[Asset,((asset:Asset)=>void) | undefined][]>}
   */
  toLoad = new Map()
  /**
   * @param {Constructor<Asset>} asset
   */
  constructor(asset) {
    this.asset = asset
  }

  /**
   * @param {Settings & {postprocessor?:(asset:Asset)=>void}} settings
   */
  load(settings) {
    const root = this.default(settings)

    if (this.strategy === OnAssetLoadedStrategy.Clone) {
      const clone = root.clone()
      this.addToLoad(settings.paths.join('/'), clone, settings.postprocessor)
      this.asyncLoad(settings, root)
      return clone
    }

    this.asyncLoad(settings, root)
    return root
  }


  /**
   * @param {Settings} settings
   * @param {Asset} [original]
   */
  async asyncLoad(settings, original) {
    const cachedAsset = original || this.default(settings)
    const response = await this.fetch(settings.paths)

    await this.parse(response, cachedAsset, settings)
    this.assets.set(settings.paths.join("/"), cachedAsset)

    const loads = this.toLoad.get(settings.paths.join('/'))

    if (loads) {
      for (let i = 0; i < loads.length; i++) {
        const [clone, postprocessor] = loads[i];

        clone.copy(cachedAsset)
        if (postprocessor) {
          postprocessor(clone)
        }
      }

      loads.length = 0
    }
    return cachedAsset
  }

  /**
   * @param {string} url
   * @param {Asset} asset
   * @param {(asset: Asset)=> void} postprocessor
   */
  addToLoad(url, asset, postprocessor) {
    const assets = this.toLoad.get(url)

    if (assets) {
      assets.push([asset, postprocessor])
    } else {
      this.toLoad.set(url, [[asset, postprocessor]])
    }
  }
  /**
   * @private
   * @param {string[]} paths
   * @returns {Promise<ArrayBuffer[]>}
   */
  async fetch(paths) {
    const data = paths.map(async (path) => {
      const response = await fetch(path)
      return response.arrayBuffer()
    })
    const buffers = await Promise.all(data)

    return buffers
  }

  /**
   * @protected
   * @param {ArrayBuffer[]} _buffers
   * @param {Asset} _destination
   * @param {Settings} _settings 
   * @returns {Promise<void>}
   */
  async parse(_buffers, _destination, _settings) {
    if (this.constructor === this.constructor) {
      throw `\`${this.constructor.name}\` cannot be used directly.`
    }
    throw `Implement \`${this.constructor.name}.parse()\``
  }
  /**
   * @protected
   * @param {Settings} _settings 
   * @returns {Asset}
   */
  default(_settings) {
    if (this.constructor === this.constructor) {
      throw `\`${this.constructor.name}\` cannot be used directly.`
    }
    throw `Implement \`${this.constructor.name}.parse()\``
  }
}

/**
 * @typedef LoadSettings
 * @property {string[]} paths
 */

/**
 * @template T
 * @typedef Defaultable
 * @property {()=>T} default
 */

/**
 * @template T
 * @typedef Clonable
 * @property {()=>T} clone
 */

/**
 * @template T
 * @typedef Copyable
 * @property {(other:T)=>T} copy
 */

/**
 * @template [T = unknown]
 * @typedef {new (...args:any[])=>T} Constructor
 */
