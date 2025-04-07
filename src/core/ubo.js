

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

  set(gl,name,item){
    const index = this.allocator.reserve()
    this.list.set(name,new UBO(gl,index,item.size))
  }

  get(name){
    return this.list.get(name)
  }
  getorSet(gl, name, item){
    const ubo = this.get(name)

    if(ubo){
      return ubo
    }

    this.set(gl, name, item)
    return this.get(name)
  }
}
/**
 * @param {WebGL2RenderingContext} gl
 */
export class UBO {
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