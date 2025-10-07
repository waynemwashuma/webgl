import { Attribute, UBOs } from "../core/index.js"
import { Geometry } from "../geometry/index.js"
import { Shader } from "../material/index.js"
import {
  GlDataType,
  UNI_MODEL_MAT
} from "../constant.js"
import { Texture } from "../texture/index.js"
import { Object3D } from "./object3d.js"
import { Affine3 } from "../math/index.js"
import { createVAO } from "../function.js"

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

  clone() {
    const newMesh = super.clone()

    newMesh.geometry = this.geometry
    newMesh.material = this.material
    return newMesh
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

      return true
    })
  }

  /**
   * @param {WebGL2RenderingContext} gl
   * @param {import("../renderer/index.js").Caches} caches
   * @param {ReadonlyMap<string,Attribute>} attributes 
   * @param {Texture} defaultTexture
   */
  renderGL(gl, caches, attributes, defaultTexture) {
    const { meshes } = caches
    const { material, geometry, transform } = this
    const { indices } = geometry
    const drawMode = material.drawMode
    const modelInfo = material.uniforms.get(UNI_MODEL_MAT)
    const modeldata = new Float32Array([...Affine3.toMatrix4(transform.world)])

    gl.blendFunc(material.srcBlendFunc, material.distBlendFunc)
    //preping uniforms and activating program

    material.activate(gl)
    material.uploadUniforms(gl,caches.textures,defaultTexture)

    const mesh = meshes.get(geometry)

    if (mesh) {
      gl.bindVertexArray(mesh)

      // TODO: Implement autoupdate when mesh changes and
      // delete the old VAO and its buffers.
    } else {
      const newMesh = createVAO(gl, attributes, geometry)
      meshes.set(geometry,newMesh)
      gl.bindVertexArray(newMesh)
    }

    gl.uniformMatrix4fv(modelInfo.location, false, modeldata)

    //drawing
    if (indices) {
      gl.drawElements(drawMode,
        indices.length,
        mapToIndicesType(indices), 0
      );

    } else {
      const position = geometry.attributes.get(Attribute.Position.name)
      gl.drawArrays(drawMode, 0, position.value.byteLength / (Attribute.Position.size * Float32Array.BYTES_PER_ELEMENT))
    }
    gl.bindVertexArray(null)
    material.deactivate(gl)
  }
}

/**
 * @param {Uint8Array | Uint16Array | Uint32Array} indices
 */
function mapToIndicesType(indices) {
  if (indices instanceof Uint8Array) {
    return GlDataType.UnsignedByte
  }
  if (indices instanceof Uint16Array) {
    return GlDataType.UnsignedShort
  }
  if (indices instanceof Uint32Array) {
    return GlDataType.UnsignedInt
  }
  throw "This is unreachable!"
}