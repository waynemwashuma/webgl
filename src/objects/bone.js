import { Object3D } from "./object3d.js";

export class Bone3D extends Object3D {
  index = -1
  clone(entityMap){
    const clone = super.clone(entityMap)

    clone.index = this.index
    
    return clone
  }
}