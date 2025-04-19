import { Transform3D } from "../math/index.js"
import {
  UNI_MODEL_MAT,
  CullFace
} from "../constant.js"
import { BoxGeometry } from "../geometry/index.js"
import { Shader } from "../material/index.js"
import { skyboxFragment, skyboxVertex } from "../shader/index.js"
import { Attribute, UBOs } from "../core/index.js"

export class SkyBox {
  transform = new Transform3D()
  parent = null
  constructor({night, day, lerp = 0}) {
    this.geometry = new BoxGeometry()
    
    this.material = new Shader(skyboxVertex,skyboxFragment,{
      day,
      night,
      lerp
    })
    this.material.cullFace = CullFace.FRONT
  }
  /**
   * @param {WebGL2RenderingContext} gl
   * @param {UBOs} ubos
   * @param {Map<string, Attribute>} attributes
   */
  init(gl, ubos, attributes) {
    this.transform.scale.multiplyScalar(10)
    this.material.setUniform(UNI_MODEL_MAT, this.transform.matrix)
    this.material.init(gl, ubos, attributes)
    this.geometry.init(gl, attributes)
  }
  update() {
    this.transform.updateMatrix(this.parent?.transform)
  }
  /**
   * @param {WebGL2RenderingContext} gl
   */
  renderGL(gl) {
    let material = this.material
    let geometry = this.geometry
    let {attributes, indices} = geometry
    let drawMode = material.drawMode

    gl.blendFunc(material.srcBlendFunc, material.distBlendFunc)
    //preping uniforms and activating program
    material.activate(gl)
    gl.bindVertexArray(this.geometry.VAO)
    material.updateUniform(UNI_MODEL_MAT, this.transform.matrix)

    if (indices) {
      gl.drawElements(drawMode,
        indices.length,
        gl.UNSIGNED_SHORT, 0
      );
    }
    gl.bindVertexArray(null)
    material.deactivate(gl)
  }
}