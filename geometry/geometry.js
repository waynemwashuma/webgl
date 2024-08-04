import {
  ATTR_POSITION_LOC,
  ATTR_NORMAL_LOC,
  ATTR_UV_LOC,
  ATTR_POSITION_NAME,
  ATTR_NORMAL_NAME,
  ATTR_UV_NAME
} from "../constants.js"

export class Geometry {
  constructor() {
    this._VAO = null
    this._attributes = {}
  }
  /**
   * @param {WebGL2RenderingContext} gl
   */
  init(gl, program) {
    
    this._VAO = createVAO(gl, this.attributes, program)
  }
  setAttribute(name, attribute) {
    this._attributes[name] = attribute
    return this
  }
  get attributes() {
    return this._attributes
  }
  get VAO() {
    return this._VAO
  }
}

function createVAO(gl, attributes, program) {
  let vao = gl.createVertexArray()
  gl.bindVertexArray(vao)
  let location = 0
  for (var name in attributes) {
    if (name == "indices") continue
    let dict = attributes[name]
    let buffer = gl.createBuffer()
    let array = new Float32Array(dict.value)

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, array, gl.STATIC_DRAW)
    gl.enableVertexAttribArray(location)
    gl.vertexAttribPointer(location, dict.size, gl.FLOAT, false, 0, 0)

    dict.buffer = buffer
    dict.location = location++
  }
  if (attributes["indices"] !== void 0) {
    let dict = attributes["indices"]
    let buffer = gl.createBuffer()
    dict.buffer = buffer

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(dict.value), gl.STATIC_DRAW)
  }
  gl.bindVertexArray(null)
  gl.bindBuffer(gl.ARRAY_BUFFER, null)
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)
  return vao
} /**/