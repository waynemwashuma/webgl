import { Vector3, Quaternion, Affine3 } from "../../libs/wimaMath/index.js"

export class Transform3D {
  constructor() {
    this.world = new Affine3()
    this.position = new Vector3()
    this.orientation = new Quaternion()
    this.scale = new Vector3(1, 1, 1)
  }
  /**
   * @param {Transform3D} [parent]
   */
  updateMatrix(parent) {
    this.world.compose(
      this.position,
      this.orientation,
      this.scale
    )
    if(parent){
      Affine3.multiply(parent.world,this.world,this.world)
    }
  }

  clone(){
    const newTransform = new /**@type {new (...args:[])=> this} */(this.constructor)()
    newTransform.position = this.position.clone()
    newTransform.orientation = this.orientation.clone()
    newTransform.scale = this.scale.clone()
    newTransform.world = this.world.clone()
    return newTransform
  }
}