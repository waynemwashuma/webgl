import {
  MeshMaterial3D,
  BoxGeometry,
  Quaternion,
  DirectionalLight,
  Renderer,
  TextureLoader,
  BasicMaterial,
  PerspectiveProjection,
  Camera
} from 'webgllis';

const canvas = document.createElement('canvas')
const renderer = new Renderer(canvas)
const camera = new Camera()

document.body.append(canvas)
renderer.setViewport(innerWidth, innerHeight)

const light = new DirectionalLight()
light.direction.set(0, -1, -1).normalize()
renderer.lights.ambientLight.intensity = 0.15
renderer.lights.directionalLights.add(light)

const textureLoader = new TextureLoader()
const texture = textureLoader.load({
  paths: ["./assets/uv.jpg"],
  textureSettings:{
    flipY:true
  }
})
const mesh = new BoxGeometry(0.5, 0.5, 0.5)
const material = new BasicMaterial({
  mainTexture: texture
})
const parent = new MeshMaterial3D(mesh, material)
const child = new MeshMaterial3D(mesh, material)

child.transform.position.x = 1
camera.transform.position.z = 2
if (camera.projection instanceof PerspectiveProjection) {
  camera.projection.fov = Math.PI / 180 * 120
  camera.projection.aspect = innerWidth / innerHeight
}
parent.add(child)

const rotation = Quaternion.fromEuler(Math.PI / 1000, Math.PI / 1000, 0)

requestAnimationFrame(update)

function update() {
  parent.transform.orientation.multiply(rotation)

  renderer.render([parent], camera)
  requestAnimationFrame(update)
}

addEventListener("resize", () => {
  renderer.setViewport(innerWidth, innerHeight)

  if (camera.projection instanceof PerspectiveProjection) {

    camera.projection.aspect = innerWidth / innerHeight
  }
})