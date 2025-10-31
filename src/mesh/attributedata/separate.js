export class SeparateAttributeData {
  /**
   * @type {Map<string, DataView>}
   */
  data = new Map()

  /**
   * @param {string} name
   * @param {DataView<ArrayBufferLike>} data
   * @returns {this}
   */
  set(name, data) {
    this.data.set(name, data)
    return this
  }

  /**
   * @param {string} name
   * @returns {DataView | undefined}
   */
  get(name) {
    return this.data.get(name)
  }

  /**
   * @param {string} name
   * @returns {boolean}
   */
  has(name) {
    return this.data.has(name)
  }

  /**
   * @param {string} name
   * @returns {boolean}
   */
  delete(name) {
    return this.data.delete(name)
  }

  clear() {
    this.data.clear()
    return this
  }
}