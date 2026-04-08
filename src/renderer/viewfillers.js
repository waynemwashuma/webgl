/** @import { ViewFiller } from "./renderer.js" */

export class ViewFillers {
  /**
   * @private
   * @type {Map<string, ViewFiller>}
   */
  inner = new Map()

  /**
   * @param {string} tag
   * @param {ViewFiller} filler
   */
  set(tag, filler) {
    this.inner.set(tag, filler)
  }

  /**
   * @param {string} tag
   * @returns {ViewFiller | undefined}
   */
  get(tag) {
    return this.inner.get(tag)
  }

  /**
   * @param {string} tag
   * @returns {boolean}
   */
  has(tag) {
    return this.inner.has(tag)
  }
}

