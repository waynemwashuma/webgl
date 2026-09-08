import { PlaybackRepeat } from "./repeat.js"

export class Playback {
  /**
   * @type {number}
   */
  speed = 1

  /**
   * @type {number}
   */
  duration = 1

  /**
   * @type {number}
   */
  elapsed = 0

  /**
   * @type {PlaybackRepeat}
   */
  repeatMode = PlaybackRepeat.None

  /**
   * @type {boolean}
   */
  paused = false

  /**
   * @param {PlaybackSettings} [options]
   */
  constructor({
    duration = 1,
    speed = 1,
    repeatMode = PlaybackRepeat.None
  } = {}) {
    this.duration = duration
    this.speed = speed
    this.repeatMode = repeatMode
  }

  /**
   * @param {Playback} playback
   * @returns {this}
   */
  copy(playback) {
    this.speed = playback.speed
    this.duration = playback.duration
    this.elapsed = playback.elapsed
    this.repeatMode = playback.repeatMode
    this.paused = playback.paused

    return this
  }

  /**
   * @returns {Playback}
   */
  clone() {
    return new Playback().copy(this)
  }

  start() {
    this.elapsed = 0
    this.play()

    return this
  }

  stop() {
    this.elapsed = 0
    this.pause()

    return this
  }

  play() {
    this.paused = false
    return this
  }

  pause() {
    this.paused = true
    return this
  }

  /**
   * @param {number} delta
   */
  update(delta) {
    if (this.paused) {
      return this
    }

    if (this.duration <= 0) {
      this.elapsed = 0
      return this
    }

    const seekTime = this.elapsed + delta * this.speed

    switch (this.repeatMode) {
      case PlaybackRepeat.None:
        this.elapsed = Math.max(0, Math.min(this.duration, seekTime))
        break

      case PlaybackRepeat.Forever:
        this.elapsed = positiveModulo(seekTime, this.duration)
        break

      default:
        this.elapsed = seekTime
        break
    }

    return this
  }
}

/**
 * Serialized form of `Playback`.
 *
 * @typedef PlaybackSerial
 * @property {number} speed
 * @property {number} duration
 * @property {number} elapsed
 * @property {number} repeatMode
 * @property {boolean} paused
 */

/**
 * @typedef PlaybackSettings
 * @property {number} [duration]
 * @property {number} [speed]
 * @property {PlaybackRepeat} [repeatMode]
 */

/**
 * @param {number} value
 * @param {number} divisor
 */
function positiveModulo(value, divisor) {
  return ((value % divisor) + divisor) % divisor
}

