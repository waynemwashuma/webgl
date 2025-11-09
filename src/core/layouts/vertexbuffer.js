import { Attribute } from "../../mesh/index.js"

export class VertexBufferLayout {
  /**
   * @type {readonly Attribute[]}
   */
  attributes = []

  /**
   * @param {Attribute[]} attributes
   */
  constructor(attributes) {
    this.attributes = attributes
  }

  /**
   * @param {string[]} attributeIds
   * @returns {boolean}
   */
  hasOnly(attributeIds) {
    if (attributeIds.length !== this.attributes.length) return false

    for (let i = 0; i < attributeIds.length; i++) {
      if (this.attributes.findIndex(value => value.name === attributeIds[i]) === -1) {
        return false
      }
    }

    return true
  }
}