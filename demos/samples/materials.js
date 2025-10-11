import {
  MeshMaterial3D,
  BasicMaterial,
  LambertMaterial,
  PhongMaterial,
  BoxGeometry,
  UVSphereGeometry,
  Quaternion,
  DirectionalLight,
  Renderer,
  TextureLoader,
  PerspectiveProjection
} from "webgllis"

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
  paths: ["./assets/uv.jpg"]
})
const geometry1 = new BoxGeometry(1, 1)
const geometry2 = new UVSphereGeometry(0.7)
const materials = [
  new BasicMaterial({
    mainTexture: texture
  }),
  new LambertMaterial({
    mainTexture: texture
  }),
  new PhongMaterial({
    mainTexture: texture,
    specularShininess: 32,
    specularStrength: 0.5
  })
]

//create meshes
const meshes = materials.map(material => new MeshMaterial3D(geometry1, material))
  .concat(materials.map(material => new MeshMaterial3D(geometry2, material)))

//transform meshes to thier positions
meshes.forEach((mesh, i) => {
  const stepX = 1.6
  const stepY = 2
  const startX = -1.6
  const startY = 1.6
  const number = 3

  mesh.transform.position.x = startX + stepX * (i % number)
  mesh.transform.position.y = startY - Math.floor(i / number) * stepY
})

//set up the camera
renderer.camera.transform.position.z = 5
if (renderer.camera.projection instanceof PerspectiveProjection) {
  renderer.camera.projection.fov = Math.PI / 180 * 120
  renderer.camera.projection.aspect = renderer.domElement.width / renderer.domElement.height
}

//add meshes to the renderer
meshes.forEach(mesh => renderer.add(mesh))

const rotation = Quaternion.fromEuler(Math.PI / 1000, Math.PI / 1000, 0)

requestAnimationFrame(update)

function update() {
  meshes.forEach(mesh => mesh.transform.orientation.multiply(rotation))
  renderer.update()

  requestAnimationFrame(update)
}

addEventListener("resize", () => {
  renderer.setViewport(innerWidth, innerHeight)

  if (renderer.camera.projection instanceof PerspectiveProjection) {

    renderer.camera.projection.aspect = innerWidth / innerHeight
  }
})