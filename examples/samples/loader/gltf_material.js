import {
  WebGLRenderer,
  PerspectiveProjection,
  GLTFLoader,
  Camera,
  WebGLCanvasSurface,
  MeshMaterialPlugin,
  OrbitCameraControls,
  TextureType,
  SkyBox,
  TextureLoader,
  DirectionalLight
} from 'webgllis';

// performance monitor
const stats = new Stats()
stats.showPanel(1)
document.body.append(stats.dom)
stats.dom.removeAttribute('style')
stats.dom.classList.add('performance-monitor')

const canvas = document.createElement('canvas')
const surface = new WebGLCanvasSurface(canvas)
const renderer = new WebGLRenderer({
  plugins:[
    new MeshMaterialPlugin()
  ]
})
// lighting
const light = new DirectionalLight()
light.direction.set(1, -1, -1).normalize()
light.intensity = 30
renderer.lights.ambientLight.intensity = 0.15
renderer.lights.directionalLights.add(light)

// camera and camera controls
const camera = new Camera()
const cameraControls = new OrbitCameraControls(camera)
document.body.append(canvas)
updateView()

const textureLoader = new TextureLoader()
const gltfLoader = new GLTFLoader()

const day = textureLoader.load({
  paths: [
    "/assets/images/skybox/miramar_right.png",
    "/assets/images/skybox/miramar_left.png",
    "/assets/images/skybox/miramar_top.png",
    "/assets/images/skybox/miramar_bottom.png",
    "/assets/images/skybox/miramar_back.png",
    "/assets/images/skybox/miramar_front.png",
  ],
  type: TextureType.TextureCubeMap,
})
const skyBox = new SkyBox({
  day
})
skyBox.transform.orientation.rotateY(Math.PI)

// The gltf model
const model = gltfLoader.load({
  paths: ["/assets/models/gltf/flight_helmet/index.gltf"]
})

cameraControls.distance = 0.8
cameraControls.offset.y = 0.5
if (camera.projection instanceof PerspectiveProjection) {
  camera.projection.fov = Math.PI / 180 * 75
  camera.projection.aspect = innerWidth / innerHeight
}

document.body.append(canvas)
updateView()
addEventListener("resize", updateView)
requestAnimationFrame(update)

function update() {
  stats.begin()
  renderer.render([model, skyBox], surface, camera)
  cameraControls.update()
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