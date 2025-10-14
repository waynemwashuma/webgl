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

  /**
   * @param {Transform3D} other
   */
  copy(other){
    this.position.copy(other.position)
    this.orientation.copy(other.orientation)
    this.scale.copy(other.scale)
    this.world.copy(other.world)

    return this
  }
  clone(){
    return new Transform3D().copy(this)
  }
}