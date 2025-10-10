import {
  MeshMaterial3D,
  BasicMaterial,
  QuadGeometry,
  PrimitiveTopology,
  Renderer,
  PerspectiveProjection
} from "webgllis"

const canvas = document.createElement('canvas')
const renderer = new Renderer(canvas)

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

//create meshes
const objects = meshes.map(mesh => new MeshMaterial3D(mesh, material))

//transform meshes to thier positions
objects.forEach((mesh, i) => {
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
objects.forEach(mesh => renderer.add(mesh))

requestAnimationFrame(update)

function update() {
  renderer.update()
  requestAnimationFrame(update)
}

addEventListener("resize", () => {
  renderer.setViewport(innerWidth, innerHeight)

  if (renderer.camera.projection instanceof PerspectiveProjection) {

    renderer.camera.projection.aspect = innerWidth / innerHeight
  }
})