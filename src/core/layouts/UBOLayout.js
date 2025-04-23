export class UBOLayout {
  name
  fields
  size
  /**
   * @param {string} name
   * @param {any} size
   * @param {Map<string, {name:string,size:string}>} fields
   */
  constructor(name, size, fields) {
    this.name = name
    this.size = size
    this.fields = fields
  }
}