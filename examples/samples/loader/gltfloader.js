import {
  WebGLRenderer,
  PerspectiveProjection,
  GLTFLoader,
  Camera,
  Quaternion,
  WebGLCanvasSurface
} from 'webgllis';

const canvas = document.createElement('canvas')
const surface = new WebGLCanvasSurface(canvas)
const renderer = new WebGLRenderer()
const camera = new Camera()

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
  model.transform.orientation.multiply(rotation)
  renderer.render([model], surface, camera)
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