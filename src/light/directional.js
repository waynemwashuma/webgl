import { Color, Vector3 } from '../math/index.js'
import { Object3D } from '../objects/index.js'

export class DirectionalLight extends Object3D {
  intensity = 1.0
  color = new Color()

  /**
   */
  pack() {
    const direction = this.transform.world.transformWithoutTranslation(new Vector3(0, 0, -1))

    return [
      ...this.color,
      ...direction,
      this.intensity,
    ]
  }
}