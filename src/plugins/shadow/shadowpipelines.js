export class ShadowPipelines {

  /**
   * Layout hash is the key, pipeline id the value.
   * @private
   * @type {Map<number, number>}
   */
  pipelines = new Map()

  /**
   * @param {number} layoutHash
   * @returns {number | undefined}
   */
  get(layoutHash) {
    return this.pipelines.get(layoutHash)
  }

  /**
   * @param {number} layoutHash
   * @param {number} pipelineId
   */
  set(layoutHash, pipelineId) {
    this.pipelines.set(layoutHash, pipelineId)
  }
}
