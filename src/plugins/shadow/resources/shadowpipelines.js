export class ShadowPipelines {

  /**
   * Cache key is a string that includes mesh layout and vertex-shader variants.
   * @private
   * @type {Map<string, number>}
   */
  pipelines = new Map()

  /**
   * @param {string} key
   * @returns {number | undefined}
   */
  get(key) {
    return this.pipelines.get(key)
  }

  /**
   * @param {string} key
   * @param {number} pipelineId
   */
  set(key, pipelineId) {
    this.pipelines.set(key, pipelineId)
  }
}
