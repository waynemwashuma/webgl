import {
  MeshMaterial3D,
  LambertMaterial,
  BoxGeometry,
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
const box = new MeshMaterial3D(
  new BoxGeometry(1, 1, 1),
  new LambertMaterial({
    mainTexture: texture
  })
)
renderer.camera.transform.position.z = 2
if (renderer.camera.projection instanceof PerspectiveProjection) {
  renderer.camera.projection.fov = Math.PI / 180 * 120
  renderer.camera.projection.aspect = renderer.domElement.width / renderer.domElement.height
}

const rotation = Quaternion.fromEuler(Math.PI / 1000, Math.PI / 1000, 0)

requestAnimationFrame(update)

function update() {
  box.transform.orientation.multiply(rotation)

  renderer.render([box])
  requestAnimationFrame(update)
}

addEventListener("resize", () => {
  renderer.setViewport(innerWidth, innerHeight)

  if (renderer.camera.projection instanceof PerspectiveProjection) {

    renderer.camera.projection.aspect = innerWidth / innerHeight
  }
})