/**@import {WebGLRenderPipelineDescriptor, BlendDescriptor } from '../core/index.js' */
/**@import { PipelineKey } from './raw.js' */

import {
  CullFace,
  FrontFaceDirection
} from "../constant.js"
import { Color } from "../math/index.js"
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
   * @type {BlendDescriptor | undefined}
   */
  blend
  /**
   * @type {Color}
   */
  blendColor = new Color()

  /**
   * @returns {string}
   */
  vertex() {
    if (this.constructor === RawMaterial) {
      throw `\`${RawMaterial.name}\` cannot be used directly as a material.`
    }
    throw `Implement \`${this.constructor.name}.vertex()\``
  }

  /**
   * @returns {string}
   */
  fragment() {
    if (this.constructor === RawMaterial) {
      throw `\`${RawMaterial.name}\` cannot be used directly as a material.`
    }
    throw `Implement \`${this.constructor.name}.fragment()\``
  }

  /**
   * @returns {ArrayBuffer}
   */
  getData() {
    if (this.constructor === RawMaterial) {
      throw `\`${RawMaterial.name}\` cannot be used directly as a material.`
    }
    throw `Implement \`${this.constructor.name}.uploadUniforms()\``
  }

  /**
   * @returns {bigint}
   */
  getPipelineKey() {
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
   * @param {WebGLRenderPipelineDescriptor} descriptor 
   */
  specialize(descriptor) {
    // TODO: Incorporate blending to the pipeline key

    if(this.blend){
      descriptor.fragment?.targets?.forEach((target)=>{
        target.blend = {
          color:this.blend.color.clone(),
          alpha:this.blend.alpha.clone(),
        }
      })
    }

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
  CullFaceFront: 1n << 0n,
  CullFaceBack: 1n << 1n,
  CullFaceBoth: 1n << 2n,
  FrontFaceCW: 1n << 3n,
  DepthWrite: 1n << 4n,
  DepthTest: 1n << 5n
})