import {
  Color,
  Vector3,
  Transform3D
} from '../math/index.js'

export class SpotLight {
  intensity = 1.0
  color = new Color()
  direction = new Vector3()
  position = new Vector3()
  rotation = new Quaternion()
}