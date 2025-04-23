/**
 * @param {number} v
 * @param {number} min
 * @param {number} max
 */
function clamp(v, min, max) {
  if (min > v) return min
  if (max < v) return max
  return
}
export class Quaternion {
  constructor(x = 0, y = 0, z = 0, w = 1) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }
  /**
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @param {number} w
   */
  set(x, y, z, w) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
    
    return this;
  }
  clone() {
    return new Quaternion(this.x, this.y, this.z, this.w);
  }
  /**
   * @param {Quaternion} quaternion
   */
  copy(quaternion) {
    this.x = quaternion.x;
    this.y = quaternion.y;
    this.z = quaternion.z;
    this.w = quaternion.w;
    
    return this;
  }
  /**
   * @param {import("./vector3.js").Vector3} euler
   */
  setFromEuler(euler, order = "XYZ") {
    const x = euler.x,
      y = euler.y,
      z = euler.z
      
    const cos = Math.cos;
    const sin = Math.sin;
    
    const c1 = cos(x / 2);
    const c2 = cos(y / 2);
    const c3 = cos(z / 2);
    
    const s1 = sin(x / 2);
    const s2 = sin(y / 2);
    const s3 = sin(z / 2);
    
    switch (order) {
      
      case 'XYZ':
        this.x = s1 * c2 * c3 + c1 * s2 * s3;
        this.y = c1 * s2 * c3 - s1 * c2 * s3;
        this.z = c1 * c2 * s3 + s1 * s2 * c3;
        this.w = c1 * c2 * c3 - s1 * s2 * s3;
        break;
        
      case 'YXZ':
        this.x = s1 * c2 * c3 + c1 * s2 * s3;
        this.y = c1 * s2 * c3 - s1 * c2 * s3;
        this.z = c1 * c2 * s3 - s1 * s2 * c3;
        this.w = c1 * c2 * c3 + s1 * s2 * s3;
        break;
        
      case 'ZXY':
        this.x = s1 * c2 * c3 - c1 * s2 * s3;
        this.y = c1 * s2 * c3 + s1 * c2 * s3;
        this.z = c1 * c2 * s3 + s1 * s2 * c3;
        this.w = c1 * c2 * c3 - s1 * s2 * s3;
        break;
        
      case 'ZYX':
        this.x = s1 * c2 * c3 - c1 * s2 * s3;
        this.y = c1 * s2 * c3 + s1 * c2 * s3;
        this.z = c1 * c2 * s3 - s1 * s2 * c3;
        this.w = c1 * c2 * c3 + s1 * s2 * s3;
        break;
        
      case 'YZX':
        this.x = s1 * c2 * c3 + c1 * s2 * s3;
        this.y = c1 * s2 * c3 + s1 * c2 * s3;
        this.z = c1 * c2 * s3 - s1 * s2 * c3;
        this.w = c1 * c2 * c3 - s1 * s2 * s3;
        break;
        
      case 'XZY':
        this.x = s1 * c2 * c3 - c1 * s2 * s3;
        this.y = c1 * s2 * c3 - s1 * c2 * s3;
        this.z = c1 * c2 * s3 + s1 * s2 * c3;
        this.w = c1 * c2 * c3 + s1 * s2 * s3;
        break;
        
      default:
        console.warn('THREE.Quaternion: .setFromEuler() encountered an unknown order: ' + order);
    }
    
    return this
  }
  /**
   * @param {{ x: number; y: number; z: number; }} axis
   * @param {number} angle
   */
  setFromAxisAngle(axis, angle) {
    const halfAngle = angle / 2,
      s = Math.sin(halfAngle);
    
    this.x = axis.x * s;
    this.y = axis.y * s;
    this.z = axis.z * s;
    this.w = Math.cos(halfAngle);
    
    return this;
  }
  /**
   * @param {{ raw: any; }} m
   */
  setFromRotationMatrix(m) {
    const te = m.raw,
      
      m11 = te[0],
      m12 = te[4],
      m13 = te[8],
      m21 = te[1],
      m22 = te[5],
      m23 = te[9],
      m31 = te[2],
      m32 = te[6],
      m33 = te[10],
      
      trace = m11 + m22 + m33;
    
    if (trace > 0) {
      const s = 0.5 / Math.sqrt(trace + 1.0);
      
      this.w = 0.25 / s;
      this.x = (m32 - m23) * s;
      this.y = (m13 - m31) * s;
      this.z = (m21 - m12) * s;
      
    } else if (m11 > m22 && m11 > m33) {
      
      const s = 2.0 * Math.sqrt(1.0 + m11 - m22 - m33);
      
      this.w = (m32 - m23) / s;
      this.x = 0.25 * s;
      this.y = (m12 + m21) / s;
      this.z = (m13 + m31) / s;
      
    } else if (m22 > m33) {
      
      const s = 2.0 * Math.sqrt(1.0 + m22 - m11 - m33);
      
      this.w = (m13 - m31) / s;
      this.x = (m12 + m21) / s;
      this.y = 0.25 * s;
      this.z = (m23 + m32) / s;
      
    } else {
      
      const s = 2.0 * Math.sqrt(1.0 + m33 - m11 - m22);
      
      this.w = (m21 - m12) / s;
      this.x = (m13 + m31) / s;
      this.y = (m23 + m32) / s;
      this.z = 0.25 * s;
      
    }
    
    return this;
  }
  
  /**
   * @param {{ dot: (arg0: any) => number; x: number; z: number; y: number; }} vFrom
   * @param {{ z: number; y: number; x: number; }} vTo
   */
  setFromUnitVectors(vFrom, vTo) {
    let r = vFrom.dot(vTo) + 1;
    
    if (r < Number.EPSILON) {
      r = 0;
      
      if (Math.abs(vFrom.x) > Math.abs(vFrom.z)) {
        
        this.x = -vFrom.y;
        this.y = vFrom.x;
        this.z = 0;
        this.w = r;
        
      } else {
        
        this.x = 0;
        this.y = -vFrom.z;
        this.z = vFrom.y;
        this.w = r;
        
      }
      
    } else {
      this.x = vFrom.y * vTo.z - vFrom.z * vTo.y;
      this.y = vFrom.z * vTo.x - vFrom.x * vTo.z;
      this.z = vFrom.x * vTo.y - vFrom.y * vTo.x;
      this.w = r;
      
    }
    return this.normalize();
  }
  
  /**
   * @param {any} q
   */
  angleTo(q) {
    return 2 * Math.acos(Math.abs(
      clamp(this.dot(q), -1, 1)
    ));
  }
  
  /**
   * @param {any} q
   * @param {number} step
   */
  rotateTowards(q, step) {
    const angle = this.angleTo(q);
    
    if (angle === 0) return this;
    
    const t = Math.min(1, step / angle);
    
    this.slerp(q, t);
    
    return this;
    
  }
  
  identity() {
    return this.set(0, 0, 0, 1);
  }
  
  invert() {
    // quaternion is assumed to have unit length
    return this.conjugate();
  }
  conjugate() {
    this.x *= -1;
    this.y *= -1;
    this.z *= -1;
    
    return this;
  }
  
  /**
   * @param {{ x: number; y: number; z: number; w: number; }} v
   */
  dot(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;
  }
  
  lengthSq() {
    return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
  }
  
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
  }
  
  normalize() {
    let l = this.length();
    if (l === 0) {
      this.x = 0;
      this.y = 0;
      this.z = 0;
      this.w = 1;
    } else {
      l = 1 / l;
      
      this.x = this.x * l;
      this.y = this.y * l;
      this.z = this.z * l;
      this.w = this.w * l;
      
    }
    
    return this;
  }
  
  /**
   * @param {Quaternion} q
   */
  multiply(q) {
    return Quaternion.multiply(this, q, this);
  }
  
  /**
   * @param {any} q
   */
  premultiply(q) {
    return Quaternion.multiply(q, this, this);
  }
  
  /**
   * @param {Quaternion} a
   * @param {Quaternion} b
   * @param {Quaternion} out
   */
  static multiply(a, b, out) {
    const qax = a.x,
      qay = a.y,
      qaz = a.z,
      qaw = a.w;
    const qbx = b.x,
      qby = b.y,
      qbz = b.z,
      qbw = b.w;
    
    out.x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
    out.y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
    out.z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
    out.w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;
    
    return this;
    
  }
  
  /**
   * @param {Quaternion} qb
   * @param {number} t
   */
  slerp(qb, t) {
    
    if (t === 0) return this;
    if (t === 1) return this.copy(qb);
    
    const x = this.x,
      y = this.y,
      z = this.z,
      w = this.w;
    
    let cosHalfTheta = w * qb.w + x * qb.x + y * qb.y + z * qb.z;
    
    if (cosHalfTheta < 0) {
      
      this.w = -qb.w;
      this.x = -qb.x;
      this.y = -qb.y;
      this.z = -qb.z;
      
      cosHalfTheta = -cosHalfTheta;
      
    } else {
      this.copy(qb);
    }
    if (cosHalfTheta >= 1.0) {
      this.w = w;
      this.x = x;
      this.y = y;
      this.z = z;
      
      return this;
    }
    
    const sqrSinHalfTheta = 1.0 - cosHalfTheta * cosHalfTheta;
    
    if (sqrSinHalfTheta <= Number.EPSILON) {
      
      const s = 1 - t;
      this.w = s * w + t * this.w;
      this.x = s * x + t * this.x;
      this.y = s * y + t * this.y;
      this.z = s * z + t * this.z;
      
      this.normalize();
      
      
      return this;
      
    }
    
    const sinHalfTheta = Math.sqrt(sqrSinHalfTheta);
    const halfTheta = Math.atan2(sinHalfTheta, cosHalfTheta);
    const ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta,
      ratioB = Math.sin(t * halfTheta) / sinHalfTheta;
    
    this.w = (w * ratioA + this.w * ratioB);
    this.x = (x * ratioA + this.x * ratioB);
    this.y = (y * ratioA + this.y * ratioB);
    this.z = (z * ratioA + this.z * ratioB);
    
    return this;
  }
  
  /**
   * 
   * @param {Quaternion} qa 
   * @param {Quaternion} qb 
   * @param {number} t 
   * @returns 
   */
  static slerp(qa, qb, t) {
    return qa.copy(qb).slerp(qb, t);
  }
  
  random() {
    const u1 = Math.random();
    const sqrt1u1 = Math.sqrt(1 - u1);
    const sqrtu1 = Math.sqrt(u1);
    
    const u2 = 2 * Math.PI * Math.random();
    
    const u3 = 2 * Math.PI * Math.random();
    
    return this.set(
      sqrt1u1 * Math.cos(u2),
      sqrtu1 * Math.sin(u3),
      sqrtu1 * Math.cos(u3),
      sqrt1u1 * Math.sin(u2),
    );
    
  }
  
  /**
   * @param {{ x: number; y: number; z: number; w: number; }} quaternion
   */
  equals(quaternion) {
    return (quaternion.x === this.x) && (quaternion.y === this.y) && (quaternion.z === this.z) && (quaternion.w === this.w);
  }
  
  /**
   * @param {number[]} array
   */
  fromArray(array, offset = 0) {
    this.x = array[offset];
    this.y = array[offset + 1];
    this.z = array[offset + 2];
    this.w = array[offset + 3];
    
    
    return this;
    
  }
  
  /**
   * 
   * @param {number[]} array 
   * @param {number} offset 
   * @returns 
   */
  toArray(array = [], offset = 0) {
    array[offset] = this.x;
    array[offset + 1] = this.y;
    array[offset + 2] = this.z;
    array[offset + 3] = this.w;
    
    return array;
    
  }
  
  toJSON() {
    return this.toArray();
  }
  
  /**
   * @param {any} obj
   */
  fromJSON(obj) {
    return this.fromArray(obj);
  }
  
  *[Symbol.iterator]() {
    yield this.x;
    yield this.y;
    yield this.z;
    yield this.w;
  }
}