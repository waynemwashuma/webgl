/**@import { Brand } from '../utils/index.js' */
/**@import { Defaults } from '../renderer/index.js' */
/**@import { Caches, WebGLRenderPipelineDescriptor } from '../caches/index.js' */

import { assert } from '../utils/index.js'
import { MeshVertexLayout, Shader, Uniform, WebGLRenderDevice } from "../core/index.js";
import { updateTextureSampler } from "../function.js";
import { RawMaterial } from "../material/index.js";
import { Affine3 } from "../math/index.js";
import { Mesh, Attribute } from "../mesh/index.js";
import { MeshMaterial3D, Object3D } from "../objects/index.js";
import { Plugin, WebGLRenderer } from "../renderer/index.js";
import { Sampler, Texture } from "../texture/index.js";
import { PrimitiveTopology, TextureFormat } from '../constants/index.js';

export class MeshMaterialPlugin extends Plugin {

  /**
   * @override
   */
  init() { }

  /**
   * @override
   */
  preprocess() { }

  /**
   * @private
   * @type {Map<string,Map<PipelineKey, number>>}
   */
  materials = new Map()
  /**
   * @override
   * @param {Object3D} object
   * @param {WebGLRenderDevice} device
   * @param {WebGLRenderer} renderer
   */
  renderObject3D(object, device, renderer) {
    if (!(object instanceof MeshMaterial3D)) {
      return
    }
    const { caches, attributes, defaults } = renderer
    const { material, mesh, transform } = object
    const gpuMesh = caches.getMesh(device, mesh, attributes)
    const meshBits = createPipelineBitsFromMesh(mesh, object)
    const materialBits = material.getPipelineBits()
    const pipelineKey = createPipelineKey(gpuMesh.layoutHash, meshBits, materialBits)
    const pipeline = this.getMaterialRenderPipeline(device, caches, material, pipelineKey, () => {
      const meshBits = pipelineKey >> GeneralPipelineKeyShiftBits.MeshBits
      const meshLayout = caches.getMeshVertexLayout(gpuMesh.layoutHash)
      const { defines, includes } = renderer
      assert(meshLayout, "Mesh layout not available")
      const shaderdefs = getShaderDefs(meshLayout, meshBits, defines)
      /**
       * @type {WebGLRenderPipelineDescriptor}
       */
      const descriptor = {
        topology: mesh.topology,
        vertexLayout: meshLayout,
        vertex: new Shader({
          source: material.vertex()
        }),
        fragment: {
          source: new Shader({
            source: material.fragment()
          }),
          targets: [{
            format: TextureFormat.RGBA8Unorm
          }]
        }
      }

      for (const shaderdef of shaderdefs) {
        descriptor.vertex.defines.set(shaderdef[0], shaderdef[1])
        descriptor.fragment?.source?.defines?.set(shaderdef[0], shaderdef[1])
      }
      for (const [name, value] of includes) {
        descriptor.vertex.includes.set(name, value)
        descriptor.fragment?.source?.includes?.set(name, value)
      }

      material.specialize(descriptor)

      return descriptor
    })
    const modelInfo = pipeline.uniforms.get("model")
    const boneMatricesInfo = pipeline.uniforms.get("bone_transforms")
    const modeldata = new Float32Array([...Affine3.toMatrix4(transform.world)])
    const ubo = caches.uniformBuffers.get('MaterialBlock')

    pipeline.use(device.context)
    
    if (ubo) {
      const materialData = material.getData()
      ubo.update(device.context, materialData)
    }
    uploadTextures(device, material, pipeline.uniforms, caches, defaults)

    if (boneMatricesInfo && boneMatricesInfo.texture_unit !== undefined && object.skin) {
      device.context.activeTexture(WebGL2RenderingContext.TEXTURE0 + boneMatricesInfo.texture_unit)
      object.skin.bindMatrix.copy(object.transform.world)
      object.skin.inverseBindMatrix.copy(object.skin.bindMatrix).invert()
      object.skin.updateTexture()
      const texture = caches.getTexture(device, object.skin.boneTexture)

      device.context.bindTexture(object.skin.boneTexture.type, texture.inner)
      device.context.texParameteri(object.skin.boneTexture.type, WebGL2RenderingContext.TEXTURE_MIN_FILTER, WebGL2RenderingContext.LINEAR)
    }

    if (modelInfo) {
      device.context.uniformMatrix4fv(modelInfo.location, false, modeldata)
    }

    //drawing
    device.context.bindVertexArray(gpuMesh.inner)
    if (gpuMesh.indexType !== undefined) {
      device.context.drawElements(pipeline.topology,
        gpuMesh.count,
        gpuMesh.indexType, 0
      )
    } else {
      device.context.drawArrays(pipeline.topology, 0, gpuMesh.count)
    }
  }

