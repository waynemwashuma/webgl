import {
  Color,
  Vector3,
  Transform3D
} from '../math/index.js'

export class DirectionalLight {
  transform = new Transform3D()
  intensity = 1.0
  color = new Color()
  direction = new Vector3()
  
  /**
   */
  pack(offset, array) {
    const element = new Float32Array([
      ...this.transform.matrix,
      this.intensity,
      0,
      0,
      0,
      ...this.color,
      ...this.direction,
      0
    ])
    
    for (let i = 0; i < element.length; i++) {
      array[i + offset] = element[i]
    }
  }
}