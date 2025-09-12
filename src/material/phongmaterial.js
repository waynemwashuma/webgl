import { Shader } from "./shader.js"
import { Color, Vector3 } from "../Math/index.js"
import { basicVertex, phongFragment } from "../shader/index.js"

export class PhongMaterial extends Shader {
  constructor(options) {
    let {
      color = new Color(1, 1, 1),
        opacity = 1.0,
        mains,
        mainTexture = null,
        lightDir = new Vector3(0, 0, -1),

        ambientColor = new Color(1, 1, 1),
        ambientIntensity = 0.15,

        diffuseColor = new Color(1, 1, 1),
        diffuseIntensity = 0.65,

        specularStrength = 0.15,
        specularShininess = 4,
    } = options

    super(basicVertex, phongFragment, {
      color,
      mains,
      ambientColor,
      ambientIntensity,
      opacity,
      lightDir,
      diffuseColor,
      diffuseIntensity,
      specularShininess,
      specularStrength
    })
    if (mainTexture) this.setUniform("mainTexture", mainTexture)
  }
}