import { Shader } from "./shader.js"
import { Color } from "../math/index.js"
import { basicVertex, basicFragment } from "../shader/index.js"
import { Texture } from "../texture/index.js"

export class BasicMaterial extends Shader {

  /**
   * @type {Color}
   */
  color

  /**
   * @type {Texture}
   */
  mainTexture
  constructor({
    color = new Color(1, 1, 1),
    mainTexture = undefined
  } = {}) {
    super(basicVertex, basicFragment)

    this.color = color
    this.mainTexture = mainTexture
  }

  /**
   * 
   * @param {WebGL2RenderingContext} gl 
   * @param {WebGLTexture} defaultTexture 
   */
  uploadUniforms(gl,defaultTexture){
    const { color, mainTexture } = this
    const colorInfo = this.uniforms.get("color")
    const mainTextureInfo = this.uniforms.get("mainTexture")

    if(colorInfo) {
      gl.uniform4f(colorInfo.location, color.r,color.g,color.b,color.a)
    }
    if(mainTextureInfo) {
      if(mainTexture){
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, mainTexture.webglTex)
        gl.uniform1i(mainTextureInfo.location, 0)
      }else {
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, defaultTexture)
        gl.uniform1i(mainTextureInfo.location, 0)
      }
    }
  }
}