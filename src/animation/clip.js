import {
  AnimationTrack
} from "./track.js"

export class AnimationClip {
  /**
   * @type {Map<string, AnimationTrack[]>}
   */
  tracks = new Map()

  /**
   * @type {number}
   */
  duration = 0

  /**
   * @param {string} name
   * @param {AnimationTrack} track
   * @returns {this}
   */
  add(name, track) {
    const tracks = this.tracks.get(name)

    if (tracks) {
      tracks.push(track)
    } else {
      this.tracks.set(name, [track])
    }

    this.calculateDuration()
    return this
  }

  /**
   * @param {string} name
   * @returns {AnimationTrack[] | undefined}
   */
  getTracks(name) {
    return this.tracks.get(name)
  }

  /**
   * @param {string} name
   * @returns {this}
   */
  remove(name) {
    if (this.tracks.delete(name)) {
      this.calculateDuration()
    }

    return this
  }

  /**
   * Recomputes the clip duration from all tracks.
   * @returns {number}
   */
  calculateDuration() {
    let duration = 0

    this.tracks.forEach((tracks) => {
      for (let i = 0; i < tracks.length; i++) {
        const track = /** @type {AnimationTrack} */ (tracks[i])

        const lastIndex = track.times.length - 1
        if (lastIndex < 0) {
          continue
        }

        const contender = /** @type {number} */ (track.times[lastIndex])

        if (duration < contender) {
          duration = contender
        }
      }
    })

    this.duration = duration
    return duration
  }

  /**
   * @returns {boolean}
   */
  validate() {
    for (const tracks of this.tracks.values()) {
      for (let i = 0; i < tracks.length; i++) {
        const track = /** @type {AnimationTrack} */ (tracks[i])
        if (!track.validate()) {
          return false
        }
      }
    }

    return true
  }

  /**
   * @param {AnimationClip} clip
   * @returns {this}
   */
  copy(clip) {
    this.duration = clip.duration
    this.tracks = new Map()

    clip.tracks.forEach((tracks, name) => {
      /** @type {AnimationTrack[]} */
      const clonedTracks = []

      for (let i = 0; i < tracks.length; i++) {
        const track = /** @type {AnimationTrack} */ (tracks[i])

        clonedTracks.push(track.clone())
      }

      this.tracks.set(name, clonedTracks)
    })

    return this
  }

  /**
   * @returns {AnimationClip}
   */
  clone() {
    return new AnimationClip().copy(this)
  }
}

/**
 * @typedef AnimationClipSerial
 * @property {number} duration
 * @property {[string, any[]][]} tracks
 */

