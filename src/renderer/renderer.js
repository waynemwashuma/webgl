/**@import {PipelineKey} from '../material/index.js' */
import { DirectionalLight } from "../light/index.js"
import { Camera } from "../camera/camera.js"
import { TextureType } from "../constant.js"
import { Attribute, UBOs, WebGLRenderPipeline } from "../core/index.js"
import { AmbientLight } from "../light/index.js"
import { MeshMaterial3D, Object3D } from "../mesh/index.js"
import { commonShaderLib } from "../shader/index.js"
import { Texture } from "../texture/index.js"
import { Geometry } from "../geometry/index.js"
import { Material } from "../material/index.js"

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
   * @type {Map<Geometry, WebGLVertexArrayObject>}
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
  caches = new Caches()
  _UBOs = new UBOs()
  lights = new Lights()

  /**
   * @type {Object3D[]}
   */
  meshes = []

  /**
   * @type {Camera}
   */
  camera = new Camera()

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
    this.domElement = canvas || document.createElement("canvas")
    this.dpr = devicePixelRatio

    this.gl = canvas.getContext("webgl2")
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0)

    if (this.culling) {
      this.gl.enable(this.gl.CULL_FACE)
      this.gl.cullFace(this.gl.BACK)
    }
    if (this.depthTest) {
      this.gl.enable(this.gl.DEPTH_TEST)
    }
    if (this.alphaBlending) {
      this.gl.enable(this.gl.BLEND)
      this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA)
    }

    const attributes = new Map()

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
   * @param {Object3D} object 
   */
  add(object) {
    this.meshes.push(object)
  }
  /**
   * @param {Object3D} mesh
   */
  remove(mesh) {
    let id = this.meshes.indexOf(mesh)
    this.meshes.splice(id, 1)
  }
  clearMeshes() {
    this.meshes.length = 0
  }
  clear(color = true, depth = true, stencil = true) {
    let bit = 0
    if (color) bit |= this.gl.COLOR_BUFFER_BIT
    if (depth) bit |= this.gl.DEPTH_BUFFER_BIT
    if (stencil) bit |= this.gl.STENCIL_BUFFER_BIT
    this.gl.clear(bit)
  }
  update() {
    const { caches, attributes, defaultTexture, gl,_UBOs, defines, includes } = this
    this.clear()
    if (this.camera) {
      this.camera.update()
      this.updateUBO(this.camera.getData())
    }

    this.updateUBO(this.lights.ambientLight.getData())
    this.updateUBO(this.lights.directionalLights.getData())

    for (let i = 0; i < this.lights.directionalLights.lights.length; i++) {
      this.lights.directionalLights.lights[i].update()
    }

    for (let i = 0; i < this.meshes.length; i++) {
      const object = this.meshes[i]
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