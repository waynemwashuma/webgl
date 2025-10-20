/**@import { PipelineKey } from '../material/index.js' */
/**@import { Caches } from '../renderer/index.js' */
/**@import { WebGLRenderPipelineDescriptor } from '../core/index.js' */
import { Attribute, UBOs, VertexLayout, WebGLRenderPipeline, Shader, Uniform } from "../core/index.js"
import { Mesh } from "../mesh/index.js"
import {
  GlDataType,
  TextureFormat,
  PrimitiveTopology,
  TextureType,
  UNI_MODEL_MAT
} from "../constant.js"
import { Texture } from "../texture/index.js"
import { Object3D } from "./object3d.js"
import { Affine3 } from "../math/index.js"
import { createTexture, createVAO, updateTextureData, updateTextureSampler } from "../function.js"
import { Material, RawMaterial } from "../material/index.js"
import { Bone3D } from "./bone.js";

export class Skin {

  // NOTE: Maybe this should not be here but available globally?
  /**
   * @type {Texture}
   */
  boneTexture = new Texture({
    type: TextureType.Texture2D,
    data: new Uint8Array([0, 0, 0, 0]).buffer,
    width: 4,
    height: 0,
    format: TextureFormat.RGBA32Float,
    generateMipmaps: false,
  })

  /**
   * @type {Affine3}
   */
  bindMatrix = Affine3.identity()

  /**
   * @type {Affine3}
   */
  inverseBindMatrix = Affine3.identity()

  /**
   * @type {Bone3D[]}
   */
  bones = []

  /**
   * @type {Affine3[]}
   */
  inverseBindPose = []

  constructor() { }

  clone() {
    const skin = new Skin()
    skin.inverseBindPose = this.inverseBindPose
    skin.bones = this.bones.slice()
    return skin
  }

  setBindPose() {
    for (let i = 0; i < this.inverseBindPose.length; i++) {
      const element = this.inverseBindPose[i] || new Affine3();

      element.copy(this.bones[i].transform.world).invert()
      this.inverseBindPose[i] = element
    }
  }

  updateTexture() {
    const { bones, inverseBindPose } = this
    const data = new Float32Array(this.bones.length * 16)

    for (let i = 0; i < this.bones.length; i++) {
      const offset = i * 16
      const world = Affine3.multiply(
        bones[i].transform.world,
        inverseBindPose[i]
      )/**/

      // PERF: Remove last row as it is always constant
      data[offset + 0] = world.a
      data[offset + 1] = world.b
      data[offset + 2] = world.c
      data[offset + 3] = 0
      data[offset + 4] = world.d
      data[offset + 5] = world.e
      data[offset + 6] = world.f
      data[offset + 7] = 0
      data[offset + 8] = world.g
      data[offset + 9] = world.h
      data[offset + 10] = world.i
      data[offset + 11] = 0
      data[offset + 12] = world.x
      data[offset + 13] = world.y
      data[offset + 14] = world.z
      data[offset + 15] = 1
    }

    // TODO: Use the entire dimensions of the texture to pack values
    this.boneTexture.height = this.bones.length
    this.boneTexture.data = data.buffer
    this.boneTexture.update()
  }
}

/**
 * @template {Mesh} [T = Mesh]
 * @template {RawMaterial} [U = RawMaterial]
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

  clone(entityMap) {
    const newMesh = super.clone(entityMap)

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
    const name = material.constructor.name
    const blockName = material.constructor.name + 'Block'

    const materialData = material.getData()
    const { indices } = geometry
    const gpuMesh = meshes.get(geometry)
    const meshBits = createPipelineBitsFromMesh(geometry)
    const pipelineKey = material.getPipelineKey(meshBits)
    const pipeline = getRenderPipeline(gl, material, pipelineKey, caches, ubos, attributes, includes, globalDefines)
    const modelInfo = pipeline.uniforms.get(UNI_MODEL_MAT)
    const modeldata = new Float32Array([...Affine3.toMatrix4(transform.world)])
    const ubo = ubos.get(blockName)

    pipeline.use(gl)

    if (!ubo) {
      return console.warn(`No material uniform buffer \`${blockName}\` set for ${name}`)
    }
    ubo.update(gl, materialData)
    uploadTextures(gl, material, pipeline.uniforms, caches, defaultTexture)

    if (gpuMesh) {
      gl.bindVertexArray(gpuMesh)

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
 * @param {RawMaterial} material
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

  let blend
  if(material instanceof Material){
    blend = material.blend
  }

  /**
   * @type {WebGLRenderPipelineDescriptor}
   */
  const descriptor = {
    topology: topologyFromPipelineKey(key),
    // TODO: Actually implement this to use the mesh
    vertexLayout: new VertexLayout(),
    vertex: new Shader({
      source: material.vertex()
    }),
    fragment: {
      source: new Shader({
        source: material.fragment()
      }),
      targets:[{
        format: TextureFormat.RGBA8Unorm
      }]
    }
  }
  for(const [name, value] of globalDefines) {
      descriptor.vertex.defines.set(name, value)
      descriptor.fragment.source.defines.set(name, value)
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
    LastBit: 31n,
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
    if (mesh.topology === PrimitiveTopology.LineLoop) {
      return MeshKey.LineLoop
    }
    if (mesh.topology === PrimitiveTopology.LineStrip) {
      return MeshKey.LineStrip
    }
    if (mesh.topology === PrimitiveTopology.Triangles) {
      return MeshKey.Triangles
    }
    if (mesh.topology === PrimitiveTopology.TriangleStrip) {
      return MeshKey.TriangleStrip
    }
    if (mesh.topology === PrimitiveTopology.TriangleFan) {
      return MeshKey.TriangleFan
    }

    return MeshKey.Triangles
  }

  /**
   * @param {Mesh} mesh
   * @returns {bigint}
   */
  function createPipelineBitsFromMesh(mesh) {
    let key = keyFromTopology(mesh)
    return key
  }

  /**
   * @template {RawMaterial} T
   * @param {WebGL2RenderingContext} gl
   * @param {T} material 
   * @param {ReadonlyMap<string, Uniform>} uniforms
   * @param {Caches} caches
   * @param {Texture} defaultTexture
   */
  function uploadTextures(gl, material, uniforms, caches, defaultTexture) {
    const textures = material.getTextures()

    for (let i = 0; i < textures.length; i++) {
      const [name, location, texture = defaultTexture, sampler = texture.defaultSampler] = textures[i]
      const textureInfo = uniforms.get(name)
      const gpuTexture = getWebglTexture(gl, texture, caches.textures)

      if (textureInfo) {
        gl.activeTexture(gl.TEXTURE0 + location)
        gl.bindTexture(texture.type, gpuTexture)
        gl.uniform1i(textureInfo.location, location)

        updateTextureSampler(gl, texture, sampler)
      }
    }
  }

  /**
   * @param {WebGL2RenderingContext} gl
   * @param {Texture} texture
   * @param {Map<Texture,WebGLTexture>} cache
   * @returns {WebGLTexture}
   */
  function getWebglTexture(gl, texture, cache) {
    const tex = cache.get(texture)

    if (tex) {
      if (texture.changed) {
        gl.bindTexture(texture.type, tex)
        updateTextureData(gl, texture)
      }
      return tex
    }
    const newTex = createTexture(gl, texture)
    cache.set(texture, newTex)
    return newTex
  }