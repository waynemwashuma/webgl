import { UniformBuffer } from "../../../core/resources/index.js"

export class ShadowCasterUniformBuffer {
  static BlockSize = 112

  /**
   * Backing CPU-side buffer used by the renderer's GPU cache.
   * @readonly
   * @type {UniformBuffer}
   */
  buffer

  /**
   * Total number of shadow caster items that fit in this buffer.
   * @readonly
   * @type {number}
   */
  capacity

  /**
   * @param {import("../../../core/index.js").WebGLRenderDevice} renderDevice
   */
  constructor(renderDevice) {
    this.capacity = Math.floor(renderDevice.limits.maxUniformBufferBindingSize / ShadowCasterUniformBuffer.BlockSize)
    this.buffer = new UniformBuffer(new ArrayBuffer(this.capacity * ShadowCasterUniformBuffer.BlockSize))
  }

  /**
   * Copies the backing payload into the fixed-size shadow caster buffer.
   *
   * @param {ArrayBuffer} data
   */
  setData(data) {
    if (data.byteLength > this.buffer.size) {
      throw new Error("Shadow caster data exceeds the configured capacity")
    }

    const target = this.buffer.data
    const targetBytes = new Uint8Array(target)

    targetBytes.fill(0)
    targetBytes.set(new Uint8Array(data))
    this.buffer.data = target
  }
}
