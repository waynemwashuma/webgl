import { Attribute, UBOs } from "../core/index.js"
import { Geometry } from "../geometry/index.js"
import { Transform3D } from "../math/index.js"
import { Shader } from "../material/index.js"
import {
  UNI_MODEL_MAT
} from "../constant.js"
import { Texture } from "../texture/index.js"

/**
 * @template {Geometry} [T = Geometry]
 * @template {Shader} [U = Shader]
 */
export class Mesh {
  transform = new Transform3D()
  parent = null

  /**
   * @type {T}
   */
  geometry

  /**
   * @type {U}
   */
  material

  /**
   * 
   * @param {T} geometry 
   * @param {U} material 
   */
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
    this.material.init(gl, ubos, attributes)
    this.geometry.init(gl, attributes)
  }
  update() {
    this.transform.updateMatrix(this.parent?.transform)
  }
  /**
   * @param {WebGL2RenderingContext} gl
   * @param {Texture} defaultTexture 
   */
  renderGL(gl, defaultTexture) {
    const material = this.material
    const geometry = this.geometry
    const { attributes, indices } = geometry
    const drawMode = material.drawMode
    const modelInfo = material.uniforms.get(UNI_MODEL_MAT)
    const modeldata = new Float32Array([...this.transform.matrix])
    gl.blendFunc(material.srcBlendFunc, material.distBlendFunc)
    //preping uniforms and activating program
    
    material.activate(gl, defaultTexture)
    gl.bindVertexArray(this.geometry.VAO)
    console.log(gl.getError());
    
    gl.uniformMatrix4fv(modelInfo.location, false, modeldata)

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