import { DirectionalLight } from "../light/index.js"
import { WebGLDeviceLimits } from "../core/index.js"
import { AmbientLight } from "../light/index.js"
import { Object3D, Camera } from "../objects/index.js"
import { commonShaderLib, mathShaderLib } from "../shader/index.js"
import { Sampler, Texture } from "../texture/index.js"
import { WebGLCanvasSurface } from "../surface/webglsurface.js"
import { CanvasTarget } from "../rendertarget/canvastarget.js"
import { Color } from "../math/index.js"
import { ImageRenderTarget } from "../rendertarget/image.js"
import { assert, ViewRectangle } from '../utils/index.js'
import { Caches } from "../caches/index.js"
import { Attribute } from "../mesh/index.js"
import { Plugin } from "./plugin.js"

export class DirectionalLights {
  /**
   * @type {DirectionalLight[]}
   */
  lights = []
  maxNumber = 10

  /**
   * @param {DirectionalLight} light
   */
  add(light) {
    this.lights.push(light)
  }
  getData() {
    const buffer = [
      this.lights.length,
      0, 0, 0,
      ...this.lights.flatMap(light => light.pack())
    ]

    return {
      name: "DirectionalLightBlock",
      data: new Float32Array(buffer)
    }
  }
}
export class Lights {
  ambientLight = new AmbientLight()
  directionalLights = new DirectionalLights()
}

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
   * @type {Lights}
   */
  lights = new Lights()

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
    this.includes
      .set("common", commonShaderLib)
      .set("math", mathShaderLib)
    this.defines.set("MAX_DIRECTIONAL_LIGHTS", "10")
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
   * @param {WebGLCanvasSurface} surface
   * @param {Color | undefined} clearColor
   * @param {number | undefined} clearDepth
   * @param {number | undefined} clearStencil
   */
  clear(surface, clearColor, clearDepth, clearStencil) {
    const { context } = surface
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
   * @param {WebGLCanvasSurface} surface 
   * @param {Camera} camera
   */
  render(objects, surface, camera) {
    const { context } = surface
    const { target: renderTarget } = camera

    this.setViewport(surface, renderTarget)
    camera.update()

    if (renderTarget) {
      const { clearColor, clearDepth, clearStencil } = renderTarget
      this.clear(surface, clearColor, clearDepth, clearStencil)
    } else {
      this.clear(
        surface,
        Color.BLACK,
        1,
        0
      )
    }

    this.updateUBO(context, camera.getData())
    this.updateUBO(context, this.lights.ambientLight.getData())
    this.updateUBO(context, this.lights.directionalLights.getData())

    for (let i = 0; i < this.lights.directionalLights.lights.length; i++) {
      this.lights.directionalLights.lights[i]?.update()
    }

    for (let i = 0; i < this.plugins.length; i++) {
      const plugin = /**@type {Plugin} */(this.plugins[i]);
      for (let i = 0; i < objects.length; i++) {
        const object = /**@type {Object3D} */ (objects[i])
        object.update()
        object.traverseDFS((child) => {
          plugin.renderObject3D(child, context, this)
          return true
        })
      }
    }
  }

  /**
   * @private
   * @param {WebGLCanvasSurface} surface
   * @param {CanvasTarget} [target]
   */
  setViewport(surface, target) {
    const { canvas, context } = surface

    if (!target) {
      context.bindFramebuffer(context.FRAMEBUFFER, null)
      context.disable(context.SCISSOR_TEST)
      context.viewport(0, 0, canvas.width, canvas.height)
      return
    }
    if (target instanceof ImageRenderTarget) {
      const buffer = this.caches.getFrameBuffer(context, target)

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