  /**
   * @param {WebGLRenderDevice} device
   * @param {Caches} caches
   * @param {RawMaterial} material
   * @param {PipelineKey} key
   * @param {() => WebGLRenderPipelineDescriptor} compute
   */
  getMaterialRenderPipeline(device, caches, material, key, compute) {
    const name = material.constructor.name
    let materialCache = this.materials.get(name)

    if (!materialCache) {
      const newCache = new Map()

      materialCache = newCache
      this.materials.set(name, newCache)
    }

    const id = materialCache.get(key)

    if (id !== undefined) {
      const pipeline = caches.getRenderPipeline(id)
      if (pipeline) {
        return pipeline
      }
    }
    const descriptor = compute()
    const [newRenderPipeline, newId] = caches.createRenderPipeline(device, descriptor)

    materialCache.set(key, newId)
    return newRenderPipeline
  }
}

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
function keyFromTopology(mesh) {
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
 * @param {WebGLRenderDevice} device
 * @param {T} material 
 * @param {ReadonlyMap<string, Uniform>} uniforms
 * @param {Caches} caches
 * @param {Defaults} defaults
 */
function uploadTextures(device, material, uniforms, caches, defaults) {
  const textures = material.getTextures()

  for (let i = 0; i < textures.length; i++) {
    const [name, _, texture = defaults.texture2D, sampler = defaults.textureSampler] =
    /**@type {[string, number, Texture | undefined, Sampler | undefined]}*/(textures[i])
    const textureInfo = uniforms.get(name)

    if (textureInfo && textureInfo.texture_unit !== undefined) {
      const gpuTexture = caches.getTexture(device, texture)
      device.context.activeTexture(WebGL2RenderingContext.TEXTURE0 + textureInfo.texture_unit)
      device.context.bindTexture(texture.type, gpuTexture.inner)
      updateTextureSampler(device.context, texture, sampler)
    }
  }
}
/**
 * @param {MeshVertexLayout} meshLayout
 * @param {bigint} meshBits
 * @param {ReadonlyMap<string, string>} globalDefines
 */
function getShaderDefs(meshLayout, meshBits, globalDefines) {
  /**@type {[string,string][]} */
  const shaderdefs = []
  if (meshBits & MeshKey.Skinned) {
    shaderdefs.push(["SKINNED", ""])
  }

  if (meshLayout.hasAttribute(Attribute.UV)) {
    shaderdefs.push(['VERTEX_UVS', ''])
  }

  if (meshLayout.hasAttribute(Attribute.Normal)) {
    shaderdefs.push(['VERTEX_NORMALS', ''])
  }

  if (meshLayout.hasAttribute(Attribute.Tangent)) {
    shaderdefs.push(['VERTEX_TANGENTS', ''])
  }

  for (const [name, value] of globalDefines) {
    shaderdefs.push([name, value])
  }

  return shaderdefs
}

/**
 * @enum {bigint}
 */
export const GeneralPipelineKeyShiftBits = /**@type {const}*/({
  LayoutHashBits: 0n,
  MeshBits: 15n,
  MaterialBits: 47n
})
/**
 * @param {number} layoutHash
 * @param {bigint} meshBits
 * @param {bigint} materialBits
 */
function createPipelineKey(layoutHash, meshBits, materialBits) {
  const layoutHashBits = BigInt(layoutHash)
  return /**@type {PipelineKey}*/(
    layoutHashBits << GeneralPipelineKeyShiftBits.LayoutHashBits |
    meshBits << GeneralPipelineKeyShiftBits.MeshBits |
    (materialBits << GeneralPipelineKeyShiftBits.MaterialBits)
  )
}

/**
 * @typedef {Brand<bigint,"PipelineKey">} PipelineKey
 */