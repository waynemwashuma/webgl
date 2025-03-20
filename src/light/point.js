import {
  Color,
  Vector3,
  Quaternion
} from '../math/index.js'

export class PointLight {
  color = new Color()
  direction = new Vector3()
  position = new Vector3()
  rotation = new Quaternion()
  falloffDistance = 1.0
  intensity = 1.0
}