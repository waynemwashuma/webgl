import { Bone3D } from "../bone.js";
import { MeshMaterial3D } from "../mesh.js";
import { Object3D } from "../object3d.js";

/**
 * @class
 */
export class SkeletonHelper extends Object3D {
  /**
   * @type {Bone3D}
   */
  rootBone

  /**
   * @type {MeshMaterial3D}
   */
  skinnedMesh
  /**
   * @param {Bone3D} rootBone
   * @param {MeshMaterial3D} skinnedMesh
   */
  constructor(rootBone, skinnedMesh) {
    super()
    this.rootBone = rootBone
    this.skinnedMesh = skinnedMesh
  }
}

