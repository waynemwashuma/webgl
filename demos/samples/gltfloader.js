import {
  Renderer,
  PerspectiveProjection,
  GLTFLoader,
  Camera,
  Quaternion
} from 'webgllis';

const canvas = document.createElement('canvas')
const renderer = new Renderer(canvas)
const camera = new Camera()

document.body.append(canvas)
renderer.setViewport(innerWidth, innerHeight)

const loader = new GLTFLoader()
const model = loader.load({
  paths: ["assets/models/gltf/pirate_girl/index.gltf"]
})

camera.transform.position.z = 2
camera.transform.position.y = 2
if (camera.projection instanceof PerspectiveProjection) {
  camera.projection.fov = Math.PI / 180 * 120
  camera.projection.aspect = innerWidth / innerHeight
}
const rotation = Quaternion.fromEuler(0, Math.PI / 1000, 0)
requestAnimationFrame(update)

function update() {
  model.transform.orientation.multiply(rotation)
  renderer.render([model], camera)
  requestAnimationFrame(update)
}

addEventListener("resize", () => {
  renderer.setViewport(innerWidth, innerHeight)

  if (camera.projection instanceof PerspectiveProjection) {

    camera.projection.aspect = innerWidth / innerHeight
  }
})