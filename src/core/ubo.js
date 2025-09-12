import { typeOfUniform } from "../function.js"
import { UniformType } from "../constant.js"
/**
 * @param {WebGL2RenderingContext} gl
 */
export class UBO {
  constructor(gl, point, bufSize) {
    this.point = point;
    this.buffer = gl.createBuffer();

    gl.bindBuffer(gl.UNIFORM_BUFFER, this.buffer)
    gl.bufferData(gl.UNIFORM_BUFFER, bufSize, gl.DYNAMIC_DRAW)
    gl.bindBuffer(gl.UNIFORM_BUFFER, null)
    gl.bindBufferBase(gl.UNIFORM_BUFFER, point, this.buffer)
  }
  /**
   * @param {string} name
   * @param {ArrayBuffer} data
   */
  update(gl, data) {
    gl.bindBuffer(gl.UNIFORM_BUFFER, this.buffer);
    gl.bufferSubData(gl.UNIFORM_BUFFER, 0, data);
    gl.bindBuffer(gl.UNIFORM_BUFFER, null);
    return this;
  }
}