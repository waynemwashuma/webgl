/** @import { UniformBinder } from "./core/index.js" */
import { WebGLDeviceLimits, WebGLRenderDevice } from "../core/index.js"
import { Object3D, Camera } from "../objects/index.js"
import { commonShaderLib, lightShaderLib, mathShaderLib } from "../shader/index.js"
import { Sampler, Texture } from "../texture/index.js"
import { assert } from '../utils/index.js'
import { Caches } from "../caches/index.js"
import { Attribute } from "../mesh/index.js"
import { Plugin } from "./plugin.js"
import { View } from "./core/index.js"
import { Vector3 } from "../math/index.js"

export class WebGLRenderer {

  /**
   * @type {Map<string, unknown>}
   */
  resources = new Map()

  /**
   * @readonly
   * @type {WebGLDeviceLimits}
   */
  limits

  /**
   * @type {View[]}
   */
  views = []

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
   * @type {Map<string, UniformBinder>}
   */
  uniformBinders = new Map()

  /**
   * @type {Map<string, ViewFiller>}
   */
  viewFiller = new Map()

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
    this.viewFiller.set(Camera.name, fillCameraView)
    this.includes
      .set("common", commonShaderLib)
      .set("light", lightShaderLib)
      .set("math", mathShaderLib)
  }

  /**
   * @template {object} T
   * @param {T} item
   */
  setResource(item) {
    this.resources.set(item.constructor.name, item)
  }

  /**
   * @template T
   * @param {import("../loader/loader.js").Constructor<T>} item
   * @returns {T | undefined}
   */
  getResource(item) {
    return /**@type {T} */ (this.resources.get(item.name))
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
   * @param {Object3D[]} objects
   * @param {WebGLRenderDevice} renderDevice 
   * @param {Camera} camera
   */
  render(objects, renderDevice, camera) {
    this.views.length = 0

    for (let i = 0; i < objects.length; i++) {
      const object = /**@type {Object3D} */ (objects[i])

      object.traverseDFS((object) => {
        object.update()
        return true
      })
    }
    camera.update()

    for (let i = 0; i < this.plugins.length; i++) {
      const plugin = /**@type {Plugin} */ (this.plugins[i]);

      plugin.preprocess(objects, renderDevice, this)
    }

    const position = new Vector3(
      camera.transform.world.x,
      camera.transform.world.y,
      camera.transform.world.z
    )
    const cameraView = new View({
      renderTarget: camera.target,
      near: camera.near,
      far: camera.far,
      projection: camera.projection.asProjectionMatrix(camera.near, camera.far),
      view: camera.view,
      position,
      tag: Camera.name
    })

    this.views.push(cameraView)

    for (let i = 0; i < this.views.length; i++) {
      const view = /** @type {View} */ (this.views[i]);
      const fill = this.viewFiller.get(view.tag)

      if (fill) {
        fill(renderDevice, this, objects, this.plugins, view)
      }
    }

    for (let i = 0; i < this.views.length; i++) {
      const view = /**@type {View}*/(this.views[i]);

      this.updateUBO(renderDevice.context, view.getData())
      view.renderItems(renderDevice, this, this.uniformBinders)
    }
  }
}

/**
 * @callback ViewFiller
 * @param {WebGLRenderDevice} device
 * @param {WebGLRenderer} renderer
 * @param {readonly Object3D[]} objects
 * @param {readonly Plugin[]} plugins
 * @param {View} view
 * @return {void}
 */

/**
 * @type {ViewFiller}
 */
function fillCameraView(device, renderer, objects, plugins, view) {
  for (let i = 0; i < plugins.length; i++) {
    const plugin = /**@type {Plugin} */(plugins[i]);
    for (let i = 0; i < objects.length; i++) {
      const object = /**@type {Object3D} */ (objects[i])
      object.traverseDFS((child) => {
        const item = plugin.getRenderItem(child, device, renderer)

        if (item) {
          view.renderList.push(item)
        }
        return true
      })
    }
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