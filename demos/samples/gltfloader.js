import {
  Renderer,
  PerspectiveProjection,
  GLTFLoader,
  Camera,
  Object3D
} from 'webgllis';

const canvas = document.createElement('canvas')
const renderer = new Renderer(canvas)
const camera = new Camera()

document.body.append(canvas)
renderer.setViewport(innerWidth, innerHeight)


/**
 * @type {Object3D[]}
 */
const objects = []
const loader = new GLTFLoader()
loader.asyncLoad({
  path: "assets/models/gltf/pirate_girl/index.gltf",
  name: "object"
}).then((group) => {
  const object = group.clone()

  objects.push(object)
})

camera.transform.position.z = 2
camera.transform.position.y = 2
if (camera.projection instanceof PerspectiveProjection) {
  camera.projection.fov = Math.PI / 180 * 120
  camera.projection.aspect = innerWidth / innerHeight
}

requestAnimationFrame(update)

function update() {
  renderer.render(objects, camera)
  requestAnimationFrame(update)
}

addEventListener("resize", () => {
  renderer.setViewport(innerWidth, innerHeight)

  if (camera.projection instanceof PerspectiveProjection) {

    camera.projection.aspect = innerWidth / innerHeight
  }
})