import { Attribute, UBOs, VertexLayout, WebGLRenderPipeline } from "../core/index.js"
import { Geometry } from "../geometry/index.js"
import { Shader } from "../material/index.js"
import {
  GlDataType,
  PrimitiveTopology,
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
   * @param {import("../renderer/index.js").Caches} caches
   * @param {UBOs} ubos
   * @param {ReadonlyMap<string,Attribute>} attributes 
   * @param {Texture} defaultTexture
   * @param {ReadonlyMap<string,string>} includes
   * @param {ReadonlyMap<string,string>} globalDefines
   */
  renderGL(gl, caches,ubos, attributes, defaultTexture, includes, globalDefines) {
    const { meshes } = caches
    const { material, geometry, transform } = this
    const { indices } = geometry
    const pipeline = getRenderPipeline(gl, material, caches,ubos, attributes, includes, globalDefines)
    const drawMode = material.drawMode
    const modelInfo = pipeline.uniforms.get(UNI_MODEL_MAT)
    const modeldata = new Float32Array([...Affine3.toMatrix4(transform.world)])

    pipeline.use(gl)
    material.uploadUniforms(gl, caches.textures, pipeline.uniforms, defaultTexture)

    const mesh = meshes.get(geometry)

    if (mesh) {
      gl.bindVertexArray(mesh)

      // TODO: Implement autoupdate when mesh changes and
      // delete the old VAO and its buffers.
    } else {
      const newMesh = createVAO(gl, attributes, geometry)
      meshes.set(geometry, newMesh)
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

/**
 * @param {WebGL2RenderingContext} gl
 * @param {Shader} material
 * @param {import("../renderer/renderer.js").Caches} caches
 * @param {UBOs} ubos
 * @param {ReadonlyMap<string, Attribute>} attributes
 * @param {ReadonlyMap<string, string>} includes
 * @param {ReadonlyMap<string, string>} globalDefines
 */
function getRenderPipeline(gl, material, caches, ubos, attributes, includes, globalDefines) {
  //  TODO: Instead of just using the material as the key, use both mesh and material
  // properties to get the pipeline id.
  let materialCache = caches.material.get(material.constructor.name)

  if (!materialCache) {
    const newCache = new Map()

    materialCache = newCache
    caches.material.set(material.constructor.name, newCache)
  }

  const id = materialCache.get(material)

  let newId
  if (id) {
    const pipeline = caches.renderpipelines[id]

    if (pipeline) {
      if (material.changed) {
        pipeline.dispose(gl)
        newId = id
      } else {
        return pipeline
      }
    } else {
      newId = caches.renderpipelines.length
      materialCache.set(material, caches.renderpipelines.length)
    }
  }
  const preprocessedVertex = preprocessShader(material.vSrc, includes, [globalDefines, material.defines])
  const preprocessedFragment = preprocessShader(material.fSrc, includes, [globalDefines, material.defines])
  const newRenderPipeline = new WebGLRenderPipeline({
    context: gl,
    attributes,
    ubos,
    topology: PrimitiveTopology.Triangles,
    // TODO: Actually implement this to use the mesh
    vertexLayout: new VertexLayout(),
    vertex: preprocessedVertex,
    fragment: preprocessedFragment,
    blend: {
      source: material.srcBlendFunc,
      destination: material.distBlendFunc
    }
  })

  caches.renderpipelines[newId] = newRenderPipeline
  return newRenderPipeline
}

/**
 * @param {string} source
 * @param {ReadonlyMap<string,string>} includes 
 * @param {ReadonlyMap<string,string>[]} defines
 * @returns {string}
 */
function preprocessShader(source, includes, defines) {
  const version = "#version 300 es\n"
  const mergedDefines = defines.flatMap(map => [...map.entries()])
    .map(([name, value]) => `#define ${name} ${value}`)
    .join("\n")
  const preprocessed = source.replace(/#include <(.*?)>/g, (_, name) => {
    const include = includes.get(name)
    if (!include) {
      console.error(`Could not find the include "${name}"`)
    }
    return include || ""
  })
  return version + mergedDefines + preprocessed
}