import { BoxGeometry } from "../mesh/index.js"
import { MeshMaterial3D } from "./mesh.js"
import { SkyBoxMaterial } from "../material/skybox.js"
import { Texture } from "../texture/index.js"

/**
 * @extends {MeshMaterial3D<SkyBoxMaterial>}
 */
export class SkyBox extends MeshMaterial3D {
  constructor(options = {}) {
    super(new BoxGeometry(10,10,10), new SkyBoxMaterial(options))
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