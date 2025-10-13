import {
  MeshMaterial3D,
  BasicMaterial,
  QuadGeometry,
  Quaternion,
  CullFace,
  Renderer,
  TextureLoader,
  PerspectiveProjection
} from "webgllis"

const canvas = document.createElement('canvas')
const renderer = new Renderer(canvas)

document.body.append(canvas)
renderer.setViewport(innerWidth, innerHeight)

const textureLoader = new TextureLoader()
const texture = textureLoader.load({
  paths: ["./assets/uv.jpg"]
})
const mesh = new QuadGeometry(1, 1)
const materials = [
  new BasicMaterial({
    mainTexture: texture
  }),
  new BasicMaterial({
    mainTexture: texture
  }),
  new BasicMaterial({
    mainTexture: texture
  }),
  new BasicMaterial({
    mainTexture: texture
  })
]

materials[0].cullFace = CullFace.None
materials[1].cullFace = CullFace.Front
materials[2].cullFace = CullFace.Back
materials[3].cullFace = CullFace.FrontAndBack

//create objects
const objects = materials.map(material => new MeshMaterial3D(mesh, material))

//transform objects to their positions
objects.forEach((object, i) => {
  const stepX = 1.6
  const stepY = 2
  const startX = -1.6
  const startY = 1.6
  const number = 3

  object.transform.position.x = startX + stepX * (i % number)
  object.transform.position.y = startY - Math.floor(i / number) * stepY
})

//set up the camera
renderer.camera.transform.position.z = 5

if (renderer.camera.projection instanceof PerspectiveProjection) {
  renderer.camera.projection.fov = Math.PI / 180 * 120
  renderer.camera.projection.aspect = renderer.domElement.width / renderer.domElement.height
}

const rotation = Quaternion.fromEuler(Math.PI / 1000, Math.PI / 1000, 0)

requestAnimationFrame(update)

function update() {
  objects.forEach(object => object.transform.orientation.multiply(rotation))
  renderer.render(objects)
  requestAnimationFrame(update)
}

addEventListener("resize", () => {
  renderer.setViewport(innerWidth, innerHeight)

  if (renderer.camera.projection instanceof PerspectiveProjection) {

    renderer.camera.projection.aspect = innerWidth / innerHeight
  }
})