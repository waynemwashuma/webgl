/**@import {PipelineKey} from '../material/index.js' */
import { DirectionalLight } from "../light/index.js"
import { Camera } from "../camera/index.js"
import { TextureType } from "../constant.js"
import { Attribute, UBOs, WebGLDeviceLimits, WebGLRenderPipeline } from "../core/index.js"
import { AmbientLight } from "../light/index.js"
import { MeshMaterial3D, Object3D } from "../objects/index.js"
import { commonShaderLib } from "../shader/index.js"
import { Texture } from "../texture/index.js"
import { Mesh } from "../mesh/index.js"

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

export class Renderer {
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
  
  /**
   * @type {HTMLCanvasElement}
   */
  domElement = null
  /**
   * @type {WebGL2RenderingContext}
   */
  gl = null
  dpr = 0
  culling = true
  depthTest = true
  alphaBlending = true
  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    const attributes = new Map()

    this.domElement = canvas || document.createElement("canvas")
    this.dpr = devicePixelRatio
    
    this.gl = canvas.getContext("webgl2")
    this.limits = new WebGLDeviceLimits(this.gl)
    
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
    this.defaultTexture = createDefaultTexture(this.gl)
    this.includes.set("common", commonShaderLib)
    this.defines.set("MAX_DIRECTIONAL_LIGHTS", "10")
  }
  
  /**
   * @param {{ name: any; data: any; }} dataForm
   */
  updateUBO(dataForm) {
    const { data, name } = dataForm
    const ubo = this._UBOs.get(name)
    
    if (!ubo) return
    
    ubo.update(this.gl, data)
  }
  
  /**
   * @param {Camera} camera
   */
  clear(camera) {
    const { gl: context } = this
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
    if (clearStencil.enabled){
      bit |= context.STENCIL_BUFFER_BIT
      context.stencilMask(0xFF)
      context.clearStencil(clearStencil.value)
    }
    context.clear(bit)
  }
  /**
   * @param {Object3D[]} objects
   * @param {Camera} camera
   */
  render(objects, camera) {
    const { caches, attributes, defaultTexture, gl, _UBOs, defines, includes } = this
    this.clear(camera)
    camera.update()
    this.updateUBO(camera.getData())
    
    this.updateUBO(this.lights.ambientLight.getData())
    this.updateUBO(this.lights.directionalLights.getData())
    
    for (let i = 0; i < this.lights.directionalLights.lights.length; i++) {
      this.lights.directionalLights.lights[i].update()
    }
    
    for (let i = 0; i < objects.length; i++) {
      const object = objects[i]
      object.update()
      object.traverseDFS((child) => {
        if (child instanceof MeshMaterial3D) {
          child.renderGL(gl, caches, _UBOs, attributes, defaultTexture, includes, defines)
        }
        return true
      })
    }
  }
  /**
   * @param {number} w
   * @param {number} h
   */
  setViewport(w, h) {
    let canvas = this.gl.canvas
    if (canvas instanceof HTMLCanvasElement) {
      canvas.style.width = w + "px"
      canvas.style.height = h + "px"
    }
    canvas.width = w * this.dpr
    canvas.height = h * this.dpr
    this.gl.viewport(0, 0,
      w * this.dpr,
      h * this.dpr
    )
  }
}

/**
 * @param {WebGL2RenderingContext} gl
 */
function createDefaultTexture(gl) {
  const width = 1
  const height = 1
  const pixel = new Uint8Array([255, 255, 255, 255])
  const texture = new Texture({
    width,
    height,
    data: [pixel],
    type: TextureType.Texture2D
  })
  return texture
}