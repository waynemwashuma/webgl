import {
  WebGLRenderer,
  PerspectiveProjection,
  GLTFLoader,
  Camera,
  Quaternion,
  WebGLRenderDevice,
  MeshMaterialPlugin,
  AmbientLight,
  LightPlugin,
  CanvasTarget
} from 'webgllis';

// performance monitor
const stats = new Stats()
stats.showPanel(1)
document.body.append(stats.dom)
stats.dom.removeAttribute('style')
stats.dom.classList.add('performance-monitor')

const canvas = document.createElement('canvas')
const renderTarget = new CanvasTarget(canvas)
const renderDevice = new WebGLRenderDevice(canvas,{
  depth:true
})
const renderer = new WebGLRenderer({
  plugins:[
    new LightPlugin(),
    new MeshMaterialPlugin()
  ]
})
const camera = new Camera(renderTarget)

// lights
const ambientLight = new AmbientLight()
document.body.append(canvas)
updateView()

const loader = new GLTFLoader()
const model = loader.load({
  paths: ["/assets/models/gltf/pirate_girl/index.gltf"]
})

camera.transform.position.z = 2
camera.transform.position.y = 2
if (camera.projection instanceof PerspectiveProjection) {
  camera.projection.fov = Math.PI / 180 * 120
  camera.projection.aspect = innerWidth / innerHeight
}

const rotation = Quaternion.fromEuler(0, Math.PI / 1000, 0)

document.body.append(canvas)
updateView()
addEventListener("resize", updateView)
requestAnimationFrame(update)

function update() {
  stats.begin()
  model.transform.orientation.multiply(rotation)
  renderer.render([model, ambientLight], renderDevice, camera)
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