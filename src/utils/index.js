import { Vector2 } from "../math/index.js"

export class ViewRectangle {
  offset = new Vector2()
  size = new Vector2(1, 1)

  /**
   * @param {ViewRectangle} other
   */
  copy(other) {
    this.offset.copy(other.offset)
    this.size.copy(other.size)
  }

  clone() {
    return new ViewRectangle().copy(this)
  }
}

export class Range {
  start
  end
  constructor(start = 0, end = 1) {
    this.start = start
    this.end = end
  }

  /**
   * @param {Range} other
   */
  copy(other) {
    this.start = other.start
    this.end = other.end
  }

  clone() {
    return new Range().copy(this)
  }
}

/**
 * Throws an error if the supplied test is null or undefined.
 *
 * @template T
 * @param {T} test
 * @param {string} message
 * @returns {asserts test is NonNullable<T>}
 */
export function assert(test, message) {
  if (test === undefined || test === null) throw message
}

/**
 * @template T
 * @template {string} U
 * @typedef {T & {__brand: U;}} Brand
 */

/**
 * @param {ArrayBuffer} source
 * @param {ArrayBuffer} destination
 * @param {number | undefined} offset
 * @param {number | undefined} length
 */
export function copyBuffer(source, destination, offset, length) {
  const sourceView = new Uint8Array(source)
  const destView = new Uint8Array(destination, offset, length)
  destView.set(sourceView)
}

export class AbstractClassError {
  static Unconstructable = "The class `{0}` is not constructible.Extend the class."
  static MethodUnimplemented = "The method `{0}.{1}()` is not implemented. Override the method without using `super.{1}()`."
  static MethodUncallable = "The method `{0}.{1}()` is not callable.`{0}` is an abstract class."
}