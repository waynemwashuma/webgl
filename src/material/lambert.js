import { Shader } from "./shader.js"
import { Color,Vector3 } from "../math/index.js"
import { basicVertex, lambertFragment } from "../shader/index.js"

export class LambertMaterial extends Shader {
  constructor(options) {
    let {
    mainTexture = null,
    color = new Color(1, 1, 1)
  } = options

    super(basicVertex, lambertFragment, {
      color,
      mainTexture
    })
  }
}