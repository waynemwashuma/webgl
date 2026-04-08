/** @import { View } from "./core/index.js" */

export class Views {
  /**
   * @private
   * @type {View[]}
   */
  inner = []

  clear() {
    this.inner.length = 0
  }

  /**
   * @param {...View} views
   */
  push(...views) {
    this.inner.push(...views)
  }

  /**
   * @returns {View[]}
   */
  items() {
    return this.inner
  }
}

