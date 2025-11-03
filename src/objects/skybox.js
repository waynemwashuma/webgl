import { CuboidMeshBuilder } from "../mesh/index.js"
import { MeshMaterial3D } from "./mesh.js"
import { SkyBoxMaterial } from "../material/skybox.js"
import { Texture } from "../texture/index.js"

/**
 * @extends {MeshMaterial3D<SkyBoxMaterial>}
 */
export class SkyBox extends MeshMaterial3D {
  constructor(options = {}) {
    const cuboid = new CuboidMeshBuilder()
    cuboid.width = 10
    cuboid.height = 10
    cuboid.depth = 10
    super(cuboid.build(), new SkyBoxMaterial(options))
  }

  /**
   * @param {number} value
   */
  set lerp(value){
    this.material.lerp = value
  }

  /**
   * @param {Texture} value
   */
  set day(value){
    this.material.day = value
  }

  /**
   * @param {Texture} value
   */
  set night(value){
    this.material.night = value
  }
}