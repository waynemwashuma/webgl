import {
  MeshMaterial3D,
  LambertMaterial,
  UVSphereGeometry,
  Vector3,
  Quaternion,
  DirectionalLight,
  Renderer,
  TextureLoader,
  PerspectiveProjection
} from 'webgllis';

const canvas = document.createElement('canvas')
const renderer = new Renderer(canvas)

document.body.append(canvas)
renderer.setViewport(innerWidth, innerHeight)

const textureLoader = new TextureLoader()
const texture = textureLoader.load({
  paths: ["./assets/uv.jpg"]
})
const light = new DirectionalLight()
const origin = new MeshMaterial3D(
  new UVSphereGeometry(1),
  new LambertMaterial({
    mainTexture: texture,
  })
)

light.direction.set(0, -1, -1).normalize()
renderer.lights.ambientLight.intensity = 0.15
renderer.lights.directionalLights.add(light)
renderer.camera.transform.position.z = 2
if (renderer.camera.projection instanceof PerspectiveProjection) {
  renderer.camera.projection.fov = Math.PI / 180 * 120
  renderer.camera.projection.aspect = renderer.domElement.width / renderer.domElement.height
}
renderer.add(origin)

const rotation = Quaternion.fromEuler(Math.PI / 1000, Math.PI / 1000, 0)

requestAnimationFrame(update)

function update() {
  origin.transform.orientation.multiply(rotation)
  renderer.update()

  requestAnimationFrame(update)
}

addEventListener("resize", () => {
  renderer.setViewport(innerWidth, innerHeight)

  if (renderer.camera.projection instanceof PerspectiveProjection) {

    renderer.camera.projection.aspect = innerWidth / innerHeight
  }
})