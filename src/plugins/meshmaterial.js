/**@import { Brand } from '../utils/index.js' */
/**@import { Defaults } from '../renderer/index.js' */
/**@import { Caches, WebGLRenderPipelineDescriptor } from '../caches/index.js' */

import { assert } from '../utils/index.js'
import { Shader, Uniform } from "../core/index.js";
import { updateTextureSampler } from "../function.js";
import { RawMaterial } from "../material/index.js";
import { Affine3 } from "../math/index.js";
import { Mesh, PrimitiveTopology, Attribute } from "../mesh/index.js";
import { MeshMaterial3D, Object3D } from "../objects/index.js";
import { Plugin, WebGLRenderer } from "../renderer/index.js";
import { Sampler, Texture, TextureFormat } from "../texture/index.js";

export class MeshMaterialPlugin extends Plugin {
  /**
   * @private
   * @type {Map<string,Map<PipelineKey, number>>}
   */
  materials = new Map()
  /**
   * @override
   * @param {Object3D} object
   * @param {WebGL2RenderingContext} context
   * @param {WebGLRenderer} renderer
   */
  renderObject3D(object, context, renderer) {
    if (!(object instanceof MeshMaterial3D)) {
      return
    }
    const { caches, attributes, defaults } = renderer
    const { material, mesh, transform } = object
    const blockName = material.constructor.name + 'Block'
    const gpuMesh = caches.getMesh(context, mesh, attributes)
    const meshBits = createPipelineBitsFromMesh(mesh, object)
    const materialBits = material.getPipelineBits()
    const pipelineKey = createPipelineKey(gpuMesh.layoutHash, meshBits, materialBits)
    const pipeline = this.getMaterialRenderPipeline(context, caches, material, pipelineKey, () => {
      const meshBits = pipelineKey >> GeneralPipelineKeyShiftBits.MeshBits
      const meshLayout = caches.getMeshVertexLayout(gpuMesh.layoutHash)
      const { defines, includes } = renderer

      assert(meshLayout, "Mesh layout not available")
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

      if (meshBits & MeshKey.Skinned) {
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
    const modelInfo = pipeline.uniforms.get("model")
    const boneMatricesInfo = pipeline.uniforms.get("bone_transforms")
    const modeldata = new Float32Array([...Affine3.toMatrix4(transform.world)])
    const ubo = caches.uniformBuffers.get(blockName)

    pipeline.use(context)

    if (ubo) {
      const materialData = material.getData()
      ubo.update(context, materialData)
    }
    uploadTextures(context, material, pipeline.uniforms, caches, defaults)

    if (boneMatricesInfo && boneMatricesInfo.texture_unit !== undefined && object.skin) {
      context.activeTexture(context.TEXTURE0 + boneMatricesInfo.texture_unit)
      object.skin.bindMatrix.copy(object.transform.world)
      object.skin.inverseBindMatrix.copy(object.skin.bindMatrix).invert()
      object.skin.updateTexture()
      const texture = caches.getTexture(context, object.skin.boneTexture)

      context.bindTexture(object.skin.boneTexture.type, texture)
      context.texParameteri(object.skin.boneTexture.type, context.TEXTURE_MIN_FILTER, context.LINEAR)
    }

    if (modelInfo) {
      context.uniformMatrix4fv(modelInfo.location, false, modeldata)
    }

    //drawing
    context.bindVertexArray(gpuMesh.object)
    if (gpuMesh.indexType !== undefined) {
      context.drawElements(pipeline.topology,
        gpuMesh.count,
        gpuMesh.indexType, 0
      )
    } else {
      context.drawArrays(pipeline.topology, 0, gpuMesh.count)
    }
  }

  /**
   * @param {WebGL2RenderingContext} context
   * @param {Caches} caches
   * @param {RawMaterial} material
   * @param {PipelineKey} key
   * @param {() => WebGLRenderPipelineDescriptor} compute
   */
  getMaterialRenderPipeline(context, caches, material, key, compute) {
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
    const [newRenderPipeline, newId] = caches.createRenderPipeline(context, descriptor)

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
 * @param {WebGL2RenderingContext} gl
 * @param {T} material 
 * @param {ReadonlyMap<string, Uniform>} uniforms
 * @param {Caches} caches
 * @param {Defaults} defaults
 */
function uploadTextures(gl, material, uniforms, caches, defaults) {
  const textures = material.getTextures()

  for (let i = 0; i < textures.length; i++) {
    const [name, _, texture = defaults.texture2D, sampler = defaults.textureSampler] =
    /**@type {[string, number, Texture | undefined, Sampler | undefined]}*/(textures[i])
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