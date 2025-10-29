/**@import { Brand } from '../utils/index.js' */
/**@import { Caches, WebGLRenderer } from '../renderer/index.js' */
/**@import { WebGLRenderPipelineDescriptor } from '../core/index.js' */

import { Attribute, Shader, Uniform } from "../core/index.js"
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
import { updateTextureSampler } from "../function.js"
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
   * @type {Skin | undefined}
   */
  skin

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
    newMesh.skin = this.skin ? this.skin.clone() : undefined

    return newMesh
  }

  /**
   * @param {WebGL2RenderingContext} gl
   * @param {WebGLRenderer} renderer
   */
  renderGL(gl, renderer) {
    const { caches, attributes, defaultTexture } = renderer
    const { material, geometry, transform } = this
    const name = material.constructor.name
    const blockName = material.constructor.name + 'Block'

    const materialData = material.getData()
    const gpuMesh = caches.getMesh(gl, geometry, attributes)
    const meshLayout = caches.getMeshVertexLayout(gpuMesh.layoutHash)
    const meshBits = createPipelineBitsFromMesh(geometry, this)
    const materialBits = material.getPipelineKey()
    const pipelineKey = createPipelineKey(meshBits, materialBits)
    const pipeline = caches.getMaterialRenderPipeline(gl, material, pipelineKey, () => {
      const { defines, includes } = renderer
      /**
       * @type {WebGLRenderPipelineDescriptor}
       */
      const descriptor = {
        topology: geometry.topology,
        // TODO: Actually implement this to use the mesh
        vertexLayout: meshLayout,
        vertex: new Shader({
          source: material.vertex()
        }),
        fragment: {
          source: new Shader({
            source: material.fragment()
          }),
          targets: [{
            format: TextureFormat.RGBA8Unorm,
            blend: material instanceof Material ? material.blend : undefined
          }]
        }
      }

      if (pipelineKey & MeshKey.Skinned) {
        descriptor.vertex.defines.set("SKINNED", "")
        descriptor.fragment?.source?.defines?.set("SKINNED", "")
      }

      for (const [name, value] of defines) {
        descriptor.vertex.defines.set(name, value)
        descriptor.fragment?.source?.defines?.set(name, value)
      }

      for (const [name, value] of includes) {
        descriptor.vertex.includes.set(name, value)
        descriptor.fragment?.source?.includes?.set(name, value)
      }

      material.specialize(descriptor)

      return descriptor
    })
    const modelInfo = pipeline.uniforms.get(UNI_MODEL_MAT)
    const boneMatricesInfo = pipeline.uniforms.get("bone_transforms")
    const modeldata = new Float32Array([...Affine3.toMatrix4(transform.world)])
    const ubo = caches.uniformBuffers.get(blockName)

    pipeline.use(gl)

    if (!ubo) {
      return console.warn(`No material uniform buffer \`${blockName}\` set for ${name}`)
    }
    ubo.update(gl, materialData)
    uploadTextures(gl, material, pipeline.uniforms, caches, defaultTexture)

    if (boneMatricesInfo && boneMatricesInfo.texture_unit !== undefined && this.skin) {
      gl.activeTexture(gl.TEXTURE0 + boneMatricesInfo.texture_unit)

      this.skin.bindMatrix.copy(this.transform.world)
      this.skin.inverseBindMatrix.copy(this.skin.bindMatrix).invert()
      this.skin.updateTexture()
      const texture = caches.getTexture(gl, this.skin.boneTexture)

      gl.bindTexture(this.skin.boneTexture.type, texture)
    }

    if (modelInfo) {
      gl.uniformMatrix4fv(modelInfo.location, false, modeldata)
    }

    //drawing
    gl.bindVertexArray(gpuMesh.object)
    if (gpuMesh.indexType !== undefined) {
      gl.drawElements(pipeline.topology,
        gpuMesh.count,
        gpuMesh.indexType, 0
      )
    } else {
      gl.drawArrays(pipeline.topology, 0, gpuMesh.count)
    }
  }
}

// Reserved for the first 32 bits
// Note: Should we reserve it for this many bits?
/**
 * @enum {bigint}
 */
export const MeshKey = /**@type {const}*/({
  TopologyBits: 0b1111111n,
  None: 0n,
  Points: 1n << 0n,
  Lines: 1n << 1n,
  LineLoop: 1n << 2n,
  LineStrip: 1n << 3n,
  Triangles: 1n << 4n,
  TriangleStrip: 1n << 5n,
  TriangleFan: 1n << 6n,
  Skinned: 1n << 7n
})

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
 * @param {MeshMaterial3D} object
 * @returns {bigint}
 */
function createPipelineBitsFromMesh(mesh, object) {
  let key = keyFromTopology(mesh)

  if (
    mesh.attributes.has(Attribute.JointIndex.name) &&
    mesh.attributes.has(Attribute.JointWeight.name) &&
    object.skin
  ) {
    key |= MeshKey.Skinned
  }
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
    const [name, _, texture = defaultTexture, sampler = texture.defaultSampler] = textures[i]
    const textureInfo = uniforms.get(name)

    if (textureInfo && textureInfo.texture_unit !== undefined) {
      const gpuTexture = caches.getTexture(gl, texture)

      gl.activeTexture(gl.TEXTURE0 + textureInfo.texture_unit)
      gl.bindTexture(texture.type, gpuTexture)
      updateTextureSampler(gl, texture, sampler)
    }
  }
}

/**
 * @enum {bigint}
 */
export const GeneralPipelineKeyShiftBits = /**@type {const}*/({
  MeshBits: 0n,
  MaterialBits: 31n
})
/**
 * @param {bigint} meshBits
 * @param {bigint} materialBits
 */
function createPipelineKey(meshBits, materialBits) {
  return /**@type {PipelineKey}*/(
    meshBits |
    (materialBits << GeneralPipelineKeyShiftBits.MaterialBits)
  )
}

/**
 * @typedef {Brand<bigint,"PipelineKey">} PipelineKey
 */