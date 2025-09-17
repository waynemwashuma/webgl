import { Shader } from "./shader.js"
import { Color,Vector3 } from "../Math/index.js"
import { basicVertex, lambertFragment } from "../shader/index.js"

export class LambertMaterial extends Shader {
  constructor(options) {
    let {
    mainTexture= null,
    color= new Color(1, 1, 1),
    opacity= 1.0,
    lightDir= new Vector3(0, 0, -1),
    lightColor=new Color(1,1,1),
    diffuseIntensity=0.65
  } = options

    super(basicVertex, lambertFragment, {
      color,
      opacity,
      lightDir,
      lightColor,
      diffuseIntensity
    })
    if(mainTexture)this.setUniform("mainTexture",mainTexture)
  }
}