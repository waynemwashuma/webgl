import { Shader } from "./shader.js"
import { Color, Vector3 } from "../math/index.js"
import { basicVertex, phongFragment } from "../shader/index.js"

export class PhongMaterial extends Shader {
  constructor(options) {
    let {
      color = new Color(1, 1, 1),
        mainTexture = null,
        specularStrength = 0.5,
        specularShininess = 32,
    } = options
    
    super(basicVertex, phongFragment, {
      color,
      mainTexture,
      specularShininess,
      specularStrength
    })
    if (mainTexture) this.setUniform("mainTexture", mainTexture)
  }
}