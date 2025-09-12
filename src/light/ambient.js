import {
  Color,
  Vector3,
  Transform3D
} from '../math/index.js'

export class AmbientLight {
  intensity = 1.0
  color = new Color(1, 1, 0)
  
  getLayout() {
    return {
      name:"AmbientLight",
      size:32
    }
  }
  getData() {
    return {
      name:"AmbientLight",
      data:new Float32Array([
      this.intensity,
      0,
      0,
      0,
      ...this.color
    ]).buffer
    }
  }
}