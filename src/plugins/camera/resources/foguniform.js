import { UniformBuffer } from "../../../core/resources/index.js"
import { snapUp } from "../../../math/index.js"

/**
 * CPU-side payload for fog color, range, and camera depth data.
 */
export class FogUniform {
  /**
   * std140 keeps the block aligned to a 16-byte slot.
   * @type {number}
   */
  static BlockSize = 32

  /**
   * Returns the size of one dynamically offset slot for the current device.
   * @param {import("../../../core/index.js").WebGLRenderDevice} renderDevice
   * @returns {number}
   */
  static getBindingSize(renderDevice) {
    return snapUp(
      FogUniform.BlockSize,
      renderDevice.limits.minUniformBufferOffsetAlignment
    )
  }

  /**
   * Size of a single fog slot in the shared buffer.
   * @readonly
   * @type {number}
   */
  bindingSize

  /**
   * Maps cameras to fog slots for the current frame.
   * @type {WeakMap<import("../../../objects/camera/camera.js").Camera, number>}
   */
  slots = new WeakMap()

  /**
   * Next fog slot to allocate.
   * @type {number}
   */
  nextSlot = 0

  /**
   * Backing CPU-side buffer used by the renderer's GPU cache.
   * @readonly
   * @type {UniformBuffer}
   */
  buffer = new UniformBuffer()

  /**
   * @param {import("../../../core/index.js").WebGLRenderDevice} renderDevice
   */
  constructor(renderDevice) {
    this.bindingSize = FogUniform.getBindingSize(renderDevice)
  }

  /**
   * Clears per-frame slot assignments and discards stale fog data.
   */
  reset() {
    this.slots = new WeakMap()
    this.nextSlot = 0
    this.buffer.data = new ArrayBuffer(0)
  }

  /**
   * Returns the fog slot for a camera, allocating one if needed.
   * @param {import("../../../objects/camera/camera.js").Camera} camera
   * @returns {number}
   */
  getSlot(camera) {
    const existing = this.slots.get(camera)

    if (existing !== undefined) {
      return existing
    }

    const slot = this.nextSlot++
    this.slots.set(camera, slot)
    return slot
  }

  /**
   * Returns the dynamic offset for a camera if one was assigned.
   * @param {import("../../../objects/camera/camera.js").Camera} camera
   * @returns {number | undefined}
   */
  getOffset(camera) {
    const slot = this.slots.get(camera)

    if (slot === undefined) {
      return undefined
    }

    return slot * this.bindingSize
  }

  /**
   * Writes a fog payload into the slot associated with a camera.
   * @param {import("../../../objects/camera/camera.js").Camera} camera
   * @param {import("../../../objects/index.js").Fog} fog
   * @param {number} near
   * @param {number} far
   * @returns {number} The dynamic offset for the slot.
   */
  setFog(camera, fog, near, far) {
    const offset = this.getSlot(camera) * this.bindingSize
    const data = this.#ensureCapacity(offset + this.bindingSize)
    const view = new DataView(data)

    view.setFloat32(offset, fog.color.r, true)
    view.setFloat32(offset + 4, fog.color.g, true)
    view.setFloat32(offset + 8, fog.color.b, true)
    view.setFloat32(offset + 12, fog.color.a, true)
    view.setFloat32(offset + 16, fog.start, true)
    view.setFloat32(offset + 20, fog.end, true)
    view.setFloat32(offset + 24, near, true)
    view.setFloat32(offset + 28, far, true)

    this.buffer.data = data

    return offset
  }

  /**
   * @param {number} minSize
   * @returns {ArrayBuffer}
   */
  #ensureCapacity(minSize) {
    const data = this.buffer.data

    if (data.byteLength >= minSize) {
      return data
    }

    const next = new ArrayBuffer(minSize)
    new Uint8Array(next).set(new Uint8Array(data))
    return next
  }
}
