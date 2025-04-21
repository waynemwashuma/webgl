import { UniformType } from "../constant.js"

export class Uniform {
  location
  size
  type
  /**
   * @param {WebGLUniformLocation} location
   * @param {number} size
   * @param {UniformType} type
  */
  constructor(location,type,size){
    this.location = location
    this.type = type
    this.size = size
  }
}