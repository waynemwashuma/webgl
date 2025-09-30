import { Shader } from "./shader.js"
import { Color } from "../math/index.js"
import { basicVertex, basicFragment } from "../shader/index.js"

export class BasicMaterial extends Shader {
  constructor(options = {}) {
    let {
      color = new Color(1, 1, 1),
      mainTexture = null
    } = options

    super(basicVertex, basicFragment, {
      color,
      mainTexture
    })
  }
}