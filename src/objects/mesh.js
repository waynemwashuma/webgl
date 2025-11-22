import { Mesh } from "../mesh/index.js"
import { Texture, TextureFormat, TextureType } from "../texture/index.js"
import { Object3D } from "./object3d.js"
import { Affine3 } from "../math/index.js"
import { RawMaterial } from "../material/index.js"
import { Bone3D } from "./bone.js";

export class Skin {

  // NOTE: Maybe this should not be here but available globally?
  /**
   * @type {Texture}
   */
  boneTexture = new Texture({
    type: TextureType.Texture2D,
    data: new Uint8Array([0, 0, 0, 0]).buffer,
    width: 4,
    height: 0,
    format: TextureFormat.RGBA32Float,
    generateMipmaps: false,
  })

  /**
   * @type {Affine3}
   */
  bindMatrix = Affine3.identity()

  /**
   * @type {Affine3}
   */
  inverseBindMatrix = Affine3.identity()

  /**
   * @type {Bone3D[]}
   */
  bones = []

  /**
   * @type {Affine3[]}
   */
  inverseBindPose = []

  constructor() { }

  clone() {
    const skin = new Skin()
    skin.inverseBindPose = this.inverseBindPose
    skin.bones = this.bones.slice()
    return skin
  }

  setBindPose() {
    for (let i = 0; i < this.bones.length; i++) {
      const bone = /**@type {Bone3D} */ (this.bones[i])
      const element = this.inverseBindPose[i] || new Affine3();
      element.copy(bone.transform.world).invert()
      this.inverseBindPose[i] = element
    }
  }

  updateTexture() {
    const data = new Float32Array(this.bones.length * 16)

    for (let i = 0; i < this.bones.length; i++) {
      const offset = i * 16
      const bone = /**@type {Bone3D} */ (this.bones[i])
      const pose = /**@type {Affine3} */ (this.inverseBindPose[i])
      const world = Affine3.multiply(
        bone.transform.world,
        pose
      )/**/

      // PERF: Remove last row as it is always constant
      data[offset + 0] = world.a
      data[offset + 1] = world.b
      data[offset + 2] = world.c
      data[offset + 3] = 0
      data[offset + 4] = world.d
      data[offset + 5] = world.e
      data[offset + 6] = world.f
      data[offset + 7] = 0
      data[offset + 8] = world.g
      data[offset + 9] = world.h
      data[offset + 10] = world.i
      data[offset + 11] = 0
      data[offset + 12] = world.x
      data[offset + 13] = world.y
      data[offset + 14] = world.z
      data[offset + 15] = 1
    }

    // TODO: Use the entire dimensions of the texture to pack values
    this.boneTexture.height = this.bones.length
    this.boneTexture.data = data.buffer
    this.boneTexture.update()
  }
}

/**
 * @template {RawMaterial} [U = RawMaterial]
 */
export class MeshMaterial3D extends Object3D {
  /**
   * @type {Mesh}
   */
  mesh

  /**
   * @type {U}
   */
  material

  /**
   * @type {Skin | undefined}
   */
  skin

  /**
   * @param {Mesh} mesh 
   * @param {U} material 
   */
  constructor(mesh, material) {
    super()
    this.mesh = mesh
    this.material = material
  }

  /**
   * @override
   * @param {Map<Object3D, Object3D>} [entityMap]
   */
  clone(entityMap) {
    const newMesh = super.clone(entityMap)

    newMesh.mesh = this.mesh
    newMesh.material = this.material
    newMesh.skin = this.skin ? this.skin.clone() : undefined

    return newMesh
  }
}