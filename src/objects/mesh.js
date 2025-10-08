/**@import {PipelineKey} from '../material/index.js' */
import { Attribute, UBOs, VertexLayout, WebGLRenderPipeline, Shader } from "../core/index.js"
import { Mesh } from "../mesh/index.js"
import { Material } from "../material/index.js"
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
 * @template {Mesh} [T = Mesh]
 * @template {Material} [U = Material]
 */
export class MeshMaterial3D extends Object3D {
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
  renderGL(gl, caches, ubos, attributes, defaultTexture, includes, globalDefines) {
    const { meshes } = caches
    const { material, geometry, transform } = this
    const { indices } = geometry
    const meshBits = createPipelineBitsFromMesh(geometry)
    const pipelineKey = material.getPipelineKey(meshBits)
    const pipeline = getRenderPipeline(gl, material, pipelineKey, caches, ubos, attributes, includes, globalDefines)
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
      gl.drawElements(pipeline.topology,
        indices.length,
        mapToIndicesType(indices), 0
      )

    } else {
      const position = geometry.attributes.get(Attribute.Position.name)
      gl.drawArrays(pipeline.topology, 0, position.value.byteLength / (Attribute.Position.size * Float32Array.BYTES_PER_ELEMENT))
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
 * @param {Material} material
 * @param {PipelineKey} key
 * @param {import("../renderer/renderer.js").Caches} caches
 * @param {UBOs} ubos
 * @param {ReadonlyMap<string, Attribute>} attributes
 * @param {ReadonlyMap<string, string>} includes
 * @param {ReadonlyMap<string, string>} globalDefines
 */
function getRenderPipeline(gl, material, key, caches, ubos, attributes, includes, globalDefines) {
  let materialCache = caches.materials.get(material.constructor.name)

  if (!materialCache) {
    const newCache = new Map()

    materialCache = newCache
    caches.materials.set(material.constructor.name, newCache)
  }

  const id = materialCache.get(key)

  let newId
  if (id !== undefined && caches.renderpipelines[id]) {
    return caches.renderpipelines[id]
  } else {
    newId = caches.renderpipelines.length
    materialCache.set(key, newId)
  }
  const descriptor = {
    topology: topologyFromPipelineKey(key),
    // TODO: Actually implement this to use the mesh
    vertexLayout: new VertexLayout(),
    vertex: new Shader({
      source: material.vSrc
    }),
    fragment: new Shader({
      source: material.fSrc
    }),
    blend: {
      source: material.srcBlendFunc,
      destination: material.distBlendFunc
    }
  }

  for (const [name, value] of globalDefines) {
    descriptor.vertex.defines.set(name, value)
    descriptor.fragment.defines.set(name, value)
  }
  material.specialize(descriptor)
  const newRenderPipeline = new WebGLRenderPipeline(gl, ubos, attributes, includes, descriptor)

  caches.renderpipelines[newId] = newRenderPipeline
  return newRenderPipeline
}

// Reserved for the first 32 bits
// Note: Should we reserve it for this many bits?
/**
 * @enum {bigint}
 */
export const MeshKey = {
  TopologyBits: 0b1111111n,
  None: 0n,
  Points: 1n << 0n,
  Lines: 1n << 1n,
  LineLoop: 1n << 2n,
  LineStrip: 1n << 3n,
  Triangles: 1n << 4n,
  TriangleStrip: 1n << 5n,
  TriangleFan: 1n << 6n
}

/**
 * @param {PipelineKey} key 
 */
export function topologyFromPipelineKey(key) {
  if (key & MeshKey.Points) {
    return PrimitiveTopology.Points
  }
  if (key & MeshKey.Lines) {
    return PrimitiveTopology.Lines
  }
  if (key & MeshKey.LineLoop) {
    return PrimitiveTopology.LineLoop
  }
  if (key & MeshKey.LineStrip) {
    return PrimitiveTopology.LineStrip
  }
  if (key & MeshKey.Triangles) {
    return PrimitiveTopology.Triangles
  }
  if (key & MeshKey.TriangleStrip) {
    return PrimitiveTopology.TriangleStrip
  }
  if (key & MeshKey.TriangleFan) {
    return PrimitiveTopology.TriangleFan
  }

  return PrimitiveTopology.Triangles
}

/**
 * @param {Mesh} mesh 
 * @returns {bigint}
 */
export function keyFromTopology(mesh) {
  if (mesh.topology === PrimitiveTopology.Points) {
    return MeshKey.Points
  }
  if (mesh.topology === PrimitiveTopology.Lines) {
    return MeshKey.Lines
  }
  if (mesh.topology ===  PrimitiveTopology.LineLoop) {
    return MeshKey.LineLoop
  }
  if (mesh.topology ===  PrimitiveTopology.LineStrip) {
    return MeshKey.LineStrip
  }
  if (mesh.topology ===  PrimitiveTopology.Triangles) {
    return MeshKey.Triangles
  }
  if (mesh.topology ===  PrimitiveTopology.TriangleStrip) {
    return MeshKey.TriangleStrip
  }
  if (mesh.topology ===  PrimitiveTopology.TriangleFan) {
    return MeshKey.TriangleFan
  }

  return MeshKey.Triangles
}

/**
 * @param {Mesh} mesh
 * @returns {bigint}
 */
export function createPipelineBitsFromMesh(mesh) {
  let key = keyFromTopology(mesh)
  return key
}