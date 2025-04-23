import { Matrix4 } from "./matrix4.js"
import { Vector3 } from "./vector3.js"
import { Quaternion } from "./quaternion.js"

let _position = new Vector3()
let _rotation = new Vector3()
let _scale = new Vector3()
let _quat = new Quaternion()
export class Transform3D {
  constructor() {
    this.matrix = new Matrix4()
    this.position = new Vector3()
    this.orientation = new Quaternion()
    this.scale = new Vector3(1, 1, 1)
    this.worldPosition = new Vector3()
    this.worldOrientation = new Quaternion()
    this.worldScale = new Vector3(1,1,1)
  }
  /**
   * @param {Transform3D} parent
   */
  updateMatrix(parent) {
    this.worldPosition.copy(this.position)
    this.worldOrientation.copy(this.orientation)
    this.worldScale.copy(this.scale)
    if (parent !== void 0) {
      this.worldScale
        .multiply(parent.worldScale)
      this.worldOrientation
       .multiply(parent.worldOrientation)
       
      this.worldPosition
        .multiply(parent.worldScale)
        .applyQuaternion(parent.orientation)
        .add(parent.worldPosition)
    }
    
    this.matrix.compose(
      this.worldPosition,
      this.worldOrientation,
      this.worldScale
    )
  }
}