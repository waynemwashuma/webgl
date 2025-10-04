export class AttributeData {
  /**
   * @readonly
   * @type {DataView}
  */
  value = null
  /**
   * @param {DataView} value
   */
  constructor(value){
    this.value = value
  }
}