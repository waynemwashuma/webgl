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
   */
  set(gl, name, layout) {
    const index = this.allocator.reserve()
    this.list.set(name, new UBO(gl, index, layout.size))
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
   */
  getorSet(gl, name, layout) {
    const ubo = this.get(name)

    if (ubo) {
      return ubo
    }

    this.set(gl, name, layout)
    return this.get(name)
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