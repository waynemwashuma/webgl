import {
  Color,
  Vector3,
  Transform3D
} from '../math/index.js'

export class SpotLight {
  transform = new Transform3D()
  intensity = 1.0
  color = new Color()
  direction = new Vector3()
}