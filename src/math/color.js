function clamp(v, min, max) {
  if (min > v) return min
  if (max < v) return max
  return v
}

function random(min, max) {
  return Math.random() * (max - min) + min
}

/**
 * A color manipulation class.
 */
export class Color {

  /**
   * @param {number} [r=1] - red component [0 .. 255]
   * @param {number} [g=1] - green component [0 .. 255]
   * @param {number} [b=1] - blue component [0 .. 255]
   * @param {number} [alpha=1.0] - alpha value [0.0 .. 1.0]
   */
  constructor(r = 1, g = 1, b = 1, alpha = 1.0) {
    this.setColor(r, g, b, alpha);
  }

  /**
   * Set this color to the specified value.
   * @param {number} r - red component [0 .. 255]
   * @param {number} g - green component [0 .. 255]
   * @param {number} b - blue component [0 .. 255]
   * @param {number} [alpha=1.0] - alpha value [0.0 .. 1.0]
   * @returns {Color} Reference to this object for method chaining
   */
  setColor(r, g, b, alpha = 1.0) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = alpha;
    return this;
  }

  /**
   * Create a new copy of this color object.
   * @returns {Color} Reference to the newly cloned object
   */
  clone() {
    return new Color().copy(this);
  }

  /**
   * Copy a color object or CSS color into this one.
   * @param {Color|string} color
   * @returns {Color} Reference to this object for method chaining
   */
  copy(color) {
    this.setColor(color.r, color.g, color.b, color.a)
  }

  /**
   * Blend this color with the given one using addition.
   * @param {Color} color
   * @returns {Color} Reference to this object for method chaining
   */
  add(color) {
    this.r = clamp(this.r + color.r, 0, 255);
    this.g = clamp(this.g + color.g, 0, 255);
    this.b = clamp(this.b + color.b, 0, 255);
    this.a = (this.a + color.a) / 2;

    return this;
  }

  /**
   * Darken this color value by 0..1
   * @param {number} scale
   * @returns {Color} Reference to this object for method chaining
   */
  darken(scale) {
    scale = clamp(scale, 0, 1);
    this.r *= scale;
    this.g *= scale;
    this.b *= scale;

    return this;
  }

  /**
   * Linearly interpolate between this color and the given one.
   * @param {Color} color
   * @param {number} alpha - with alpha = 0 being this color, and alpha = 1 being the given one.
   * @returns {Color} Reference to this object for method chaining
   */
  lerp(color, alpha) {
    alpha = clamp(alpha, 0, 1);
    this.r += (color.r - this.r) * alpha;
    this.g += (color.g - this.g) * alpha;
    this.b += (color.b - this.b) * alpha;

    return this;
  }

  /**
   * Lighten this color value by 0..1
   * @param {number} scale
   * @returns {Color} Reference to this object for method chaining
   */
  lighten(scale) {
    scale = clamp(scale, 0, 1);
    this.glArray[0] = clamp(this.glArray[0] + (1 - this.glArray[0]) * scale, 0, 1);
    this.glArray[1] = clamp(this.glArray[1] + (1 - this.glArray[1]) * scale, 0, 1);
    this.glArray[2] = clamp(this.glArray[2] + (1 - this.glArray[2]) * scale, 0, 1);

    return this;
  }

  /**
   * Generate random r,g,b values for this color object
   * @param {number} [min=0] - minimum value for the random range
   * @param {number} [max=255] - maxmium value for the random range
   * @returns {Color} Reference to this object for method chaining
   */
  random(min = 0, max = 255) {
    if (min < 0) {
      min = 0;
    }
    if (max > 255) {
      max = 255;
    }

    return this.setColor(
      random(min, max),
      random(min, max),
      random(min, max),
      this.a
    );
  }


  toArray(array, offset = 0) {
    array[offset] = this.r
    array[offset + 1] = this.g
    array[offset + 2] = this.b
    array[offset + 3] = this.a

    return array
  }
  
  *[Symbol.iterator](){
    yield this.r
    yield this.b
    yield this.g
    yield this.a
  }
}

export { Color as default };