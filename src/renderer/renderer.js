import { WebGLDeviceLimits, WebGLRenderDevice } from "../core/index.js"
import { Object3D, Camera } from "../objects/index.js"
import { commonShaderLib, lightShaderLib, mathShaderLib } from "../shader/index.js"
import { Sampler, Texture } from "../texture/index.js"
import { CanvasTarget } from "../rendertarget/canvastarget.js"
import { Color } from "../math/index.js"
import { ImageRenderTarget } from "../rendertarget/image.js"
import { assert, ViewRectangle } from '../utils/index.js'
import { Caches } from "../caches/index.js"
import { Attribute } from "../mesh/index.js"
import { Plugin } from "./plugin.js"
import { RenderTarget } from "../rendertarget/index.js"

export class WebGLRenderer {
  /**
   * @readonly
   * @type {WebGLDeviceLimits}
   */
  limits

  /**
   * @readonly
   * @type {Caches}
   */
  caches = new Caches()

  /**
   * @readonly
   */
  defaults = new Defaults()

  /**
   * @readonly
   * @type {ReadonlyMap<string,Attribute>}
   */
  attributes

  /**
   * @readonly
   * @type {Map<string, string>}
   */
  includes = new Map()

  /**
   * @readonly
   * @type {Map<string, string>}
   */
  defines = new Map()

  /**
   * @readonly
   * @type {readonly Plugin[]} 
   */
  plugins

  /**
   * @param {WebGLRendererOptions} options 
   */
  constructor({ plugins = [] } = {}) {
    const dummy = new OffscreenCanvas(100, 100)
    const context = dummy.getContext('webgl2')

    assert(context, "Webgl context creation failed")
    this.plugins = plugins
    this.limits = new WebGLDeviceLimits(context)
    this.attributes = new Map()
      .set(Attribute.Position.name, Attribute.Position)
      .set(Attribute.UV.name, Attribute.UV)
      .set(Attribute.UVB.name, Attribute.UVB)
      .set(Attribute.Normal.name, Attribute.Normal)
      .set(Attribute.Tangent.name, Attribute.Tangent)
      .set(Attribute.Color.name, Attribute.Color)
      .set(Attribute.JointIndex.name, Attribute.JointIndex)
      .set(Attribute.JointWeight.name, Attribute.JointWeight)

    for (let i = 0; i < plugins.length; i++) {
      const plugin = /**@type {Plugin} */ (plugins[i]);

      plugin.init(this)
    }
    this.includes
      .set("common", commonShaderLib)
      .set("light", lightShaderLib)
      .set("math", mathShaderLib)
  }

  /**
   * @param {{name: any;data: any;}} dataForm
   * @param {WebGL2RenderingContext} context
   */
  updateUBO(context, dataForm) {
    const { data, name } = dataForm
    const ubo = this.caches.uniformBuffers.get(name)

    if (!ubo) return

    ubo.update(context, data)
  }

