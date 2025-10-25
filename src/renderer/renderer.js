/**@import {PipelineKey} from '../material/index.js' */
import { DirectionalLight } from "../light/index.js"
import { Camera } from "../camera/index.js"
import { TextureType } from "../constant.js"
import { Attribute, UBOs, WebGLDeviceLimits, WebGLExtensions, WebGLRenderPipeline } from "../core/index.js"
import { AmbientLight } from "../light/index.js"
import { MeshMaterial3D, Object3D } from "../objects/index.js"
import { commonShaderLib } from "../shader/index.js"
import { Texture } from "../texture/index.js"
import { Mesh } from "../mesh/index.js"
import { WebGLCanvasSurface } from "../surface/webglsurface.js"
import { CanvasTarget } from "../rendertarget/canvastarget.js"

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

export class Caches {
  /**
   * @type {Map<Mesh, WebGLVertexArrayObject>}
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
   * @type {Map<string,Map<PipelineKey, number>>}
   */
  materials = new Map()
}

export class WebGLRenderer {
  limits
  caches = new Caches()
  _UBOs = new UBOs()
  lights = new Lights()

  /**
   * @readonly
   * @type {Texture}
   */
  defaultTexture

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
  dpr = 0
  culling = true
  depthTest = true
  alphaBlending = true

  constructor() {
    const dummy = new OffscreenCanvas(100, 100)
    const context = dummy.getContext('webgl2')
    const attributes = new Map()
    this.dpr = devicePixelRatio
    this.limits = new WebGLDeviceLimits(context)

    attributes
      .set(Attribute.Position.name, Attribute.Position)
      .set(Attribute.UV.name, Attribute.UV)
      .set(Attribute.UVB.name, Attribute.UVB)
      .set(Attribute.Normal.name, Attribute.Normal)
      .set(Attribute.Tangent.name, Attribute.Tangent)
      .set(Attribute.Color.name, Attribute.Color)
      .set(Attribute.JointIndex.name, Attribute.JointIndex)
      .set(Attribute.JointWeight.name, Attribute.JointWeight)

    this.attributes = attributes
    this.defaultTexture = createDefaultTexture()
    this.includes.set("common", commonShaderLib)
    this.defines.set("MAX_DIRECTIONAL_LIGHTS", "10")
  }

  /**
   * @param {{name: any;data: any;}} dataForm
   * @param {WebGL2RenderingContext} context
   */
  updateUBO(context, dataForm) {
    const { data, name } = dataForm
    const ubo = this._UBOs.get(name)

    if (!ubo) return

    ubo.update(context, data)
  }

  /**
   * @param {Camera} camera
   * @param {WebGLCanvasSurface} surface 
   */
  clear(camera, surface) {
    const { context } = surface
    const { clearColor, clearDepth, clearStencil } = camera
    let bit = 0
    context.stencilMask(0xFF);

    if (clearColor.enabled) {
      const { r, g, b, a } = clearColor.value
      bit |= context.COLOR_BUFFER_BIT
      context.colorMask(true, true, true, true)
      context.clearColor(r, g, b, a)
    }
    if (clearDepth.enabled) {
      bit |= context.DEPTH_BUFFER_BIT
      context.depthMask(true)
      context.clearDepth(clearDepth.value)
    }
    if (clearStencil.enabled) {
      bit |= context.STENCIL_BUFFER_BIT
      context.stencilMask(0xFF)
      context.clearStencil(clearStencil.value)
    }
    context.clear(bit)
  }
  /**
   * @param {Object3D[]} objects
   * @param {WebGLCanvasSurface} surface 
   * @param {Camera} camera
   */
  render(objects, surface, camera) {
    const { canvas, context } = surface
    const { target: renderTarget } = camera
    const { caches, attributes, defaultTexture, _UBOs, defines, includes } = this

    camera.update()

    this.setViewport(surface, renderTarget)
    this.clear(camera, surface)
    this.updateUBO(context, camera.getData())

    this.updateUBO(context, this.lights.ambientLight.getData())
    this.updateUBO(context, this.lights.directionalLights.getData())

    for (let i = 0; i < this.lights.directionalLights.lights.length; i++) {
      this.lights.directionalLights.lights[i].update()
    }

    for (let i = 0; i < objects.length; i++) {
      const object = objects[i]
      object.update()
      object.traverseDFS((child) => {
        if (child instanceof MeshMaterial3D) {
          child.renderGL(context, caches, _UBOs, attributes, defaultTexture, includes, defines)
        }
        return true
      })
    }
  }
  /**
   * @private
   * @param {WebGLCanvasSurface} surface
   * @param {CanvasTarget} [target]
   */
  setViewport(surface, target) {
    const { canvas, context } = surface

    if (target) {
      context.enable(context.SCISSOR_TEST)
      const { offset, size } = target.viewport
      if (target.scissor) {
        const { offset, size } = target.scissor
        context.scissor(offset.x, offset.y, size.x, size.y)
      } else{
        context.scissor(offset.x, offset.y, size.x, size.y)
      }
      context.viewport(offset.x, offset.y, size.x, size.y)
    } else {
      context.disable(context.SCISSOR_TEST)
      context.viewport(0, 0, canvas.width, canvas.height)
    }
  }
}

function createDefaultTexture() {
  const width = 1
  const height = 1
  const pixel = new Uint8Array([255, 255, 255, 255])
  const texture = new Texture({
    width,
    height,
    data: pixel.buffer,
    type: TextureType.Texture2D
  })
  return texture
}