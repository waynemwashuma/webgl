import { Attribute, UBOs } from "../core/index.js"
import { Geometry } from "../geometry/index.js"
import { Shader } from "../material/index.js"
import {
  UNI_MODEL_MAT
} from "../constant.js"
import { Texture } from "../texture/index.js"
import { Object3D } from "./object3d.js"
import { Affine3 } from "../math/index.js"

/**
 * @template {Geometry} [T = Geometry]
 * @template {Shader} [U = Shader]
 */
export class Mesh extends Object3D {
  /**
   * @type {T}
   */
  geometry

  /**
   * @type {U}
   */
  material

  /**
   * @param {T} geometry 
   * @param {U} material 
   */
  constructor(geometry, material) {
    super()
    this.geometry = geometry
    this.material = material
  }

  /**
   * @param {WebGL2RenderingContext} gl 
   * @param {UBOs} ubos
   * @param {ReadonlyMap<string,Attribute>} attributes
   * @param {ReadonlyMap<string,string>} includes
   * @param {ReadonlyMap<string,string>} globalDefines
   */
  init(gl, ubos, attributes, includes, globalDefines) {
    this.traverseDFS((object) => {
      if (!(object instanceof Mesh)) return

      const { material, geometry } = object

      material.init(gl, ubos, attributes, includes, globalDefines)
      geometry.init(gl, attributes)

      return true
    })
  }

  /**
   * @param {WebGL2RenderingContext} gl
   * @param {Texture} defaultTexture 
   */
  renderGL(gl, defaultTexture) {
    this.traverseDFS((object) => {
      if (!(object instanceof Mesh)) return
      
      const { material, geometry, transform } = object
      const { attributes, indices } = geometry
      const drawMode = material.drawMode
      const modelInfo = material.uniforms.get(UNI_MODEL_MAT)
      const modeldata = new Float32Array([...Affine3.toMatrix4(transform.world)])
      gl.blendFunc(material.srcBlendFunc, material.distBlendFunc)
      //preping uniforms and activating program

      material.activate(gl, defaultTexture)
      gl.bindVertexArray(geometry.VAO)

      gl.uniformMatrix4fv(modelInfo.location, false, modeldata)

      //drawing
      if (indices) {
        gl.drawElements(drawMode,
          indices.length,
          gl.UNSIGNED_SHORT, 0
        );

      } else {
        const position = attributes.get(Attribute.Position.name)
        gl.drawArrays(drawMode, 0, position.value.length / 3)
      }
      gl.bindVertexArray(null)
      material.deactivate(gl)
      return true
    })
  }
}