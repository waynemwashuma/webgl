export class MeshMaterialPipelines {
  /**
   * @private
   * @type {Map<string, Map<bigint, number>>}
   */
  pipelines = new Map()

  /**
   * @param {string} materialName
   * @param {bigint} key
   * @returns {number | undefined}
   */
  get(materialName, key) {
    return this.pipelines.get(materialName)?.get(key)
  }

  /**
   * @param {string} materialName
   * @param {bigint} key
   * @param {number} pipelineId
   */
  set(materialName, key, pipelineId) {
    let materialPipelines = this.pipelines.get(materialName)

    if (!materialPipelines) {
      materialPipelines = new Map()
      this.pipelines.set(materialName, materialPipelines)
    }

    materialPipelines.set(key, pipelineId)
  }

  /**
   * @param {string} materialName
   * @param {bigint} key
   * @param {() => number} compute
   * @returns {number}
   */
  getOrSetCompute(materialName, key, compute) {
    const pipelineId = this.get(materialName, key)

    if (pipelineId !== undefined) {
      return pipelineId
    }

    const newPipelineId = compute()
    this.set(materialName, key, newPipelineId)
    return newPipelineId
  }
}
