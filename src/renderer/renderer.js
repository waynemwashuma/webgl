import { Camera } from "../camera.js"
import { GlDataType, TextureFilter, TextureFormat, TextureWrap } from "../constant.js"
import { Attribute, UBO, UBOs } from "../core/index.js"
import { AmbientLight } from "../light/index.js"
import { Mesh } from "../mesh/index.js"
import { commonShaderLib } from "../shader/index.js"
import { Texture } from "../texture/index.js"

export class DirectionalLights {
  lights = []
  maxNumber = 10

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
      name: this.constructor.name,
      data: new Float32Array(buffer)
    }
  }
}
export class Lights {
  ambientLight = new AmbientLight()
  directionalLights = new DirectionalLights()
}

export class Renderer {
  _UBOs = new UBOs()
  lights = new Lights()

  /**
   * @type {Mesh[]}
   */
  meshes = []

  /**
   * @type {Camera}
   */
  camera = new Camera()

  /**
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

    this.attributes = attributes
    this.defaultTexture = createDefaultTexture(this.gl)
    this.includes.set("common", commonShaderLib)
    this.defines.set("MAX_DIRECTIONAL_LIGHTS","10")
  }
  
  updateUBO(dataForm) {
    const { data, name } = dataForm
    const ubo = this._UBOs.get(name)

    if (!ubo) return

    ubo.update(this.gl, data)
  }

  /**
   * @param {Mesh} mesh 
   */
  add(mesh) {
    mesh.init(this.gl, this._UBOs, this.attributes, this.includes, this.defines)
    this.meshes.push(mesh)
  }
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
    this.clear()
    if (this.camera) {
      this.camera.updateMatrix()
      this.updateUBO(this.camera.getData())
    }

    this.updateUBO(this.lights.ambientLight.getData())
    this.updateUBO(this.lights.directionalLights.getData())

    for (var i = 0; i < this.lights.directionalLights.lights.length; i++) {
      this.lights.directionalLights.lights[i].update()
    }

    for (var i = 0; i < this.meshes.length; i++) {
      this.meshes[i].update()
      this.meshes[i].renderGL(this.gl, this.defaultTexture)
    }
  }
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
 * @param {WebGLRenderingContext} gl
 */
function createDefaultTexture(gl) {
  const texture = gl.createTexture()
  const level = 0
  const width = 1
  const height = 1
  const border = 0
  const pixel = new Uint8Array([255, 255, 255, 255])

  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texImage2D(
    gl.TEXTURE_2D,
    level,
    TextureFormat.RGBA,
    width,
    height,
    border,
    TextureFormat.RGBA,
    GlDataType.UNSIGNED_BYTE,
    pixel,
  )
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, TextureWrap.CLAMP)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, TextureWrap.CLAMP)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, TextureFilter.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, TextureFilter.LINEAR)

  return new Texture(texture)
}