  /**
   * @private
   * @param {WebGLRenderDevice} renderDevice
   * @param {Color | undefined} clearColor
   * @param {number | undefined} clearDepth
   * @param {number | undefined} clearStencil
   */
  clear(renderDevice, clearColor, clearDepth, clearStencil) {
    const { context } = renderDevice
    let bit = 0
    context.stencilMask(0xFF);

    if (clearColor) {
      const { r, g, b, a } = clearColor
      bit |= context.COLOR_BUFFER_BIT
      context.colorMask(true, true, true, true)
      context.clearColor(r, g, b, a)
    }
    if (clearDepth !== undefined) {
      bit |= context.DEPTH_BUFFER_BIT
      context.depthRange(0, 1)
      context.depthMask(true)
      context.clearDepth(clearDepth)
    }
    if (clearStencil !== undefined) {
      bit |= context.STENCIL_BUFFER_BIT
      context.stencilMask(0xFF)
      context.clearStencil(clearStencil)
    }
    context.clear(bit)
  }
  /**
   * @param {Object3D[]} objects
   * @param {WebGLRenderDevice} renderDevice 
   * @param {Camera} camera
   */
  render(objects, renderDevice, camera) {
    const { context } = renderDevice
    const { target: renderTarget } = camera

    this.setViewport(renderDevice, renderTarget)
    camera.update()
    for (let i = 0; i < objects.length; i++) {
      /**@type {Object3D} */ (objects[i]).traverseDFS((object) => {
      object.update()
      return true
    })
    }

    if (renderTarget) {
      const { clearColor, clearDepth, clearStencil } = renderTarget
      this.clear(renderDevice, clearColor, clearDepth, clearStencil)
    } else {
      this.clear(
        renderDevice,
        Color.BLACK,
        1,
        0
      )
    }

    for (let i = 0; i < this.plugins.length; i++) {
      const plugin = /**@type {Plugin} */ (this.plugins[i]);

      plugin.preprocess(objects, renderDevice, this)
    }

    this.updateUBO(context, camera.getData())

    for (let i = 0; i < this.plugins.length; i++) {
      const plugin = /**@type {Plugin} */(this.plugins[i]);
      for (let i = 0; i < objects.length; i++) {
        const object = /**@type {Object3D} */ (objects[i])
        object.traverseDFS((child) => {
          plugin.renderObject3D(child, renderDevice, this)
          return true
        })
      }
    }

    if (renderTarget) {
      this.resolveDepthTexture(renderDevice, renderTarget)
    }
  }

  /**
   * @param {WebGLRenderDevice} device
   * @param {RenderTarget} renderTarget
   */
  resolveDepthTexture(device, renderTarget) {
    if (renderTarget instanceof ImageRenderTarget) {
      const framebuffer = this.caches.getFrameBuffer(device, renderTarget) 

      if (framebuffer.depthBuffer && renderTarget.depthTexture) {
        device.copyRenderBufferToTexture(
          framebuffer.depthBuffer[0],
          framebuffer.depthBuffer[1],
          this.caches.getTexture(device, renderTarget.depthTexture)
        )
      }
    }
  }
  /**
   * @private
   * @param {WebGLRenderDevice} renderDevice
   * @param {CanvasTarget} [target]
   */
  setViewport(renderDevice, target) {
    const { canvas, context } = renderDevice

    if (!target) {
      context.bindFramebuffer(context.FRAMEBUFFER, null)
      context.disable(context.SCISSOR_TEST)
      context.viewport(0, 0, canvas.width, canvas.height)
      return
    }
    if (target instanceof ImageRenderTarget) {
      const buffer = this.caches.getFrameBuffer(renderDevice, target)

      context.bindFramebuffer(context.FRAMEBUFFER, buffer.buffer)
      context.enable(context.SCISSOR_TEST)
      this.setViewportScissor(context, target.viewport, target.scissor, target.width, target.height)
    } else if (target instanceof CanvasTarget) {
      context.bindFramebuffer(context.FRAMEBUFFER, null)
      context.enable(context.SCISSOR_TEST)
      this.setViewportScissor(context, target.viewport, target.scissor, canvas.width, canvas.height)
    }
  }

  /**
   * @param {WebGL2RenderingContext} context
   * @param {ViewRectangle} viewport
   * @param {ViewRectangle | undefined} scissors
   * @param {number} width
   * @param {number} height
   */
  setViewportScissor(context, viewport, scissors, width, height) {
    const { offset, size } = viewport

    if (scissors) {
      const { offset, size } = scissors
      context.scissor(
        offset.x * width,
        offset.y * height,
        size.x * width,
        size.y * height
      )
    } else {
      context.scissor(
        offset.x * width,
        offset.y * height,
        size.x * width,
        size.y * height
      )
    }

    context.viewport(
      offset.x * width,
      offset.y * height,
      size.x * width,
      size.y * height
    )
  }
}

/**
 * @typedef WebGLRendererOptions
 * @property {Plugin[]} [plugins]
 */

export class Defaults {
  texture2D = Texture.default()
  textureSampler = Sampler.default()
}