import {
  Color,
} from '../math/index.js'

export class AmbientLight {
  intensity = 1
  color = new Color(1, 1, 1)

  getData() {
    return {
      name: "AmbientLightBlock",
      data: new Float32Array([
      this.intensity,
      0,
      0,
      0,
      ...this.color
    ]).buffer
    }
  }
}