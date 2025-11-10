/**@import { WebGLRenderPipelineDescriptor } from './renderpipeline.js' */
import { ImageRenderTarget } from "../rendertarget/index.js"
import { Texture } from "../texture/index.js"
import { Attribute, Mesh } from "../mesh/index.js"
import { GPUTexture, MeshVertexLayout, WebGLRenderDevice } from "../core/index.js"
import { ImageFrameBuffer } from "./framebuffer.js"
import { GPUMesh } from "./gpumesh.js"
import { WebGLRenderPipeline } from "./renderpipeline.js"
import { UniformBuffers } from "./uniformbuffers.js"

export class Caches {
  uniformBuffers = new UniformBuffers()
  /**
   * @type {Map<Mesh, GPUMesh>}
   */
  meshes = new Map()
  /**
   * @type {Map<Texture, GPUTexture>}
   */
  textures = new Map()
  /**
   * @type {WebGLRenderPipeline[]}
   */
  renderpipelines = []

  /**
   * @type {Map<ImageRenderTarget, ImageFrameBuffer>}
   */
  renderTargets = new Map()

  /**
   * @type {MeshVertexLayout[]}
   */
  meshLayouts = []

  /**
   * @param {WebGLRenderDevice} device
   * @param {ImageRenderTarget} target
   * @returns {ImageFrameBuffer}
   */
  getFrameBuffer(device, target) {
    const current = this.renderTargets.get(target)

    if (current) {
      return current
    }

    const newTarget = new ImageFrameBuffer(device, target, this)

    this.renderTargets.set(target, newTarget)
    return newTarget
  }

  /**
   * @param {WebGLRenderDevice} device
   * @param {Mesh} mesh
   * @param {ReadonlyMap<string, Attribute>} attributes
   */
  getMesh(device, mesh, attributes) {
    const gpuMesh = this.meshes.get(mesh)
    if (gpuMesh && !mesh.changed) {
      return gpuMesh
    }

    // TODO: Stop leaking memory, delete old gpu buffers
    const [layout, layoutId] = this.getLayout(mesh, attributes)
    const newMesh = new GPUMesh(device.context, mesh, layout, layoutId)
    this.meshes.set(mesh, newMesh)

    return newMesh
  }

  /**
   * @param {Mesh} mesh
   * @param {ReadonlyMap<string, Attribute>} attributes
   * @returns {[MeshVertexLayout, number]}
   */
  getLayout(mesh, attributes) {
    for (let i = 0; i < this.meshLayouts.length; i++) {
      const layout = /**@type {MeshVertexLayout} */(this.meshLayouts[i])
      if (layout.compatibleWithMesh(mesh)) {
        return [layout, i]
      }
    }
    const layout = MeshVertexLayout.fromMesh(mesh, attributes)
    const newId = this.meshLayouts.length

    this.meshLayouts.push(layout)

    return [layout, newId]
  }

  /**
   * @param {WebGLRenderDevice} device
   * @param {Texture} texture
   * @returns {GPUTexture}
   */
  getTexture(device, texture) {
    const gpuTexture = this.textures.get(texture)

    if (gpuTexture) {
      if (texture.changed){
        if(
          texture.data &&
          texture.type === gpuTexture.type &&
          texture.format === gpuTexture.actualFormat &&
          texture.width === gpuTexture.width &&
          texture.height === gpuTexture.height &&
          texture.depth === gpuTexture.depth
        ) {
          // non-structural change, no need to create new gpu texture
          device.writeTexture({
            texture: gpuTexture,
            data: texture.data
          })
          return gpuTexture
        }
      } else {
        return gpuTexture
      }
    }

    // TODO: Stop leaking memory, delete old gpu textures
    const newTex = device.createTexture({
      type: texture.type,
      format: texture.format,
      width: texture.width,
      height: texture.height
    })

    if (texture.data) {
      device.writeTexture({
        texture: newTex,
        data: texture.data
      })
    }

    if (texture.generateMipmaps) {
      device.context.generateMipmap(texture.type)
    }

    this.textures.set(texture, newTex)
    return newTex
  }

  /**
   * @param {WebGLRenderDevice} device
   * @param {WebGLRenderPipelineDescriptor} descriptor
   * @returns {[WebGLRenderPipeline, number]}
   */
  createRenderPipeline(device, descriptor) {
    const id = this.renderpipelines.length
    const pipeline = new WebGLRenderPipeline(device.context, descriptor)

    for (const [name, uboLayout] of pipeline.uniformBlocks) {
      const ubo = this.uniformBuffers.getorSet(device.context, name, uboLayout)
      const index = device.context.getUniformBlockIndex(pipeline.program, name)

      device.context.uniformBlockBinding(pipeline.program, index, ubo.point)
    }
    this.renderpipelines[id] = pipeline
    return [pipeline, id]
  }

  /**
   * @param {number} id
   * @returns {WebGLRenderPipeline | undefined}
   */
  getRenderPipeline(id) {
    return this.renderpipelines[id]
  }

  /**
   * @param {number} id
   */
  getMeshVertexLayout(id) {
    return this.meshLayouts[id]
  }
}