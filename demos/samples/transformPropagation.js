import {
  MeshMaterial3D,
  LambertMaterial,
  BoxGeometry,
  Vector3,
  Quaternion,
  DirectionalLight,
  Renderer,
  TextureLoader,
  BasicMaterial,
  PerspectiveProjection
} from 'webgllis';

const canvas = document.createElement('canvas')
const renderer = new Renderer(canvas)

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
const geometry = new BoxGeometry(0.5, 0.5, 0.5)
const material = new BasicMaterial({
  mainTexture: texture
})
const parent = new MeshMaterial3D(geometry, material)
const child = new MeshMaterial3D(geometry, material)

child.transform.position.x = 1
renderer.camera.transform.position.z = 2
if (renderer.camera.projection instanceof PerspectiveProjection) {
  renderer.camera.projection.fov = Math.PI / 180 * 120
  renderer.camera.projection.aspect = renderer.domElement.width / renderer.domElement.height
}
parent.add(child)
renderer.add(parent)

const rotation = Quaternion.fromEuler(Math.PI / 1000, Math.PI / 1000, 0)

requestAnimationFrame(update)

function update() {
  parent.transform.orientation.multiply(rotation)

  renderer.update()
  requestAnimationFrame(update)
}

addEventListener("resize", () => {
  renderer.setViewport(innerWidth, innerHeight)

  if (renderer.camera.projection instanceof PerspectiveProjection) {

    renderer.camera.projection.aspect = innerWidth / innerHeight
  }
})