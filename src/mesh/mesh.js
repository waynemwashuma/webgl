import { Attribute, UBOs } from "../core/index.js"
import { Geometry } from "../geometry/index.js"
import { Transform3D } from "../math/index.js"
import { Shader } from "../material/index.js"
import {
  UNI_MODEL_MAT
} from "../constant.js"

export class Mesh {
  transform = new Transform3D()
  parent = null

  /**
   * @type {Geometry}
   */
  geometry

  /**
   * @type {Shader}
   */
  material
  constructor(geometry, material) {
    this.geometry = geometry
    this.material = material
  }

  /**
   * 
   * @param {WebGL2RenderingContext} gl 
   * @param {UBOs} ubos
   * @param {Map<string,Attribute>} attributes 
   */
  init(gl, ubos, attributes) {
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
    const material = this.material
    const geometry = this.geometry
    const { attributes, indices } = geometry
    const drawMode = material.drawMode

    gl.blendFunc(material.srcBlendFunc, material.distBlendFunc)
    //preping uniforms and activating program
    material.activate(gl)
    gl.bindVertexArray(this.geometry.VAO)
    material.updateUniform(UNI_MODEL_MAT, this.transform.matrix)
    //drawing

    if (indices) {
      gl.drawElements(drawMode,
        indices.length,
        gl.UNSIGNED_SHORT, 0
      );
    } else {
      const position = attributes.get("position")
      gl.drawArrays(drawMode, 0, position.value.length / 3)
    }
    gl.bindVertexArray(null)
    material.deactivate(gl)
  }
}