import { Transform3D } from "../math/index.js"
import { UBO } from "../core/index.js"
import {
  UNI_CAM_MAT,
  UNI_PROJ_MAT,
  UNI_MODEL_MAT,
  ATTR_POSITION_NAME
} from "../constant.js"

export class Mesh {
  transform = new Transform3D()
  parent = null
  constructor(geometry, material) {
    this.geometry = geometry
    this.material = material
  }
  init(gl) {
    this.material.setUniform(UNI_MODEL_MAT, this.transform.matrix)
    this.material.init(gl)
    this.geometry.init(gl, this.material.program)
  }
  update() {
    this.transform.updateMatrix(this.parent?.transform)
  }
  /**
   * @param {WebGL2RenderingContext} gl
   * @param {Record<string,UBO>} ubos
   */
  renderGL(gl, ubos) {
    let material = this.material
    let geometry = this.geometry
    let attributes = geometry.attributes
    let drawMode = material.drawMode

    for (const name in ubos) {
      const ubo = ubos[name]
      
      // This should happen during initialization time, not per frame.
      this.material.prepareUBO(gl,name,ubo)
    }

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