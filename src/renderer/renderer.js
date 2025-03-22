import { Camera } from "../camera.js"
import { UBO } from "../core/index.js"
import { AmbientLight } from "../light/index.js"

export class Lights {
  ambientLight = new AmbientLight()
  directionalCount = 10
  pointCount = 5
  spotCount = 5
  directionalLights = []
  pointLights = []
  spotLights = []
}
export class Renderer {
  _ubocounter = 0
  _UBOs = {}
  lights = new Lights()
  meshes = []
  camera = new Camera()
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
    
    const cameraLayout = this.camera.getLayout()
    const ambientLightLayout = this.camera.getLayout()
    
    this.setGlobalUBO(cameraLayout.name, cameraLayout)
    this.setGlobalUBO(ambientLightLayout.name, ambientLightLayout)
  }
  setGlobalUBO(name, layout) {
    this._UBOs[name] = new UBO(
      this.gl,
      this.getUBOpoint(),
      layout.size
    )
  }
  getUBOpoint() {
    return this._ubocounter++;
  }
  updateUBO(dataForm) {
    const { data, name } = dataForm
    if (name in this._UBOs) {
      const ubo = this._UBOs[name]
      ubo.update(this.gl, data)
    }
  }
  
  add(mesh) {
    mesh.init(this.gl)
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
    for (var i = 0; i < this.meshes.length; i++) {
      this.meshes[i].update()
      this.meshes[i].renderGL(this.gl, this._UBOs)
    }
  }
  setViewport(w, h) {
    let canvas = this.gl.canvas
    canvas.style.width = w + "px"
    canvas.style.height = h + "px"
    canvas.width = w * this.dpr
    canvas.height = h * this.dpr
    this.gl.viewport(0, 0,
      w * this.dpr,
      h * this.dpr
    )
  }
}