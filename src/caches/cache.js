import { createTexture, updateTextureData } from "../function.js"
import { ImageRenderTarget } from "../rendertarget/index.js"
import { Texture } from "../texture/index.js"
import { Attribute, Mesh } from "../mesh/index.js"
import { MeshVertexLayout } from "../core/index.js"
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
   * @type {Map<Texture, WebGLTexture>}
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
   * @param {WebGL2RenderingContext} context
   * @param {ImageRenderTarget} target
   * @returns {ImageFrameBuffer}
   */
  getFrameBuffer(context, target) {
    const current = this.renderTargets.get(target)

    if (current) {
      return current
    }

    const newTarget = new ImageFrameBuffer(context, target, this)

    this.renderTargets.set(target, newTarget)
    return newTarget
  }

  /**
   * @param {WebGL2RenderingContext} context
   * @param {Mesh} mesh
   * @param {ReadonlyMap<string, Attribute>} attributes
   */
  getMesh(context, mesh, attributes) {
    const gpuMesh = this.meshes.get(mesh)
    if (gpuMesh && !mesh.changed) {
      return gpuMesh
    }

    // TODO: Stop leaking memory, delete old gpu buffers
    const [layout, layoutId] = this.getLayout(mesh, attributes)
    const newMesh = new GPUMesh(context, mesh, layout, layoutId)
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
   * @param {WebGL2RenderingContext} context
   * @param {Texture} texture
   * @returns {WebGLTexture}
   */
  getTexture(context, texture) {
    const tex = this.textures.get(texture)

    if (tex) {
      if (texture.changed) {
        context.bindTexture(texture.type, tex)
        updateTextureData(context, texture)
      }
      return tex
    }
    const newTex = createTexture(context, texture)
    this.textures.set(texture, newTex)
    return newTex
  }

  /**
   * @param {WebGL2RenderingContext} context
   * @param {import("./renderpipeline.js").WebGLRenderPipelineDescriptor} descriptor
   * @returns {[WebGLRenderPipeline, number]}
   */
  createRenderPipeline(context, descriptor) {
    const id = this.renderpipelines.length
    const pipeline = new WebGLRenderPipeline(context, descriptor)

    for (const [name, uboLayout] of pipeline.uniformBlocks) {
      const ubo = this.uniformBuffers.getorSet(context, name, uboLayout)
      const index = context.getUniformBlockIndex(pipeline.program, name)

      context.uniformBlockBinding(pipeline.program, index, ubo.point)
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