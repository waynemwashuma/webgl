import { Color, Vector3 } from '../math/index.js'
import { Object3D } from '../objects/object3d.js'

export class SpotLight extends Object3D {
  intensity = 1.0
  color = new Color()
  range = 1.0
  decay = 2.0
  innerAngle = 0
  outerAngle = Math.PI / 2

  pack() {
    const direction = this.transform.world.transformWithoutTranslation(
      new Vector3(0, 0, -1)
    )
    const halfInnerAngle = this.innerAngle / 2
    const HalfOuterAngle = this.outerAngle / 2

    return [
      ...this.color,
      this.transform.world.x,
      this.transform.world.y,
      this.transform.world.z,
      0,
      ...direction,
      this.intensity,
      this.range,
      this.decay,
      Math.cos(Math.min(halfInnerAngle, HalfOuterAngle)),
      Math.cos(HalfOuterAngle)
    ]
  }
}