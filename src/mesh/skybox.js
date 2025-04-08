import { Transform3D } from "../math/index.js"
import {
  UNI_MODEL_MAT,
  ATTR_POSITION_NAME,
  CullFace
} from "../constant.js"
import { BoxGeometry } from "../geometry/index.js"
import { Shader } from "../material/shader.js"
import { skyboxFragment, skyboxVertex } from "../shader/index.js"

export class SkyBox {
  transform = new Transform3D()
  parent = null
  constructor({night, day, lerp = 0}) {
    this.geometry = new BoxGeometry()
    console.log(this.geometry);
    
    this.material = new Shader(skyboxVertex,skyboxFragment,{
      day,
      night,
      lerp
    })
    this.material.cullFace = CullFace.FRONT
  }
  init(gl, ubos) {
    this.transform.scale.multiplyScalar(10)
    this.material.setUniform(UNI_MODEL_MAT, this.transform.matrix)
    this.material.init(gl, ubos)
    this.geometry.init(gl)
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
    let attributes = geometry.attributes
    let drawMode = material.drawMode

    gl.blendFunc(material.srcBlendFunc, material.distBlendFunc)
    //preping uniforms and activating program
    material.activate(gl)
    gl.bindVertexArray(this.geometry.VAO)
    material.updateUniform(UNI_MODEL_MAT, this.transform.matrix)
    //drawing

    if (attributes.indices) {
      gl.drawElements(drawMode,
        attributes["indices"].count,
        gl.UNSIGNED_SHORT, 0
      );
    } else {
      gl.drawArrays(drawMode, 0,
        attributes[ATTR_POSITION_NAME].count
      )
    }
    gl.bindVertexArray(null)
    material.deactivate(gl)
  }
}