import {
  MeshMaterial3D,
  BasicMaterial,
  CircleGeometry,
  BoxGeometry,
  UVSphereGeometry,
  IcosphereGeometry,
  CylinderGeometry,
  QuadGeometry,
  Quaternion,
  Renderer,
  TextureLoader,
  PerspectiveProjection,
  Camera
} from "webgllis"

const canvas = document.createElement('canvas')
const renderer = new Renderer(canvas)
const camera = new Camera()

document.body.append(canvas)
renderer.setViewport(innerWidth, innerHeight)

const textureLoader = new TextureLoader()
const texture = textureLoader.load({
  paths: ["./assets/uv.jpg"],
  textureSettings:{
    flipY:true
  }
})
const material = new BasicMaterial({
  mainTexture: texture
})
const meshes = [
  new QuadGeometry(1, 1),
  new CircleGeometry(0.7),
  new BoxGeometry(),
  new UVSphereGeometry(0.7),
  new IcosphereGeometry(0.7),
  new CylinderGeometry(0.7),
]

//create objects
const objects = meshes.map(mesh => new MeshMaterial3D(mesh, material))

//transform objects to thier positions
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


const rotation = Quaternion.fromEuler(Math.PI / 1000, Math.PI / 1000, 0)
requestAnimationFrame(update)

function update() {
  objects.forEach(object => object.transform.orientation.multiply(rotation))
  
  renderer.render(objects, camera)
  requestAnimationFrame(update)
}

addEventListener("resize", () => {
  renderer.setViewport(innerWidth, innerHeight)

  if (camera.projection instanceof PerspectiveProjection) {

    camera.projection.aspect = innerWidth / innerHeight
  }
})