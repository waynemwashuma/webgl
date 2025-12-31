/** @import { WebGLRenderer } from "../renderer.js" */
import { GPUMesh, WebGLRenderDevice, WebGLRenderPipeline } from "../../core/index.js"
import { Affine3, Matrix4, Vector3 } from "../../math/index.js"
import { RenderTarget } from "../../rendertarget/index.js"

export class View {
  /**
   * @type {RenderItem[]}
   */
  renderList = []
  /**
   * @type {number}
   */
  order = 0
  /**
   * @type {RenderTarget}
   */
  renderTarget

  /**
   * @type {Matrix4}
   */
  projectionMatrix

  /**
   * @type {Matrix4}
   */
  viewMatrix

  /**
   * @type {Vector3}
   */
  viewPosition

  /**
   * @type {number}
   */
  near

  /**
   * @type {number}
   */
  far

  /**
   * @type {string}
   */
  tag

  /**
   * @param {ViewOptions} options
   */
  constructor({
    renderTarget,
    position,
    projection,
    view,
    near,
    far,
    tag
  }) {
    this.renderTarget = renderTarget
    this.near = near
    this.far = far
    this.tag = tag
    this.projectionMatrix = projection
    this.viewMatrix = view
    this.viewPosition = position
  }

  /**
   * @param {WebGLRenderDevice} device
   * @param {WebGLRenderer} renderer
   * @param {Map<string, UniformBinder>} uniformBinders
   */
  renderItems(device, renderer, uniformBinders) {
    const { renderList, renderTarget } = this
    const { clearColor, clearDepth, clearStencil, viewport, scissor } = renderTarget
    const framebuffer = renderer.caches.getFrameBuffer(device, renderTarget)

    framebuffer.setViewport(device.context, viewport, scissor || viewport)
    framebuffer.clear(device.context, clearColor, clearDepth, clearStencil)

    for (let i = 0; i < renderList.length; i++) {
      const { pipelineId, tag, mesh, uniforms, transform } = /**@type {RenderItem} */(renderList[i])
      const uniformBinder = uniformBinders.get(tag)
      const pipeline = renderer.caches.getRenderPipeline(pipelineId)

      if (!pipeline) {
        continue
      }

      const modelInfo = pipeline.uniforms.get("model")
      const transformMatrix = Affine3.toMatrix4(transform)

      pipeline.use(device.context)

      if (modelInfo) {
        device.context.uniformMatrix4fv(modelInfo.location, false, new Float32Array([...transformMatrix]))
      }

      if (uniformBinder) {
        uniformBinder(device, renderer, pipeline, uniforms, transformMatrix)
      }
      device.context.bindVertexArray(mesh.inner)
      if (mesh.indexType !== undefined) {
        device.context.drawElements(pipeline.topology,
          mesh.count,
          mesh.indexType,
          0
        )
      } else {
        device.context.drawArrays(pipeline.topology, 0, mesh.count)
      }
    }
  }

  getData() {
    return {
      name: "CameraBlock",
      data: new Float32Array([
        ...this.viewMatrix,
        ...this.projectionMatrix,
        ...this.viewPosition,
        this.near,
        this.far
      ]).buffer
    }
  }
}

export class RenderItem {

  /**
   * @type {number}
   */
  pipelineId

  /**
   * @type {GPUMesh}
   */
  mesh

  /**
   * @type {Record<string, any>}
   */
  uniforms

  /**
   * @type {string}
   */
  tag

  /**
   * @type {Affine3}
   */
  transform

  /**
   * @param {RenderItemOptions} options 
   */
  constructor({
    pipelineId,
    mesh,
    tag,
    uniforms,
    transform
  }) {
    this.pipelineId = pipelineId
    this.transform = transform
    this.mesh = mesh
    this.tag = tag
    this.uniforms = uniforms
  }
}

/**
 * @typedef ViewOptions
 * @property {RenderTarget} renderTarget
 * @property {Vector3} position
 * @property {Matrix4} projection
 * @property {Matrix4} view
 * @property {number} near
 * @property {number} far
 * @property {string} tag
 */

/**
 * @typedef RenderItemOptions
 * @property {Affine3} transform
 * @property {GPUMesh} mesh
 * @property {number} pipelineId
 * @property {Record<string, any>} uniforms
 * @property {string} tag
 */

/**
 * @callback UniformBinder
 * @param {WebGLRenderDevice} device
 * @param {WebGLRenderer} renderer
 * @param {WebGLRenderPipeline} pipeline
 * @param {any} bindGroup
 * @param {Matrix4} transform
 */