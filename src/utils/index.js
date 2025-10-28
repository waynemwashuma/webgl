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
