import Stats from "stats.js"
import { GUI } from "dat.gui"
import {
  AmbientLight,
  Camera,
  CameraPlugin,
  CanvasTarget,
  Color,
  DirectionalLight,
  Fog,

  GLTFLoader,
  LightPlugin,
  MeshMaterialPlugin,
  OrbitCameraControls,
  PerspectiveProjection,
  WebGLRenderDevice,
  WebGLRenderer
} from "chorama"

const canvas = document.createElement("canvas")
const renderTarget = new CanvasTarget(canvas)
const renderDevice = new WebGLRenderDevice(canvas, {
  depth: true,
})
const renderer = new WebGLRenderer({
  renderDevice,
  plugins: [
    new CameraPlugin(),
    new LightPlugin(),
    new MeshMaterialPlugin(),
  ],
})

const camera = new Camera(renderTarget)
const cameraControls = new OrbitCameraControls(camera, canvas)
const gltfLoader = new GLTFLoader()
const scene = gltfLoader.load({
  paths: ["/models/gltf/sponza/Sponza.gltf"],
})

const fog = new Fog({
  color: new Color(0.72, 0.76, 0.8, 1),
  start: 1,
  end: 8,
  height: 3,
  heightFalloff: 2,
})
camera.fog = fog
camera.clearColor = fog.color.clone()
camera.near = 0.05
camera.far = 80

cameraControls.distance = 1
cameraControls.offset.x = -7
cameraControls.offset.y = 2
cameraControls.azimuth = -Math.PI / 2

const ambientLight = new AmbientLight()
ambientLight.intensity = 0.35

const directionalLight = new DirectionalLight()
directionalLight.intensity = 8
directionalLight.transform.orientation
  .rotateX(-Math.PI / 3)
  .rotateY(Math.PI / 4)

document.body.append(canvas)
updateView()
addEventListener("resize", updateView)
requestAnimationFrame(update)

function update() {
  stats.begin()
  cameraControls.update()
  renderer.render([scene, ambientLight, directionalLight, camera], renderDevice)
  stats.end()
  requestAnimationFrame(update)
}

function updateView() {
  canvas.style.width = innerWidth + "px"
  canvas.style.height = innerHeight + "px"
  canvas.width = innerWidth * devicePixelRatio
  canvas.height = innerHeight * devicePixelRatio

  if (camera.projection instanceof PerspectiveProjection) {
    camera.projection.aspect = innerWidth / innerHeight
  }
}

/**
 * @param {boolean} enabled
 */
function applyFogEnabled(enabled) {
  camera.fog = enabled ? fog : undefined
}

/**
 * @param {Color} color
 */
function applyFogColor(color) {
  fog.color.set(color.r / 255, color.g / 255, color.b / 255, fog.color.a)
  if (camera.clearColor) {
    camera.clearColor.set(color.r / 255, color.g / 255, color.b / 255, fog.color.a)
  } else {
    camera.clearColor = fog.color.clone()
  }
}

/**
 * @param {number} value
 */
function applyFogStart(value) {
  fog.start = value
}

/**
 * @param {number} value
 */
function applyFogEnd(value) {
  fog.end = value
}

/**
 * @param {number} value
 */
function applyFogHeight(value) {
  fog.height = value
}

/**
 * @param {number} value
 */
function applyFogHeightFalloff(value) {
  fog.heightFalloff = value
}

const settings = {
  enabled: true,
  color: fog.color.clone(),
  start: fog.start,
  end: fog.end,
  height: fog.height,
  heightFalloff: fog.heightFalloff,
}

const controls = new GUI()
const fogFolder = controls.addFolder("Fog")

fogFolder
  .add(settings, "enabled")
  .name("Enabled")
  .onChange(applyFogEnabled)
fogFolder
  .addColor(settings, "color")
  .name("Color")
  .onChange(applyFogColor)
fogFolder
  .add(settings, "start", 0, 60, 0.1)
  .name("Start")
  .onChange(applyFogStart)
fogFolder
  .add(settings, "end", 0, 60, 0.1)
  .name("End")
  .onChange(applyFogEnd)
fogFolder
  .add(settings, "height", 0, 20, 0.1)
  .name("Height")
  .onChange(applyFogHeight)
fogFolder
  .add(settings, "heightFalloff", 0, 10, 0.1)
  .name("Height Falloff")
  .onChange(applyFogHeightFalloff)

fogFolder.open()

// demo-only performance monitor
const stats = new Stats()
stats.showPanel(1)
document.body.append(stats.dom)
stats.dom.removeAttribute("style")
stats.dom.classList.add("performance-monitor")
