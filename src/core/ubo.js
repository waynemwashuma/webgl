import { UBOLayout } from "./layouts/UBOLayout.js"


export class UBOBlockPointAllocator {
  number = 0

  reserve() {
    const id = this.number
    this.number++

    return id
  }
}

export class UBOs {
  /**
   * @type {Map<string,UBO>}
   */
  list = new Map()

  allocator = new UBOBlockPointAllocator()

  /**
   * @param {WebGL2RenderingContext} gl 
   * @param {string} name 
   * @param {UBOLayout} layout
   * @returns {UBO} 
   */
  set(gl, name, layout) {
    const index = this.allocator.reserve()
    const ubo = new UBO(gl, index, layout.size)
    this.list.set(name, ubo)

    return ubo
  }

  /**
   * @param {string} name
   */
  get(name) {
    return this.list.get(name)
  }

  /**
   * @param {WebGL2RenderingContext} gl
   * @param {string} name
   * @param {UBOLayout} layout
   * @returns {UBO}
   */
  getorSet(gl, name, layout) {
    const ubo = this.get(name)

    if (ubo) {
      return ubo
    }

    return this.set(gl, name, layout)
  }
}
/**
 * @param {WebGL2RenderingContext} gl
 */
export class UBO {
  /**
   * @param {WebGL2RenderingContext} gl
   * @param {number} point
   * @param {number} bufSize
   */
  constructor(gl, point, bufSize) {
    this.point = point;
    this.buffer = gl.createBuffer();
    this.size = bufSize

    gl.bindBuffer(gl.UNIFORM_BUFFER, this.buffer)
    gl.bufferData(gl.UNIFORM_BUFFER, bufSize, gl.DYNAMIC_DRAW)
    gl.bindBuffer(gl.UNIFORM_BUFFER, null)
    gl.bindBufferBase(gl.UNIFORM_BUFFER, point, this.buffer)
  }
  /**
   * @param {WebGL2RenderingContext} gl
   * @param {ArrayBuffer} data
   */
  update(gl, data) {
    gl.bindBuffer(gl.UNIFORM_BUFFER, this.buffer);
    gl.bufferSubData(gl.UNIFORM_BUFFER, 0, data);
    gl.bindBuffer(gl.UNIFORM_BUFFER, null);
    return this;
  }
}