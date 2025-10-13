import {
  MeshMaterial3D,
  BasicMaterial,
  QuadGeometry,
  PrimitiveTopology,
  Renderer,
  PerspectiveProjection,
  Camera
} from "webgllis"

const canvas = document.createElement('canvas')
const renderer = new Renderer(canvas)
const camera = new Camera()

document.body.append(canvas)
renderer.setViewport(innerWidth, innerHeight)

const material = new BasicMaterial()
const meshes = [
  new QuadGeometry(),
  new QuadGeometry(),
  new QuadGeometry(),
  new QuadGeometry(),
  new QuadGeometry(),
  new QuadGeometry(),
  new QuadGeometry()
]
meshes[0].topology = PrimitiveTopology.Points
meshes[1].topology = PrimitiveTopology.Lines
meshes[2].topology = PrimitiveTopology.LineLoop
meshes[3].topology = PrimitiveTopology.LineStrip
meshes[4].topology = PrimitiveTopology.Triangles
meshes[5].topology = PrimitiveTopology.TriangleStrip
meshes[6].topology = PrimitiveTopology.TriangleFan

//create objects
const objects = meshes.map(object => new MeshMaterial3D(object, material))

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
camera.transform.position.z = 5
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