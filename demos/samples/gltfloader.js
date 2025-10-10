import {
  Renderer,
  TextureLoader,
  PerspectiveProjection,
  GLTFLoader
} from 'webgllis';

const canvas = document.createElement('canvas')
const renderer = new Renderer(canvas)

document.body.append(canvas)
renderer.setViewport(innerWidth, innerHeight)

const objects = []
const loader = new GLTFLoader()
loader.asyncLoad({
  path: "assets/models/gltf/pirate_girl/index.gltf",
  name: "object"
}).then((group) => {
  const object = group.clone()

  objects.push(object)
})

renderer.camera.transform.position.z = 2
renderer.camera.transform.position.y = 2
if (renderer.camera.projection instanceof PerspectiveProjection) {
  renderer.camera.projection.fov = Math.PI / 180 * 120
  renderer.camera.projection.aspect = renderer.domElement.width / renderer.domElement.height
}

requestAnimationFrame(update)

function update() {
  renderer.render(objects)
  requestAnimationFrame(update)
}

addEventListener("resize", () => {
  renderer.setViewport(innerWidth, innerHeight)

  if (renderer.camera.projection instanceof PerspectiveProjection) {

    renderer.camera.projection.aspect = innerWidth / innerHeight
  }
})