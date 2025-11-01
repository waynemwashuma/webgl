/**@import {WebGLRenderPipelineDescriptor } from '../caches/index.js' */

import {
  CullFace,
  FrontFaceDirection
} from "../constant.js"
import { RawMaterial } from "./raw.js"

export class Material extends RawMaterial {
  /**
   * @type {FrontFaceDirection}
   */
  frontFace = FrontFaceDirection.CCW
  /**
   * @type {CullFace}
   */
  cullFace = CullFace.Back
  /**
   * @type {boolean}
   */
  depthTest = true
  /**
   * @type {boolean}
   */
  depthWrite = true

  /**
   * @override
   * @returns {string}
   */
  vertex() {
    if (this.constructor === RawMaterial) {
      throw `\`${RawMaterial.name}\` cannot be used directly as a material.`
    }
    throw `Implement \`${this.constructor.name}.vertex()\``
  }

  /**
   * @override
   * @returns {string}
   */
  fragment() {
    if (this.constructor === RawMaterial) {
      throw `\`${RawMaterial.name}\` cannot be used directly as a material.`
    }
    throw `Implement \`${this.constructor.name}.fragment()\``
  }

  /**
   * @override
   * @returns {ArrayBuffer}
   */
  getData() {
    if (this.constructor === RawMaterial) {
      throw `\`${RawMaterial.name}\` cannot be used directly as a material.`
    }
    throw `Implement \`${this.constructor.name}.uploadUniforms()\``
  }

  /**
   * @override
   * @returns {bigint}
   */
  getPipelineBits() {
    let materialKey = MaterialKey.None
    if (this.cullFace === CullFace.Front) {
      materialKey |= MaterialKey.CullFaceFront
    } else if (this.cullFace === CullFace.Back) {
      materialKey |= MaterialKey.CullFaceBack
    } else if (this.cullFace === CullFace.FrontAndBack) {
      materialKey |= MaterialKey.CullFaceBoth
    }

    if (this.depthTest) {
      materialKey |= MaterialKey.DepthTest
    }
    if (this.depthWrite) {
      materialKey |= MaterialKey.DepthWrite
    }
    if (this.frontFace == FrontFaceDirection.CW) {
      materialKey |= MaterialKey.FrontFaceCW
    }

    return materialKey
  }

  /**
   * @override
   * @param {WebGLRenderPipelineDescriptor} descriptor 
   */
  specialize(descriptor) {
    // TODO: Incorporate blending to the pipeline key

    descriptor.cullFace = this.cullFace
    descriptor.frontFace = this.frontFace
    descriptor.depthTest = this.depthTest
    descriptor.depthWrite = this.depthWrite
  }
}

/**
 * @enum {bigint}
 */
export const MaterialKey = /**@type {const}*/({
  None: 0n,
  CullFaceNone: 0n << 0n,
  CullFaceFront: 1n << 0n,
  CullFaceBack: 2n << 0n,
  CullFaceBoth: 3n << 0n,
  FrontFaceCW: 1n << 2n,
  DepthWrite: 1n << 3n,
  DepthTest: 1n << 4n
})

/**
 * 
 */