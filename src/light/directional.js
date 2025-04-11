import {
  Color,
  Vector3,
  Transform3D
} from '../math/index.js'

export class DirectionalLight {
  transform = new Transform3D()
  intensity = 1.0
  color = new Color()
  direction = new Vector3(0,0,1)
  
  update() {
    this.transform.updateMatrix(this.parent?.transform)
  }
  
  /**
   */
  pack() {
    const direction = this.direction.clone()
    
    return [
      ...this.color,
      ...direction,
      this.intensity,
    ]
  }
}