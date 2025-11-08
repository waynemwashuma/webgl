import { UniformBufferLayout } from "../core/layouts/uniformbuffer.js"


export class UniformBufferPointAllocator {
  number = 0

  reserve() {
    const id = this.number
    this.number++

    return id
  }
}

export class UniformBuffers {
  /**
   * @type {Map<string,UniformBuffer>}
   */
  list = new Map()

  allocator = new UniformBufferPointAllocator()

  /**
   * @param {WebGL2RenderingContext} gl 
   * @param {string} name 
   * @param {UniformBufferLayout} layout
   * @returns {UniformBuffer} 
   */
  set(gl, name, layout) {
    const index = this.allocator.reserve()
    return this.setAtPoint(gl, name, index, layout)
  }

  /**
   * @param {WebGL2RenderingContext} gl
   * @param {string} name
   * @param {number} index
   * @param {UniformBufferLayout} layout
   */
  setAtPoint(gl, name, index, layout) {
    const ubo = new UniformBuffer(gl, index, layout.size)
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
   * @param {UniformBufferLayout} layout
   * @returns {UniformBuffer}
   */
  getorSet(gl, name, layout) {
    const ubo = this.get(name)

    if (ubo) {
      if (ubo.size >= layout.size) {
        return ubo
      }

      // TODO: Delete the old buffer, we are leaking gpu memory here
      return this.setAtPoint(gl, name, ubo.point, layout)
    }

    return this.set(gl, name, layout)
  }
}
/**
 * @param {WebGL2RenderingContext} gl
 */
export class UniformBuffer {
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