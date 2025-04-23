export class Vector3 {

  constructor(x = 0, y = 0, z = 0) {
    this.x = x
    this.y = y
    this.z = z

  }

  /**
   * @param {number} x
   * @param {number} y
   */
  set(x, y, z = 0) {
    this.x = x
    this.y = y
    this.z = z

    return this

  }
  /**
   * @param {number} scalar
   */
  splat(scalar) {
    this.x = scalar;
    this.y = scalar;
    this.z = scalar;

    return this;

  }

  clone() {
    return new Vector3(this.x, this.y, this.z)
  }

  /**
   * @param {Vector3} v
   */
  copy(v) {
    this.x = v.x
    this.y = v.y
    this.z = v.z

    return this

  }

  /**
   * @param {Vector3} v
   */
  add(v) {
    this.x += v.x
    this.y += v.y
    this.z += v.z

    return this

  }

  /**
   * @param {number} s
   */
  addScalar(s) {
    this.x += s
    this.y += s
    this.z += s

    return this

  }

  /**
   * @param {Vector3} v
   */
  sub(v) {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;

    return this;

  }

  /**
   * @param {number} s
   */
  subScalar(s) {
    this.x -= s;
    this.y -= s;
    this.z -= s;

    return this;
  }

  /**
   * @param {Vector3} v
   */
  multiply(v) {
    this.x *= v.x;
    this.y *= v.y;
    this.z *= v.z;

    return this;
  }

  /**
   * @param {number} scalar
   */
  multiplyScalar(scalar) {
    this.x *= scalar;
    this.y *= scalar;
    this.z *= scalar;

    return this;

  }

  /**
   * @param {{ raw: any; }} m
   */
  applyMatrix3(m) {
    const x = this.x,
      y = this.y,
      z = this.z;
    const e = m.raw;

    this.x = e[0] * x + e[3] * y + e[6] * z;
    this.y = e[1] * x + e[4] * y + e[7] * z;
    this.z = e[2] * x + e[5] * y + e[8] * z;

    return this;
  }

  /**
   * @param {any} m
   */
  applyNormalMatrix(m) {
    return this.applyMatrix3(m).normalize();
  }

  /**
   * @param {{ raw: any; }} m
   */
  applyMatrix4(m) {
    const x = this.x,
      y = this.y,
      z = this.z;
    const e = m.raw;

    const w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]);

    this.x = (e[0] * x + e[4] * y + e[8] * z + e[12]) * w;
    this.y = (e[1] * x + e[5] * y + e[9] * z + e[13]) * w;
    this.z = (e[2] * x + e[6] * y + e[10] * z + e[14]) * w;

    return this;

  }

  /**
   * @param {import("./quaternion.js").Quaternion} q
   */
  applyQuaternion(q) {
    const vx = this.x,
      vy = this.y,
      vz = this.z;
    const qx = q.x,
      qy = q.y,
      qz = q.z,
      qw = q.w;

    // t = 2 * cross( q.xyz, v );
    const tx = 2 * (qy * vz - qz * vy);
    const ty = 2 * (qz * vx - qx * vz);
    const tz = 2 * (qx * vy - qy * vx);

    // v + q.w * t + cross( q.xyz, t );
    this.x = vx + qw * tx + qy * tz - qz * ty;
    this.y = vy + qw * ty + qz * tx - qx * tz;
    this.z = vz + qw * tz + qx * ty - qy * tx;

    return this;
  }

  /**
   * @param {{ x: number; y: number; z: number; }} v
   */
  divide(v) {
    this.x /= v.x;
    this.y /= v.y;
    this.z /= v.z;

    return this;
  }

  /**
   * @param {number} scalar
   */
  divideScalar(scalar) {
    return this.multiplyScalar(1 / scalar);
  }

  /**
   * @param {{ x: number; y: number; z: number; }} min
   * @param {{ x: number; y: number; z: number; }} max
   */
  clamp(min, max) {
    // assumes min < max, componentwise

    this.x = Math.max(min.x, Math.min(max.x, this.x));
    this.y = Math.max(min.y, Math.min(max.y, this.y));
    this.z = Math.max(min.z, Math.min(max.z, this.z));

    return this;
  }

  /**
   * @param {number} minVal
   * @param {number} maxVal
   */
  clampScalar(minVal, maxVal) {
    this.x = Math.max(minVal, Math.min(maxVal, this.x));
    this.y = Math.max(minVal, Math.min(maxVal, this.y));
    this.z = Math.max(minVal, Math.min(maxVal, this.z));

    return this;
  }

  /**
   * @param {number} min
   * @param {number} max
   */
  clampmagnitude(min, max) {

    const magnitude = this.magnitude();

    return this.divideScalar(magnitude || 1).multiplyScalar(Math.max(min, Math.min(max, magnitude)));

  }

  round() {

    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    this.z = Math.round(this.z);

    return this;

  }

  negate() {

    this.x = -this.x;
    this.y = -this.y;
    this.z = -this.z;

    return this;

  }

  /**
   * @param {{ x: number; y: number; z: number; }} v
   */
  dot(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z;

  }

  magnitudeSq() {
    return this.x * this.x + this.y * this.y + this.z * this.z;

  }

  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);

  }

  manhattanmagnitude() {
    return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);

  }

  normalize() {
    return this.divideScalar(this.magnitude() || 1);

  }

  /**
   * @param {any} magnitude
   */
  setmagnitude(magnitude) {
    return this.normalize().multiplyScalar(magnitude);

  }

  /**
   * @param {{ x: number; y: number; z: number; }} v
   * @param {number} alpha
   */
  lerp(v, alpha) {
    this.x += (v.x - this.x) * alpha;
    this.y += (v.y - this.y) * alpha;
    this.z += (v.z - this.z) * alpha;

    return this;

  }

  /**
   * @param {{ x: number; y: number; z: number; }} v1
   * @param {{ x: number; y: number; z: number; }} v2
   * @param {number} alpha
   */
  lerpVectors(v1, v2, alpha) {
    this.x = v1.x + (v2.x - v1.x) * alpha;
    this.y = v1.y + (v2.y - v1.y) * alpha;
    this.z = v1.z + (v2.z - v1.z) * alpha;

    return this;
  }

  /**
   * @param {{ x: any; y: any; z: any; }} v
   */
  cross(v) {
    const ax = this.x,
      ay = this.y,
      az = this.z;
    const bx = v.x,
      by = v.y,
      bz = v.z;

    this.x = ay * bz - az * by;
    this.y = az * bx - ax * bz;
    this.z = ax * by - ay * bx;

    return this;
  }

  /**
   * @param {Vector3} v
   */
  projectOnVector(v) {
    const denominator = v.magnitudeSq();

    if (denominator === 0) return this.set(0, 0, 0);

    const scalar = v.dot(this) / denominator;

    return this.copy(v).multiplyScalar(scalar);
  }

  /**
   * @param {any} planeNormal
   */
  projectOnPlane(planeNormal) {
    _vector.copy(this).projectOnVector(planeNormal);

    return this.sub(_vector);
  }

  /**
   * @param {any} normal
   */
  reflect(normal) {
    return this.sub(_vector.copy(normal).multiplyScalar(2 * this.dot(normal)));
  }

  /**
   * @param {any} v
   */
  distanceTo(v) {
    return Math.sqrt(this.distanceToSquared(v));
  }

  /**
   * @param {{ x: number; y: number; z: number; }} v
   */
  distanceToSquared(v) {
    const dx = this.x - v.x,
      dy = this.y - v.y,
      dz = this.z - v.z;

    return dx * dx + dy * dy + dz * dz;
  }


  /**
   * @param {{ x: number; y: number; z: number; }} v
   */
  equals(v) {
    return ((v.x === this.x) && (v.y === this.y) && (v.z === this.z));
  }
  equalZero() {
    return ((0 === this.x) && (0 === this.y) && (0 === this.z))
  }

  /**
   * @param {number[]} array
   */
  fromArray(array, offset = 0) {

    this.x = array[offset];
    this.y = array[offset + 1];
    this.z = array[offset + 2];

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

    return array;

  }

  randomDirection() {

    const u = (Math.random() - 0.5) * 2;
    const t = Math.random() * Math.PI * 2;
    const f = Math.sqrt(1 - u ** 2);

    this.x = f * Math.cos(t);
    this.y = f * Math.sin(t);
    this.z = u;

    return this;

  }

  *[Symbol.iterator]() {
    yield this.x;
    yield this.y;
    yield this.z;

  }
}

let _vector = new Vector3()