import { Color, Vector3 } from '../math/index.js'
import { Object3D } from '../objects/index.js'

export class DirectionalLight extends Object3D {
  intensity = 1.0
  color = new Color()
  direction = new Vector3(0, 0, 1)

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