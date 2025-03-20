import { typeOfUniform } from "../function.js"
import { UniformType } from "../constant.js"
/**
 * @param {WebGL2RenderingContext} gl
 */
export class UBO {
  constructor(gl, name, point, bufSize, aryCalc) {
    this.items = {}

    for (let i = 0; i < aryCalc.length; i++) {
      this.items[aryCalc[i].name] = { offset: aryCalc[i].offset, size: aryCalc[i].dataLen };
    }

    this.name = name;
    this.point = point;
    this.buffer = gl.createBuffer();

    gl.bindBuffer(gl.UNIFORM_BUFFER, this.buffer)
    gl.bufferData(gl.UNIFORM_BUFFER, bufSize, gl.DYNAMIC_DRAW)
    gl.bindBuffer(gl.UNIFORM_BUFFER, null)
    gl.bindBufferBase(gl.UNIFORM_BUFFER, point, this.buffer)
  }
  /**
   * @param {string} name
   * @param {Float32Array} data
   */
  update(gl, name, data) {
    //hack - data should always be a float32array.
    if(typeof data === "number"){
      data = new Float32Array(data)
    }
    gl.bindBuffer(gl.UNIFORM_BUFFER, this.buffer);
    gl.bufferSubData(gl.UNIFORM_BUFFER,
      this.items[name].offset, data, 0,
      this.items[name].size / 4
    );
    gl.bindBuffer(gl.UNIFORM_BUFFER, null);
    return this;
  }

  static getSize(type) { //[Alignment,Size]
    switch (type) {
      case UniformType.INT:
      case UniformType.FLOAT:
      case UniformType.BOOL:
        return 4
      case UniformType.MAT4:
        return 64 //16*4
      case UniformType.MAT3:
        return 48 //16*3
      case UniformType.MAT2:
        return 32 //16*2
      case UniformType.VEC2:
        return 8
      case UniformType.VEC3:
        return 16 //Special Case
      case UniformType.VEC4:
        return 16
      default:
        return 0
    }
  }

  static calculate(ary) {
    let chunk = 16,
      i = 0,
      tsize = 0,
      offset = 0,
      size,
      data = []
    for (let name in ary) {
      data.push({
        name: "",
        offset: 0,
        dataLen: 0,
        chunkLen: 0,
      })
    }

    for (let name in ary) {
      let type = typeOfUniform(ary[name])
      size = UBO.getSize(type)
      tsize = chunk - size;

      if (tsize < 0 && chunk < 16) {
        offset += chunk;
        if (i > 0) data[i - 1].chunkLen += chunk
        chunk = 16
      } else if (tsize < 0 && chunk == 16) {} else if (tsize == 0) {
        if (type == UniformType.VEC3 && chunk == 16) chunk -= 12;
        else chunk = 16;

      } else chunk -= size
      data[i].offset = offset
      data[i].chunkLen = size
      data[i].dataLen = size
      data[i].name = name
      offset += size
      i++
    }
    return [data, offset];
  }

  static debugVisualize(ubo) {
    let str = "",
      chunk = 0,
      tchunk = 0,
      itm = null
    for (let i in ubo.items) {
      itm = ubo.items[i]
      chunk = 4;
      for (let x = 0; x < chunk; x++) {
        str += (x == 0 || x == chunk - 1) ? "|." + i + "." : "||...."; //Display the index
        tchunk++;
        if (tchunk % 4 == 0) str += "|\n";
      }
      i++
    }
    if (tchunk % 4 != 0) str += "|";
    return str
  }
}
export function createUBO(gl, name, point, uniforms) {
  var [data, bufSize] = UBO.calculate(uniforms);
  let ubo = new UBO(gl, name, point, bufSize, data);
  console.log(ubo)
  return ubo
}