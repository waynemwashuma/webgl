import { mat4 } from "./glMatrix.js"

let arr = [],
  arr2 = [],
  arr3 = []
let toRad = Math.PI / 180
export class Matrix4 {
  constructor() {
    this.raw = mat4.identity(mat4.create())
  }
  rotateX(rad) {
    mat4.rotateX(this.raw, rad)
    return this
  }
  rotateY(rad) {
    mat4.rotateY(this.raw, rad)
    return this
  }
  rotateZ(rad) {
    mat4.rotateZ(this.raw, rad)
    return this
  }
  scale(v) {
    mat4.scale(this.raw, v.toArray(arr))
    return this
  }
  scaleX(x) {
    arr[0] = x
    arr[1] = 1
    arr[2] = 1
    mat4.scale(this.raw, arr)
    return this
  }
  scaleY(x) {
    arr[0] = 1
    arr[1] = x
    arr[2] = 1
    mat4.scale(this.raw, arr)
    return this
  }
  scaleZ(x) {
    arr[0] = 1
    arr[1] = 1
    arr[2] = x
    mat4.scale(this.raw, arr)
    return this
  }
  translate(position) {
    mat4.translate(this.raw, position.toArray(arr))
    return this
  }
  translateX(x) {
    arr[0] = x
    arr[1] = 0
    arr[2] = 0
    mat4.translate(this.raw, arr)
    return this
  }
  translateY(x) {
    arr[0] = 0
    arr[1] = x
    arr[2] = 0
    mat4.translate(this.raw, arr)
    return this
  }
  translateZ(x) {
    arr[0] = 0
    arr[1] = 0
    arr[2] = x
    mat4.translate(this.raw, arr)
    
    return this
  }
  inverse() {
    mat4.inverse(this.raw)
    return this
  }
  transpose() {
    mat4.transpose(this.raw)
    return this
  }
  compose(position, quaternion, scale) {
    const te = this.raw;
    const x = quaternion.x,
      y = quaternion.y,
      z = quaternion.z,
      w = quaternion.w;
    const x2 = x + x,
      y2 = y + y,
      z2 = z + z;
    const xx = x * x2,
      xy = x * y2,
      xz = x * z2;
    const yy = y * y2,
      yz = y * z2,
      zz = z * z2;
    const wx = w * x2,
      wy = w * y2,
      wz = w * z2;
    const sx = scale.x,
      sy = scale.y,
      sz = scale.z;
    
    te[0] = (1 - (yy + zz)) * sx;
    te[1] = (xy + wz) * sx;
    te[2] = (xz - wy) * sx;
    te[3] = 0;
    
    te[4] = (xy - wz) * sy;
    te[5] = (1 - (xx + zz)) * sy;
    te[6] = (yz + wx) * sy;
    te[7] = 0;
    
    te[8] = (xz + wy) * sz;
    te[9] = (yz - wx) * sz;
    te[10] = (1 - (xx + yy)) * sz;
    te[11] = 0;
    
    te[12] = position.x;
    te[13] = position.y;
    te[14] = position.z;
    te[15] = 1;
    
    return this;
    
  }
  identity() {
    mat4.identity(this.raw)
    return this
  }
  copy(m) {
    mat4.set(m.raw, this.raw)
    return this
  }
  lookAt(eye, target, up) {
    mat4.lookAt(
      eye.toArray(arr),
      target.toArray(arr2),
      up.toArray(arr3)
    )
    return this
  }
  toArray(array, offset = 0) {
    
    //TOdo - when you remove the raw from glmatrix.
    array[offset] = this.raw[0]
    array[offset + 1] = this.raw[1]
    array[offset + 2] = this.raw[2]
    array[offset + 3] = this.raw[3]
    array[offset + 4] = this.raw[4]
    array[offset + 5] = this.raw[5]
    array[offset + 6] = this.raw[6]
    array[offset + 7] = this.raw[7]
    array[offset + 8] = this.raw[8]
    array[offset + 9] = this.raw[9]
    array[offset + 10] = this.raw[10]
    array[offset + 11] = this.raw[11]
    array[offset + 12] = this.raw[12]
    array[offset + 13] = this.raw[13]
    array[offset + 14] = this.raw[14]
    array[offset + 15] = this.raw[15]
    
    return array
  }
  multiply(matrix) {
    mat4.multiply(this.raw, matrix.raw, this.raw)
    return this
  }
  makePerspective(fovy, aspect, near, far) {
    mat4.perspective(fovy, aspect, near, far, this.raw)
    return this
  }
  makeOthorgraphic(left, right, bottom, top, near, far) {
    mat4.ortho(left, right, bottom, top, near, far, this.raw)
    return this
  }
  
  transform(vector) {
    const result = mat4.multiplyVec3(this.raw, [...vector])
    
    
    vector.x = result[0]
    vector.y = result[1]
    vector.z = result[2]
    
    return this
  }
  transformDirection(vector) {
    const result = mat4.multiplyVec3(this.raw, [...vector])
    
    vector.x = result[0] - this.raw[13]
    vector.y = result[1] - this.raw[14]
    vector.z = result[2] - this.raw[15]
    
    return this
  }
  
  *[Symbol.iterator]() {
    for (let i = 0; i < this.raw.length; i++) {
      yield this.raw[i]
    }
  }
}