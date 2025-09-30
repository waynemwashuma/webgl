export class AttributeData {
  /**
   * @readonly
  */
  value = null
  buffer = null
  count = 0
  size = 0
  location = null
  constructor(value,size){
    this.value = value
    this.size = size
    this.count = value.length/size
  }
}